import { createClient } from '@/lib/supabase/server'
export default async function ShoppingPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
  const family_id = fm!.family_id
  const { data: lists } = await supabase.from('shopping_lists').select('*, shopping_items(*)').eq('family_id', family_id)
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Achats du Foyer</h1>
      <p className="text-slate-500 mt-1">Plusieurs listes • Quantités • Prix estimés • Acheteur désigné</p>
      <div className="mt-6 grid md:grid-cols-3 gap-6">
        {(lists||[]).map((list:any)=>(
          <div key={list.id} className="bg-white rounded-[22px] border p-5">
            <h3 className="font-bold">{list.name}</h3>
            <div className="mt-3 space-y-2">
              {list.shopping_items?.map((item:any)=>(
                <div key={item.id} className="flex justify-between text-sm p-2 rounded-xl bg-slate-50">
                  <span>{item.quantity}x {item.name}</span>
                  <span className={item.is_bought ? 'text-emerald-600 line-through' : 'text-slate-700'}>{item.estimated_price ? item.estimated_price/100 + '$' : ''} {item.is_bought ? '✓' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <form action={async (formData: FormData)=>{
        'use server'
        const supabase = await (await import('@/lib/supabase/server')).createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
        // Crée liste si existe pas
        let { data: list } = await supabase.from('shopping_lists').select('id').eq('family_id', fm.family_id).limit(1).single()
        if(!list){
          const { data: newList } = await supabase.from('shopping_lists').insert({ family_id: fm.family_id, name: 'Courses alimentaires' }).select().single()
          list = newList
        }
        await supabase.from('shopping_items').insert({
          shopping_list_id: list.id,
          family_id: fm.family_id,
          name: formData.get('name'),
          quantity: parseInt(formData.get('quantity') as string)||1,
          estimated_price: parseInt(formData.get('price') as string)*100||0,
          priority: formData.get('priority')
        })
        // Lien Budget: crée dépense estimée
        await supabase.from('expenses').insert({
          family_id: fm.family_id,
          amount: parseInt(formData.get('price') as string)*100||0,
          category: 'Achats',
          description: formData.get('name') as string
        })
      }} className="mt-8 bg-white rounded-[22px] border p-6 flex gap-3">
        <input name="name" required placeholder="Ex: Lait, Pharmacie, Fournitures" className="flex-1 border rounded-xl px-4 py-2.5" />
        <input name="quantity" type="number" defaultValue={1} className="w-20 border rounded-xl px-3 py-2.5" />
        <input name="price" type="number" placeholder="$" className="w-24 border rounded-xl px-3 py-2.5" />
        <button className="bg-indigo-600 text-white px-6 rounded-xl">Ajouter → Budget</button>
      </form>
      <p className="text-[11px] text-slate-400 mt-2">Intégration: Achats → Budget → Dépenses → Projets (ton Module 34)</p>
    </div>
  )
}
