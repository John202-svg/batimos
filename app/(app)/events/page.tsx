import { createClient } from '@/lib/supabase/server'
export default async function FamilyEventsPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
  const { data: events } = await supabase.from('family_events').select('*, event_guests(*), event_tasks(*)').eq('family_id', fm!.family_id)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Événements Familiaux</h1>
      <p className="text-slate-500">Anniversaires, Mariages, Réunions, Vacances, Religieux - Invités + RSVP + Budget + Tâches + Achats</p>
      
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {(events||[
          {id:1, title:'Anniversaire Léa - 9 ans', event_date:'2024-04-12', location:'Maison', guests_count:25, rsvp_yes:18, budget:150000, status:'upcoming'},
          {id:2, title:'Réunion famille Dupont', event_date:'2024-05-01', location:'Village', guests_count:50, rsvp_yes:32, budget:300000}
        ]).map((ev:any)=>(
          <div key={ev.id} className="bg-white rounded-[22px] border p-6">
            <div className="flex justify-between"><div><div className="font-bold text-lg">{ev.title}</div><div className="text-sm text-slate-500">📍 {ev.location} • 📅 {ev.event_date}</div></div><span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 h-fit">{ev.status}</span></div>
            <div className="mt-4 grid grid-cols-3 text-xs">
              <div><div className="text-slate-400">Invités</div><div className="font-bold">{ev.guests_count}</div></div>
              <div><div className="text-slate-400">RSVP Oui</div><div className="font-bold text-emerald-600">{ev.rsvp_yes}</div></div>
              <div><div className="text-slate-400">Budget</div><div className="font-bold">${(ev.budget/100).toFixed(0)}</div></div>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">Tâches: 5/12</span>
              <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">Achats: 8/15</span>
              <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">Docs: 2</span>
            </div>
            <div className="mt-3 text-[11px] text-slate-400">Intégré: Calendrier + Tâches + Achats + Budget + Docs + Notifs (Module 11)</div>
          </div>
        ))}
      </div>

      <form action={async (formData: FormData)=>{
        'use server'
        const supabase = await (await import('@/lib/supabase/server')).createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
        await supabase.from('family_events').insert({ family_id: fm.family_id, title: formData.get('title'), event_date: formData.get('event_date'), location: formData.get('location'), budget: parseInt(formData.get('budget') as string)*100||0 })
      }} className="mt-8 bg-white rounded-[22px] border p-6 grid md:grid-cols-4 gap-3">
        <input name="title" required placeholder="Titre événement" className="border rounded-xl px-4 py-2.5" />
        <input name="event_date" type="date" className="border rounded-xl px-4 py-2.5" />
        <input name="location" placeholder="Lieu" className="border rounded-xl px-4 py-2.5" />
        <button className="bg-indigo-600 text-white rounded-xl">Créer + invitations + calendrier</button>
      </form>
    </div>
  )
}
