import { createClient } from '@/lib/supabase/server'
export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
  const { data: tasks } = await supabase.from('tasks').select('*, profiles!tasks_assigned_to_fkey(full_name)').eq('family_id', fm!.family_id).order('due_at')
  
  const grouped = {
    pending: tasks?.filter(t=>t.status==='pending')||[],
    in_progress: tasks?.filter(t=>t.status==='in_progress')||[],
    late: tasks?.filter(t=>t.due_at && new Date(t.due_at) < new Date() && t.status!=='done')||[],
    done: tasks?.filter(t=>t.status==='done')||[]
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Tâches & Corvées</h1>
      <div className="mt-6 grid md:grid-cols-4 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4"><h3 className="font-bold text-amber-900">En retard ({grouped.late.length})</h3><div className="mt-3 space-y-2">{grouped.late.map((t:any)=><div key={t.id} className="bg-white p-3 rounded-xl text-sm">{t.title}</div>)}</div></div>
        <div className="bg-white border rounded-2xl p-4"><h3 className="font-bold">En attente ({grouped.pending.length})</h3><div className="mt-3 space-y-2">{grouped.pending.map((t:any)=><div key={t.id} className="bg-slate-50 p-3 rounded-xl text-sm">{t.title} → {t.profiles?.full_name||'Non assigné'}</div>)}</div></div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4"><h3 className="font-bold text-blue-900">En cours</h3><div className="mt-3">{grouped.in_progress.length} tâches</div></div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4"><h3 className="font-bold text-emerald-900">Terminées ({grouped.done.length})</h3></div>
      </div>

      <form action={async (formData: FormData)=>{
        'use server'
        const supabase = await (await import('@/lib/supabase/server')).createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
        await supabase.from('tasks').insert({
          family_id: fm.family_id,
          title: formData.get('title'),
          due_at: formData.get('due_at'),
          priority: formData.get('priority'),
          created_by: user!.id
        })
      }} className="mt-8 bg-white rounded-[22px] border p-6 flex gap-3">
        <input name="title" required placeholder="Nouvelle tâche (ex: Payer électricité)" className="flex-1 border rounded-xl px-4 py-2.5" />
        <input name="due_at" type="date" className="border rounded-xl px-4 py-2.5" />
        <select name="priority" className="border rounded-xl px-4 py-2.5"><option>low</option><option>medium</option><option>high</option></select>
        <button className="bg-indigo-600 text-white px-6 rounded-xl">Ajouter</button>
      </form>
    </div>
  )
}
