'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function BlockedPage(){
  const [familyId, setFamilyId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
      if(fm) setFamilyId(fm.family_id)
    })()
  },[])

  async function handlePay(){
    setLoading(true)
    const res = await fetch('/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ family_id: familyId })
    })
    const data = await res.json()
    if(data.data?.authorization_url){
      window.location.href = data.data.authorization_url
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-[28px] p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">🔒</div>
        <h1 className="text-2xl font-bold mt-4">Compte temporairement suspendu</h1>
        <p className="text-slate-500 mt-3 text-sm">
          Votre abonnement Premium Famille a expiré depuis plus de 7 jours.<br/>
          Votre espace familial est suspendu pour protéger nos services.<br/>
          <span className="font-medium text-slate-700">Toutes vos données sont conservées en sécurité.</span>
        </p>

        <div className="mt-6 bg-slate-50 rounded-2xl p-4 text-left text-sm">
          <div className="font-semibold">Que se passe-t-il ?</div>
          <ul className="mt-2 list-disc ml-5 space-y-1 text-slate-600">
            <li>Fin du mois: échéance dépassée → Rappel envoyé</li>
            <li>J+3: Rappel "Il reste 4 jours avant déconnexion"</li>
            <li>J+7: Déconnexion automatique si non payé</li>
            <li>Paiement → Réactivation immédiate de tout l'espace</li>
          </ul>
        </div>

        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <div className="font-bold text-emerald-900">Réactivez maintenant - $10/mois</div>
          <div className="text-xs text-emerald-700 mt-1">Accès immédiat restauré après paiement Paystack</div>
          <button onClick={handlePay} disabled={loading} className="mt-4 w-full bg-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-700">
            {loading ? 'Redirection Paystack...' : 'Payer et réactiver mon espace →'}
          </button>
          <div className="text-[11px] text-emerald-600 mt-2">Webhook HMAC vérifié + idempotence + audit log</div>
        </div>

        <div className="mt-6 text-[11px] text-slate-400">
          Vos données (calendrier, santé N4, budget, docs coffre-fort) sont conservées.<br/>
          Aucune suppression. Réactivation = retour complet.
        </div>
      </div>
    </div>
  )
}
