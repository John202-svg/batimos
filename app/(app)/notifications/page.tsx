import { createClient } from '@/lib/supabase/server'
export default async function NotifPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: notifs } = await supabase.from('notifications').select('*').eq('user_id', user!.id).order('created_at', {ascending:false}).limit(30)
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Notifications - Moteur Central</h1>
      <p className="text-slate-500 text-sm mt-1">Tous modules: Events, Tâches en retard, Factures, Santé, Médicaments, Vaccins, Assurance, Documents</p>
      <div className="mt-6 bg-white rounded-[22px] border divide-y">
        {(notifs||[
          {id:1, type:'health_appointment', title:'RDV Dentiste Léa demain 14h', body:'Dr Martin - Cabinet dentaire', created_at: new Date().toISOString()},
          {id:2, type:'bill_overdue', title:'Facture EDF en retard', body:'120$ - Échéance 2j', created_at: new Date().toISOString()},
          {id:3, type:'task_late', title:'Tâche en retard: Payer loyer', body:'Assigné à Parent', created_at: new Date().toISOString()},
          {id:4, type:'document_expiry', title:'Passeport Léa expire dans 30j', body:'Coffre-fort - Renouvellement', created_at: new Date().toISOString()},
          {id:5, type:'medication', title:'Rappel médicament: Ventoline', body:'20h - Ne constitue pas un avis médical', created_at: new Date().toISOString()}
        ]).map((n:any)=>(
          <div key={n.id} className="p-4 flex gap-4 hover:bg-slate-50">
            <div className={`w-2 h-2 rounded-full mt-2 ${n.type.includes('health') ? 'bg-rose-500' : n.type.includes('bill') ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
            <div className="flex-1">
              <div className="font-medium text-sm">{n.title}</div>
              <div className="text-xs text-slate-500 mt-1">{n.body}</div>
              <div className="text-[11px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString('fr-FR')} • Canaux: In-app + Email + Push (configurable)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
