import { createClient } from '@/lib/supabase/server'
export default async function StaffPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: fm } = await supabase.from('family_members').select('family_id, role').eq('user_id', user!.id).single()
  const isAllowed = ['parent_admin','parent_member'].includes(fm!.role)
  if(!isAllowed) return <div className="p-10 text-center bg-amber-50 m-6 rounded-2xl border">Personnel N3 - Accès Parent uniquement</div>
  const { data: staff } = await supabase.from('staff_profiles').select('*').eq('family_id', fm.family_id)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Personnel Domestique</h1>
      <p className="text-slate-500">Femme de ménage, Chauffeur, Nounou, Jardinier, Sécurité, Cuisinier - Rémunération + Congés + Documents</p>
      
      <div className="mt-6 grid md:grid-cols-3 gap-6">
        {(staff||[
          {id:1, full_name:'Aïcha B.', position:'Femme de ménage', phone:'+225...', schedule:'Lun-Sam 8h-16h', salary:80000, status:'active'},
          {id:2, full_name:'Koffi J.', position:'Chauffeur', phone:'+225...', schedule:'Lun-Ven 7h-18h', salary:120000, status:'active'}
        ]).map((s:any)=>(
          <div key={s.id} className="bg-white rounded-[22px] border p-6">
            <div className="flex justify-between">
              <div><div className="font-bold">{s.full_name}</div><div className="text-sm text-indigo-600">{s.position}</div><div className="text-xs text-slate-400 mt-1">{s.schedule}</div></div>
              <div className={`px-2 py-1 rounded-full text-xs h-fit ${s.status==='active'?'bg-emerald-100 text-emerald-700':'bg-slate-100'}`}>{s.status}</div>
            </div>
            <div className="mt-4 text-sm space-y-1">
              <div>📞 {s.phone}</div>
              <div>💰 {(s.salary/100).toFixed(0)}$ / mois - Lié Budget</div>
              <div>📅 Congés: 12j restants</div>
              <div>📄 Contrat: coffre-fort</div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="text-xs bg-slate-100 px-3 py-1.5 rounded-full">Tâches</button>
              <button className="text-xs bg-slate-100 px-3 py-1.5 rounded-full">Présence</button>
              <button className="text-xs bg-slate-100 px-3 py-1.5 rounded-full">Payer</button>
            </div>
          </div>
        ))}
      </div>

      <form action={async (formData: FormData)=>{
        'use server'
        const supabase = await (await import('@/lib/supabase/server')).createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
        await supabase.from('staff_profiles').insert({
          family_id: fm.family_id,
          full_name: formData.get('full_name'),
          position: formData.get('position'),
          phone: formData.get('phone'),
          salary: parseInt(formData.get('salary') as string)*100
        })
        await supabase.from('audit_logs').insert({ family_id: fm.family_id, actor_id: user!.id, action: 'staff.create', entity_type: 'staff_profile' })
      }} className="mt-8 bg-white rounded-[22px] border p-6 grid md:grid-cols-5 gap-3">
        <input name="full_name" required placeholder="Nom personnel" className="border rounded-xl px-4 py-2.5" />
        <select name="position" className="border rounded-xl px-4 py-2.5"><option>Femme de ménage</option><option>Chauffeur</option><option>Nounou</option><option>Jardinier</option><option>Sécurité</option><option>Cuisinier</option></select>
        <input name="phone" placeholder="Téléphone" className="border rounded-xl px-4 py-2.5" />
        <input name="salary" type="number" placeholder="Salaire $" className="border rounded-xl px-4 py-2.5" />
        <button className="bg-indigo-600 text-white rounded-xl">Ajouter + contrat coffre-fort</button>
      </form>
    </div>
  )
}
