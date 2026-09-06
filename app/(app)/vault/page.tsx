import { createClient } from '@/lib/supabase/server'
export default async function VaultPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
  const { data: docs } = await supabase.from('documents').select('*').eq('family_id', fm!.family_id).order('created_at', {ascending:false})
  const { data: healthDocs } = await supabase.from('health_documents').select('*').eq('family_id', fm!.family_id)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Coffre-fort Familial Numérique</h1>
      <p className="text-slate-500">Stockage sécurisé privé - Aucune URL publique - RLS + audit_logs</p>

      <div className="mt-6 grid md:grid-cols-4 gap-3">
        {['Identité','Passeports','Assurances','Scolaire','Médical N4','Immobilier','Contrats'].map(cat=>(
          <div key={cat} className="bg-white border rounded-2xl p-4 text-center hover:shadow-sm">
            <div className="font-medium text-sm">{cat}</div>
            <div className="text-xs text-slate-400 mt-1">{docs?.filter((d:any)=>d.category===cat).length||0} docs</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-[22px] border overflow-hidden">
        <div className="p-6 border-b flex justify-between">
          <h3 className="font-semibold">Documents (avec expiration + rappel)</h3>
          <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">Bucket privé family-vault - Pas d'URL publique</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="text-left p-4">Titre</th><th>Catégorie</th><th>Expiration</th><th>Statut</th><th>Accès</th></tr></thead>
          <tbody>
            {docs?.map((d:any)=>(
              <tr key={d.id} className="border-t">
                <td className="p-4">{d.title}</td><td className="text-center">{d.category}</td><td className="text-center">{d.expires_at||'—'}</td><td className="text-center"><span className={`px-2 py-1 rounded-full text-xs ${d.expires_at && new Date(d.expires_at) < new Date(Date.now()+30*24*3600*1000) ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{d.expires_at && new Date(d.expires_at) < new Date() ? 'Expiré' : 'Valide'}</span></td><td className="text-center text-xs">RLS + audit</td>
              </tr>
            ))}
            {healthDocs?.map((d:any)=>(
              <tr key={d.id} className="border-t bg-rose-50/50"><td className="p-4">{d.file_path} (Médical)</td><td className="text-center">Médical N4</td><td className="text-center">{d.expires_at||'—'}</td><td className="text-center"><span className="px-2 py-1 rounded-full text-xs bg-rose-100 text-rose-700">N4 protégé</span></td><td className="text-center text-xs">Admin + soi-même</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <form action={async (formData: FormData)=>{
        'use server'
        const supabase = await (await import('@/lib/supabase/server')).createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
        // Upload vers bucket privé family-vault (à implémenter avec supabase storage)
        const title = formData.get('title') as string
        const category = formData.get('category') as string
        await supabase.from('documents').insert({ family_id: fm.family_id, title, category, file_path: `private/${fm.family_id}/${title}`, created_by: user!.id })
        await supabase.from('audit_logs').insert({ family_id: fm.family_id, actor_id: user!.id, action: 'document.upload', entity_type: 'document', metadata: { title } })
      }} className="mt-6 bg-white rounded-[22px] border p-6 grid md:grid-cols-4 gap-3">
        <input name="title" required placeholder="Titre document" className="border rounded-xl px-4 py-2.5" />
        <select name="category" className="border rounded-xl px-4 py-2.5"><option>Identité</option><option>Passeports</option><option>Assurances</option><option>Médical N4</option><option>Scolaire</option></select>
        <input type="file" name="file" className="border rounded-xl px-4 py-2.5" />
        <button className="bg-indigo-600 text-white rounded-xl">Uploader sécurisé + audit</button>
      </form>
    </div>
  )
}
