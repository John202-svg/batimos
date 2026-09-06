// Edge Function CRON - Vérifie chaque jour à 00h les abonnements expirés
// À appeler via Supabase Cron: 0 0 * * * (tous les jours minuit)
// Ou via pg_cron directement dans Postgres

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const now = new Date()
  console.log(`[CRON] Check subscriptions at ${now.toISOString()}`)

  // 1. RAPPEL ÉCHÉANCE: Subscriptions ACTIVE dont current_period_end < now (fin du mois passée)
  const { data: expired } = await supabase
    .from('subscriptions')
    .select('*, families(name), family_members!inner(user_id, profiles!inner(email, full_name))')
    .eq('status', 'ACTIVE')
    .lt('current_period_end', now.toISOString())

  for (const sub of expired || []) {
    // Passe en PAST_DUE et envoie rappel J0
    await supabase.from('subscriptions').update({
      status: 'PAST_DUE',
      updated_at: now.toISOString()
    }).eq('id', sub.id)

    // Crée notification + email pour tous les admins de la famille
    const admins = sub.family_members.filter((fm:any)=>true) // filtrer parent_admin côté query si besoin
    
    for (const member of sub.family_members || []) {
      await supabase.from('notifications').insert({
        family_id: sub.family_id,
        user_id: member.user_id,
        type: 'subscription_payment_due',
        title: 'Votre abonnement a expiré - Renouvellement requis',
        body: `Votre abonnement Premium Famille a expiré le ${new Date(sub.current_period_end).toLocaleDateString('fr-FR')}. Renouvelez maintenant pour éviter la déconnexion dans 7 jours.`
      })
    }

    // Envoie email via Resend (à implémenter dans une queue ou direct)
    // await sendEmail({ to: adminEmail, template: 'payment_due' })

    // Audit log
    await supabase.from('audit_logs').insert({
      family_id: sub.family_id,
      action: 'subscription.expired_reminder_sent',
      entity_type: 'subscription',
      entity_id: sub.id,
      metadata: { current_period_end: sub.current_period_end }
    })

    console.log(`[REMINDER] Sent to family ${sub.family_id}`)
  }

  // 2. DÉCONNEXION APRÈS 7 JOURS: PAST_DUE depuis >7j → EXPIRED + bloque accès
  const sevenDaysAgo = new Date(now.getTime() - 7*24*3600*1000)
  const { data: toExpire } = await supabase
    .from('subscriptions')
    .select('*, families(name)')
    .eq('status', 'PAST_DUE')
    .lt('current_period_end', sevenDaysAgo.toISOString())

  for (const sub of toExpire || []) {
    await supabase.from('subscriptions').update({
      status: 'EXPIRED',
      updated_at: now.toISOString()
    }).eq('id', sub.id)

    // Notification déconnexion
    const { data: members } = await supabase.from('family_members').select('user_id').eq('family_id', sub.family_id)
    for (const m of members || []) {
      await supabase.from('notifications').insert({
        family_id: sub.family_id,
        user_id: m.user_id,
        type: 'subscription_expired_disconnected',
        title: 'Compte déconnecté - Abonnement expiré depuis 7 jours',
        body: 'Votre espace familial est temporairement suspendu. Payez maintenant pour réactiver immédiatement l'accès à toutes vos données.'
      })
    }

    await supabase.from('audit_logs').insert({
      family_id: sub.family_id,
      action: 'subscription.expired_disconnected',
      entity_type: 'subscription',
      entity_id: sub.id,
      metadata: { disconnected_at: now.toISOString(), grace_period: '7 days' }
    })

    console.log(`[DISCONNECT] Family ${sub.family_id} disconnected after 7d grace`)
  }

  // 3. RAPPELS INTERMÉDIAIRES: J+3 et J+6 pendant grace period
  const threeDaysAgo = new Date(now.getTime() - 3*24*3600*1000)
  const { data: threeDays } = await supabase
    .from('subscriptions')
    .select('family_id, current_period_end')
    .eq('status', 'PAST_DUE')
    .gte('current_period_end', new Date(now.getTime() - 4*24*3600*1000).toISOString())
    .lt('current_period_end', threeDaysAgo.toISOString())

  for (const sub of threeDays || []) {
    // Évite doublon: vérifie si notif J+3 déjà envoyée via audit_logs
    const { data: existing } = await supabase.from('audit_logs')
      .select('id').eq('family_id', sub.family_id)
      .eq('action', 'subscription.reminder_j3')
      .gte('created_at', threeDaysAgo.toISOString())
    
    if(!existing || existing.length===0){
      const { data: members } = await supabase.from('family_members').select('user_id').eq('family_id', sub.family_id)
      for (const m of members || []) {
        await supabase.from('notifications').insert({
          family_id: sub.family_id,
          user_id: m.user_id,
          type: 'subscription_reminder_j3',
          title: 'Rappel J+3: Il reste 4 jours avant déconnexion',
          body: 'Votre abonnement est expiré depuis 3 jours. Renouvelez avant J+7 pour éviter la suspension.'
        })
      }
      await supabase.from('audit_logs').insert({
        family_id: sub.family_id,
        action: 'subscription.reminder_j3',
        entity_type: 'subscription'
      })
    }
  }

  return new Response(JSON.stringify({
    processed: {
      reminders_sent: expired?.length||0,
      disconnected: toExpire?.length||0
    }
  }), { status: 200 })
})
