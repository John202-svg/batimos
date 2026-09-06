import { createClient } from '@/lib/supabase/server'
export default async function BillsPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: fm } = await supabase.from('family_members').select('family_id, role').eq('user_id', user!.id).single()
  const isFinanceAllowed = ['parent_admin','parent_member'].includes(fm!.role)
  const { data: bills } = await supabase.from('bills').select('*').eq('family_id', fm!.family_id).order('due_date')
  
  const totalDue = bills?.filter(b=>!b.is_paid).reduce((s,b)=>s+b.amount,0)||0
  const overdue = bills?.filter(b=>!b.is_paid && b.due_date && new Date(b.due_date) < new Date())||[]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Factures & Paiements</h1>
      {!isFinanceAllowed && <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">Accès finance restreint - Seul Parent peut voir les factures (RBAC N3)</div>}
      {isFinanceAllowed && (
        <>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border"><div className="text-sm text-slate-500">Total à payer</div><div className="text-2xl font-bold">${(totalDue/100).toFixed(2)}</div></div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5"><div className="text-sm text-red-700">En retard</div><div className="text-2xl font-bold text-red-700">{overdue.length} factures</div></div>
            <div className="bg-white rounded-2xl p-5 border"><div className="text-sm text-slate-500">Intégration</div><div className="text-sm font-medium">Calendrier + Notifs + Budget</div></div>
          </div>
          <div className="mt-6 bg-white rounded-[22px] border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500"><tr><th className="text-left p-4">Fournisseur</th><th>Catégorie</th><th>Échéance</th><th>Montant</th><th>Statut</th></tr></thead>
              <tbody>
                {bills?.map((b:any)=>(
                  <tr key={b.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 font-medium">{b.provider}</td><td className="text-center">{b.category}</td><td className="text-center">{b.due_date}</td><td className="text-center">${(b.amount/100).toFixed(2)}</td><td className="text-center"><span className={`px-2 py-1 rounded-full text-xs ${b.is_paid ? 'bg-emerald-100 text-emerald-700' : b.due_date && new Date(b.due_date) < new Date() ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{b.is_paid ? 'Payé' : 'À payer'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form action={async (formData: FormData)=>{
            'use server'
            const supabase = await (await import('@/lib/supabase/server')).createClient()
            const { data: { user } } = await supabase.auth.getUser()
            const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
            await supabase.from('bills').insert({
              family_id: fm.family_id,
              provider: formData.get('provider'),
              category: formData.get('category'),
              amount: parseInt(formData.get('amount') as string)*100,
              due_date: formData.get('due_date'),
              recurrence: formData.get('recurrence')
            })
          }} className="mt-6 bg-white rounded-[22px] border p-6 grid md:grid-cols-5 gap-3">
            <input name="provider" required placeholder="Fournisseur (EDF, Loyer)" className="border rounded-xl px-4 py-2.5" />
            <select name="category" className="border rounded-xl px-4 py-2.5"><option>Électricité</option><option>Eau</option><option>Internet</option><option>Loyer</option><option>École</option><option>Assurance</option></select>
            <input name="amount" type="number" required placeholder="Montant $" className="border rounded-xl px-4 py-2.5" />
            <input name="due_date" type="date" className="border rounded-xl px-4 py-2.5" />
            <button className="bg-indigo-600 text-white rounded-xl">Ajouter + rappel</button>
          </form>
        </>
      )}
    </div>
  )
}
