import { supabase } from '@/lib/supabase'
export default async function Dashboard() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Tableau de bord familial</h1>
      <p className="text-slate-500 mt-2">Vue synthétique selon tes permissions RBAC.</p>
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {['Événements du jour','Tâches en retard','Budget restant','RDV médicaux','Documents à renouveler','Messages'].map(c=>(
          <div key={c} className="bg-white rounded-2xl p-5 shadow-sm border">{c}</div>
        ))}
      </div>
    </div>
  )
}
