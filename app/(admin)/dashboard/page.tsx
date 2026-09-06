import { createClient } from '@/lib/supabase/server'
export default async function AdminDashboard(){
  // Vérif admin plateforme via custom claim ou table platform_admins
  const supabase = await createClient()
  const { count: users } = await supabase.from('profiles').select('*', {count:'exact', head:true})
  const { count: families } = await supabase.from('families').select('*', {count:'exact', head:true})
  const { count: trials } = await supabase.from('subscriptions').select('*', {count:'exact', head:true}).eq('status','TRIALING')
  const { count: actives } = await supabase.from('subscriptions').select('*', {count:'exact', head:true}).eq('status','ACTIVE')

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Admin SaaS - Panneau Plateforme</h1>
      <p className="text-red-600 text-sm mt-2">⚠️ Les admins plateforme n'ont PAS accès auto aux contenus privés familles (Module 27)</p>
      
      <div className="mt-8 grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border"><div className="text-sm text-slate-500">Utilisateurs</div><div className="text-2xl font-bold">{users||0}</div></div>
        <div className="bg-white rounded-2xl p-5 border"><div className="text-sm text-slate-500">Familles</div><div className="text-2xl font-bold">{families||0}</div></div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5"><div className="text-sm text-emerald-700">Trials actifs</div><div className="text-2xl font-bold text-emerald-700">{trials||0}</div></div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5"><div className="text-sm text-indigo-700">Premium actifs</div><div className="text-2xl font-bold text-indigo-700">{actives||0}</div></div>
      </div>

      <div className="mt-8 bg-white rounded-[22px] border p-6">
        <h3 className="font-semibold">Garde-fous confidentialité (Module 27)</h3>
        <ul className="mt-3 text-sm list-disc ml-5 space-y-1 text-slate-600">
          <li>Documents privés, dossiers santé, conversations = inaccessibles sauf mécanisme support explicite, audité, temporaire</li>
          <li>Tout accès exceptionnel doit être: explicitement autorisé + limité + audité + temporaire</li>
          <li>Audit logs protégés contre modifications non autorisées</li>
        </ul>
      </div>
    </div>
  )
}
