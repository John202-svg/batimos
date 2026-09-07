import { createClient } from '@/lib/supabase/server'
export default async function BudgetPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: fm } = await supabase.from('family_members').select('family_id, role').eq('user_id', user!.id).single()
  const isAllowed = ['parent_admin','parent_member'].includes(fm!.role)
  if(!isAllowed) return <div className="p-10 text-center bg-amber-50 m-6 rounded-2xl border border-amber-200">Finance N3 protégée - Accès Parent uniquement</div>
  
  const { data: budgets } = await supabase.from('budgets').select('*').eq('family_id', fm!.family_id)
  const { data: expenses } = await supabase.from('expenses').select('*').eq('family_id', fm!.family_id).order('spent_at', {ascending:false}).limit(20)
  const { data: incomes } = await supabase.from('incomes').select('*').eq('family_id', fm!.family_id)
  
  const totalBudget = budgets?.reduce((s,b)=>s+b.amount,0)||500000 // $5000 par défaut
  const totalExpenses = expenses?.reduce((s,e)=>s+e.amount,0)||0
  const totalIncome = incomes?.reduce((s,i)=>s+i.amount,0)||600000
  const remaining = totalIncome - totalExpenses
  const percent = totalBudget ? Math.round((totalExpenses/totalBudget)*100) : 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Budget Familial</h1>
      <p className="text-slate-500">Règle: Budget → Dépenses → Solde restant (ton Module 6)</p>
      
      <div className="mt-6 grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border"><div className="text-sm text-slate-500">Revenus</div><div className="text-2xl font-bold text-emerald-600">+${(totalIncome/100).toFixed(0)}</div></div>
        <div className="bg-white rounded-2xl p-5 border"><div className="text-sm text-slate-500">Dépenses</div><div className="text-2xl font-bold text-red-600">-${(totalExpenses/100).toFixed(0)}</div></div>
        <div className={`rounded-2xl p-5 border ${remaining<0?'bg-red-50 border-red-200':'bg-emerald-50 border-emerald-200'}`}><div className="text-sm">Solde restant</div><div className="text-2xl font-bold">${(remaining/100).toFixed(0)}</div></div>
        <div className="bg-white rounded-2xl p-5 border"><div className="text-sm text-slate-500">Budget utilisé</div><div className="text-2xl font-bold">{percent}%</div><div className="mt-2 h-2 bg-slate-100 rounded-full"><div className="h-2 bg-indigo-600 rounded-full" style={{width: `${Math.min(100,percent)}%`}}></div></div></div>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[22px] border p-6">
          <h3 className="font-semibold">Dépenses récentes (Achats + Factures + Santé + École)</h3>
          <div className="mt-4 space-y-2">
            {expenses?.map((e:any)=>(
              <div key={e.id} className="flex justify-between text-sm p-3 rounded-xl bg-slate-50">
                <span>{e.description} <span className="text-xs text-slate-400">{e.category}</span></span>
                <span className="font-medium">-${(e.amount/100).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-[22px] border p-6">
          <h3 className="font-semibold">Objectifs d'épargne</h3>
          <div className="mt-4 space-y-3">
            <div className="border rounded-xl p-4"><div className="flex justify-between"><span className="font-medium">Vacances été</span><span className="text-sm">1,200$ / 3,000$</span></div><div className="mt-2 h-2 bg-slate-100 rounded-full"><div className="h-2 bg-indigo-600 rounded-full w-[40%]"></div></div></div>
            <div className="border rounded-xl p-4"><div className="flex justify-between"><span className="font-medium">Rénovation</span><span className="text-sm">800$ / 5,000$</span></div><div className="mt-2 h-2 bg-slate-100 rounded-full"><div className="h-2 bg-emerald-600 rounded-full w-[16%]"></div></div></div>
          </div>
          <form action={async (formData: FormData)=>{
            'use server'
            const supabase = await (await import('@/lib/supabase/server')).createClient()
            const { data: { user } } = await supabase.auth.getUser()
            const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
            await supabase.from('expenses').insert({ family_id: fm.family_id, amount: parseInt(formData.get('amount') as string)*100, category: formData.get('category'), description: formData.get('description') })
          }} className="mt-6 flex gap-2">
            <input name="description" placeholder="Dépense" className="flex-1 border rounded-xl px-3 py-2 text-sm" />
            <input name="amount" type="number" placeholder="$" className="w-24 border rounded-xl px-3 py-2 text-sm" />
            <select name="category" className="border rounded-xl px-3 py-2 text-sm"><option>Alimentation</option><option>Santé</option><option>École</option><option>Factures</option></select>
            <button className="bg-indigo-600 text-white px-4 rounded-xl text-sm">Ajouter</button>
          </form>
        </div>
      </div>
    </div>
  )
}
