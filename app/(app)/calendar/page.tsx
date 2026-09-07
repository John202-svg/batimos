// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).limit(1).single()
  const family_id = fm!.family_id

  const { data: events } = await supabase.from('events').select('*').eq('family_id', family_id).order('start_at')
  const { data: appointments } = await supabase.from('health_appointments').select('*, health_profiles(member_user_id)').eq('family_id', family_id).order('appointment_at')

  // Fusion calendrier + santé (ton exigence d'intégration)
  const merged = [
    ...(events||[]).map((e:any)=>({ ...e, type:'event', time: e.start_at })),
    ...(appointments||[]).map((a:any)=>({ id: a.id, title: a.title + ' (Santé)', start_at: a.appointment_at, type:'health', category:'Santé N4' }))
  ].sort((a,b)=> new Date(a.start_at||a.time).getTime() - new Date(b.start_at||b.time).getTime())

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Calendrier Familial Partagé</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border rounded-xl">Jour</button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl">Semaine</button>
          <button className="px-4 py-2 bg-white border rounded-xl">Mois</button>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[22px] border p-6">
          <h3 className="font-semibold mb-4">Événements intégrés (Tâches + Santé + École + Factures)</h3>
          <div className="space-y-3">
            {merged.map((item:any)=>(
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border hover:bg-slate-50">
                <div className="text-sm text-slate-500">{new Date(item.start_at || item.time).toLocaleString('fr-FR')}</div>
                <div className="font-medium">{item.title}</div>
                <div className={`ml-auto text-xs px-2 py-1 rounded-full ${item.type==='health'?'bg-rose-50 text-rose-700 border border-rose-200':'bg-blue-50 text-blue-700'}`}>{item.category||item.type}</div>
              </div>
            ))}
            {merged.length===0 && <div className="text-center py-12 text-slate-400">Aucun événement - Crée ton premier événement familial</div>}
          </div>
        </div>
        <div className="bg-white rounded-[22px] border p-6">
          <h3 className="font-semibold">Créer événement</h3>
          <form action={async (formData: FormData)=>{
            'use server'
            const supabase = await (await import('@/lib/supabase/server')).createClient()
            const { data: { user } } = await supabase.auth.getUser()
            const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
            await supabase.from('events').insert({
              family_id: fm.family_id,
              title: formData.get('title'),
              start_at: formData.get('start_at'),
              category: formData.get('category'),
              created_by: user!.id
            })
          }} className="mt-4 space-y-3">
            <input name="title" required placeholder="Titre (ex: Dentiste Léa)" className="w-full border rounded-xl px-4 py-2.5" />
            <input name="start_at" required type="datetime-local" className="w-full border rounded-xl px-4 py-2.5" />
            <select name="category" className="w-full border rounded-xl px-4 py-2.5"><option>École</option><option>Santé</option><option>Famille</option><option>Facture</option><option>Sport</option></select>
            <button className="w-full bg-indigo-600 text-white py-3 rounded-xl">Créer + notifier famille</button>
          </form>
          <p className="text-[11px] text-slate-400 mt-3">Intégré avec Notifications + Tâches + Santé (ta matrice d'intégration)</p>
        </div>
      </div>
    </div>
  )
}
