import { createClient } from '@/lib/supabase/server'
export default async function SubscriptionPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: fm } = await supabase.from('family_members').select('family_id, role').eq('user_id', user!.id).single()
  const { data: sub } = await supabase.from('subscriptions').select('*, subscription_plans(*)').eq('family_id', fm!.family_id).single()
  const trialDays = sub ? Math.max(0, Math.ceil((new Date(sub.trial_end).getTime() - Date.now())/(1000*3600*24))) : 0
  const isTrialing = sub?.status === 'TRIALING'
  const isAdmin = fm!.role === 'parent_admin'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Abonnement & Paiement Paystack</h1>
      <p className="text-slate-500">Machine d'état: TRIALING → ACTIVE → PAST_DUE → CANCELLED → EXPIRED</p>

      <div className="mt-8 bg-white rounded-[28px] border p-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-slate-500">Plan actuel</div>
            <div className="text-2xl font-bold mt-1">Premium Famille</div>
            <div className="mt-2 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs border ${isTrialing ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>{sub?.status}</span>
              {isTrialing && <span className="px-3 py-1 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">{trialDays} jours restants</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">$10<span className="text-sm font-normal text-slate-500">/mois</span></div>
            <div className="text-xs text-slate-400 mt-1">Facturation Paystack</div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-2 text-sm">
            {['TRIALING','ACTIVE','PAST_DUE','CANCELLED','EXPIRED'].map((s,i)=>(
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${sub?.status===s ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>{i+1}</div>
                <span className={sub?.status===s ? 'font-bold' : 'text-slate-400'}>{s}</span>
                {i<4 && <div className="w-8 h-0.5 bg-slate-200 mx-2"></div>}
              </div>
            ))}
          </div>
        </div>

        {isTrialing && isAdmin && (
          <div className="mt-8 bg-indigo-600 rounded-[20px] p-6 text-white">
            <h3 className="font-bold text-lg">Passez à Premium avant la fin de l'essai</h3>
            <p className="text-indigo-200 text-sm mt-1">Votre essai expire le {new Date(sub.trial_end).toLocaleDateString('fr-FR')}. Aucune interruption de service.</p>
            <form action={async ()=>{
              'use server'
              // Ici tu appelles ton API /api/paystack/initialize avec family_id en metadata
              // Paystack va créer customer + subscription + webhook charge.success → ACTIVE
            }}>
              <button className="mt-4 bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold">Activer Premium - Paystack $10/mois</button>
            </form>
            <p className="text-[11px] text-indigo-300 mt-3">Webhook vérifié HMAC + idempotence par paystack_event_id (ton Module 20)</p>
          </div>
        )}

        {!isAdmin && <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">Seul Parent Admin peut gérer l'abonnement (RBAC)</div>}

        <div className="mt-8 border-t pt-6">
          <h4 className="font-semibold">Historique paiements (payment_events)</h4>
          <div className="mt-3 text-sm text-slate-500">Les webhooks Paystack sont loggés avec idempotence. Paiements échoués → PAST_DUE → notification.</div>
        </div>
      </div>
    </div>
  )
}
