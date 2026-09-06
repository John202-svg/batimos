// Edge Function - Paystack Webhook AVEC RÉACTIVATION AUTO
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const secret = Deno.env.get("PAYSTACK_SECRET_KEY")!
  const bodyText = await req.text()
  const hash = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(secret + bodyText))
  const expected = Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('')
  const signature = req.headers.get("x-paystack-signature")
  if (signature !== expected) return new Response("Invalid signature", {status:401})

  const event = JSON.parse(bodyText)
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)

  // Idempotence
  const { data: existing } = await supabase.from('payment_events').select('id').eq('paystack_event_id', event.id.toString()).single()
  if (existing) return new Response("Already processed", {status:200})

  const familyId = event.data?.metadata?.family_id
  if (!familyId) return new Response("Missing family_id", {status:400})

  await supabase.from('payment_events').insert({
    family_id: familyId,
    paystack_event_id: event.id.toString(),
    event_type: event.event,
    payload: event
  })

  if (event.event === 'charge.success') {
    // RÉACTIVATION IMMÉDIATE - Ton exigence: lorsqu'il paye il faut de nouveau l'activer
    const { data: currentSub } = await supabase.from('subscriptions').select('*').eq('family_id', familyId).single()
    const wasBlocked = currentSub?.status === 'EXPIRED' || currentSub?.status === 'PAST_DUE'
    
    await supabase.from('subscriptions').update({
      status: 'ACTIVE',
      current_period_end: new Date(Date.now()+30*24*3600*1000).toISOString(), // +30j
      updated_at: new Date().toISOString()
    }).eq('family_id', familyId)

    // Notif réactivation
    const { data: members } = await supabase.from('family_members').select('user_id').eq('family_id', familyId)
    for (const m of members || []) {
      await supabase.from('notifications').insert({
        family_id: familyId,
        user_id: m.user_id,
        type: wasBlocked ? 'subscription_reactivated' : 'subscription_renewed',
        title: wasBlocked ? 'Compte réactivé - Bienvenue à nouveau !' : 'Abonnement renouvelé avec succès',
        body: wasBlocked ? 'Votre espace familial est de nouveau actif. Toutes vos données sont restaurées.' : 'Votre abonnement Premium a été renouvelé pour 30 jours.'
      })
    }

    await supabase.from('audit_logs').insert({
      family_id: familyId,
      action: wasBlocked ? 'subscription.reactivated_after_payment' : 'subscription.renewed',
      entity_type: 'subscription',
      metadata: { event_id: event.id, was_blocked: wasBlocked }
    })

    console.log(`[REACTIVATED] Family ${familyId} - wasBlocked: ${wasBlocked}`)
  }

  if (event.event === 'invoice.payment_failed') {
    await supabase.from('subscriptions').update({ status: 'PAST_DUE' }).eq('family_id', familyId)
  }

  return new Response("OK", {status:200})
})
