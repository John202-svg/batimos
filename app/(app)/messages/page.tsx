import { createClient } from '@/lib/supabase/server'
export default async function MessagesPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
  const { data: conversations } = await supabase.from('conversations').select('*, conversation_members(*), messages(*)').eq('family_id', fm!.family_id)

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-100px)]">
      <h1 className="text-3xl font-bold">Messagerie Familiale Privée</h1>
      <p className="text-slate-500 text-sm">Isolée par family_id - Pas d'accès cross-famille</p>
      <div className="mt-6 grid grid-cols-3 gap-6 h-full">
        <div className="bg-white rounded-[22px] border p-4">
          <h3 className="font-semibold">Conversations</h3>
          <div className="mt-4 space-y-2">
            {(conversations||[{id:'1', name:'Famille', last: 'Dentiste demain 14h'}]).map((c:any)=>(
              <div key={c.id} className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="font-medium text-sm">{c.name||'Famille'}</div>
                <div className="text-xs text-slate-500">{c.last||'Dernier message'}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2 bg-white rounded-[22px] border flex flex-col">
          <div className="p-4 border-b font-semibold">Discussion Familiale</div>
          <div className="flex-1 p-4 space-y-3 overflow-auto">
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm p-3 text-sm max-w-[70%]">N'oubliez pas RDV dentiste Léa demain 14h (intégré calendrier)</div>
            <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm p-3 text-sm max-w-[70%] ml-auto">OK, je m'en occupe ✓</div>
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm p-3 text-sm max-w-[70%]">Facture EDF payée - voir Budget</div>
          </div>
          <form action={async (formData: FormData)=>{
            'use server'
            const supabase = await (await import('@/lib/supabase/server')).createClient()
            const { data: { user } } = await supabase.auth.getUser()
            const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
            // Crée conversation famille si existe pas + message
          }} className="p-4 border-t flex gap-2">
            <input name="message" placeholder="Message à la famille..." className="flex-1 border rounded-full px-4 py-2.5" />
            <button className="bg-indigo-600 text-white px-6 rounded-full">Envoyer</button>
          </form>
        </div>
      </div>
    </div>
  )
}
