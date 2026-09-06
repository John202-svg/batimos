import { createClient } from '@/lib/supabase/server'
export default async function ChildrenPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
  const { data: children } = await supabase.from('children').select('*, schools(name), school_events(*), assignments(*), exams(*)').eq('family_id', fm!.family_id)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Enfants & Gestion Scolaire</h1>
      <p className="text-slate-500">Profils enfants • Devoirs • Examens • Frais scolaires • Présence • Documents</p>
      
      <div className="mt-6 grid md:grid-cols-3 gap-6">
        {(children||[
          {id:'1', full_name:'Léa Dupont', date_of_birth:'2015-03-12', class_name:'CM1', school:{name:'École Saint-Ex'}, assignments:[{title:'Maths - Fractions', due_date:'2024-01-15'}], exams:[{subject:'Français', exam_date:'2024-01-20'}]},
          {id:'2', full_name:'Tom Dupont', date_of_birth:'2018-07-08', class_name:'CP', school:{name:'École Saint-Ex'}}
        ]).map((child:any)=>(
          <div key={child.id} className="bg-white rounded-[22px] border p-6">
            <div className="flex justify-between">
              <div>
                <div className="font-bold text-lg">{child.full_name}</div>
                <div className="text-sm text-slate-500">{child.class_name} • {child.school?.name||'École'}</div>
                <div className="text-xs text-slate-400">Né: {child.date_of_birth||'—'}</div>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">👧</div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-xs font-semibold text-slate-600">Devoirs à venir</div>
              {child.assignments?.map((a:any)=>(
                <div key={a.title} className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-xs">{a.title} - Échéance {a.due_date}</div>
              ))||<div className="text-xs text-slate-400">Aucun devoir</div>}
              <div className="text-xs font-semibold text-slate-600 mt-3">Examens</div>
              {child.exams?.map((e:any)=>(
                <div key={e.subject} className="bg-blue-50 border border-blue-200 rounded-xl p-2 text-xs">{e.subject} - {e.exam_date}</div>
              ))||<div className="text-xs text-slate-400">Aucun examen</div>}
            </div>
            <div className="mt-4 flex gap-2">
              <span className="text-xs bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">Présence: 98%</span>
              <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">Frais: Payés</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-[22px] border p-6">
        <h3 className="font-semibold">Ajouter enfant + lier école</h3>
        <form action={async (formData: FormData)=>{
          'use server'
          const supabase = await (await import('@/lib/supabase/server')).createClient()
          const { data: { user } } = await supabase.auth.getUser()
          const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
          await supabase.from('children').insert({
            family_id: fm.family_id,
            full_name: formData.get('full_name'),
            date_of_birth: formData.get('date_of_birth'),
            class_name: formData.get('class_name'),
            school_id: null
          })
        }} className="mt-4 grid md:grid-cols-4 gap-3">
          <input name="full_name" required placeholder="Nom complet enfant" className="border rounded-xl px-4 py-2.5" />
          <input name="date_of_birth" type="date" className="border rounded-xl px-4 py-2.5" />
          <input name="class_name" placeholder="Classe (CM1, CP...)" className="border rounded-xl px-4 py-2.5" />
          <button className="bg-indigo-600 text-white rounded-xl">Ajouter + notifications devoirs</button>
        </form>
      </div>
    </div>
  )
}
