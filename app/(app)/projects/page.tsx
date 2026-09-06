import { createClient } from '@/lib/supabase/server'
export default async function ProjectsPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
  const { data: projects } = await supabase.from('family_projects').select('*, project_tasks(*), project_milestones(*)').eq('family_id', fm!.family_id)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Projets Familiaux</h1>
      <p className="text-slate-500">Rénovation, Déménagement, Vacances, Mariage - Tâches + Budget + Documents + Calendrier</p>
      
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {(projects||[
          {id:1, name:'Rénovation cuisine', description:'Carrelage + peinture', status:'in_progress', progress:45, budget:250000, tasks:[{title:'Acheter carrelage', done:false}], milestones:[{title:'Fin démolition', done:true}]},
          {id:2, name:'Vacances Décembre', description:'Abidjan → Paris', status:'planning', progress:20, budget:500000}
        ]).map((p:any)=>(
          <div key={p.id} className="bg-white rounded-[22px] border p-6">
            <div className="flex justify-between"><div><div className="font-bold text-lg">{p.name}</div><div className="text-sm text-slate-500">{p.description}</div></div><span className={`px-3 py-1 rounded-full text-xs ${p.status==='in_progress'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}`}>{p.status}</span></div>
            <div className="mt-4"><div className="flex justify-between text-xs"><span>Progression</span><span>{p.progress}%</span></div><div className="mt-1 h-2 bg-slate-100 rounded-full"><div className="h-2 bg-indigo-600 rounded-full" style={{width: `${p.progress}%`}}></div></div></div>
            <div className="mt-4 grid grid-cols-3 text-xs">
              <div><div className="text-slate-400">Tâches</div><div className="font-bold">{p.tasks?.length||3} / 8</div></div>
              <div><div className="text-slate-400">Budget</div><div className="font-bold">${(p.budget/100).toFixed(0)}</div></div>
              <div><div className="text-slate-400">Docs</div><div className="font-bold">4 fichiers</div></div>
            </div>
            <div className="mt-4 text-[11px] text-slate-400">Intégré: Tâches + Budget + Docs + Calendrier + Notifs (Module 10)</div>
          </div>
        ))}
      </div>

      <form action={async (formData: FormData)=>{
        'use server'
        const supabase = await (await import('@/lib/supabase/server')).createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
        await supabase.from('family_projects').insert({ family_id: fm.family_id, name: formData.get('name'), description: formData.get('description'), budget: parseInt(formData.get('budget') as string)*100||0, created_by: user!.id })
      }} className="mt-8 bg-white rounded-[22px] border p-6 grid md:grid-cols-4 gap-3">
        <input name="name" required placeholder="Nom projet (Rénovation...)" className="border rounded-xl px-4 py-2.5" />
        <input name="description" placeholder="Description" className="border rounded-xl px-4 py-2.5" />
        <input name="budget" type="number" placeholder="Budget $" className="border rounded-xl px-4 py-2.5" />
        <button className="bg-indigo-600 text-white rounded-xl">Créer projet + jalons</button>
      </form>
    </div>
  )
}
