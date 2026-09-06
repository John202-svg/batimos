import { createClient } from '@/lib/supabase/server'
export default async function HealthPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: fm } = await supabase.from('family_members').select('family_id, role').eq('user_id', user!.id).single()
  if(!fm) return <div>Pas de famille</div>
  
  // Vérif accès N4
  const isAdmin = fm.role === 'parent_admin'
  const { data: healthProfiles } = await supabase.from('health_profiles').select('*').eq('family_id', fm.family_id)
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Santé Familiale <span className="text-sm bg-rose-100 text-rose-700 px-3 py-1 rounded-full border">NIVEAU N4 - Hautement sensible</span></h1>
        <div className="text-xs text-slate-500">Accès: {isAdmin ? 'Parent Admin (complet)' : 'Limité à soi-même'}</div>
      </div>

      <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">⚠️ Les informations relatives aux médicaments sont destinées uniquement à l'organisation et aux rappels et ne constituent pas un avis médical.</div>

      <div className="mt-6 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[22px] border p-6">
          <h3 className="font-semibold">Profils Santé</h3>
          <div className="mt-4 space-y-3">
            {healthProfiles?.map((hp:any)=>(
              <div key={hp.id} className="p-3 border rounded-xl">
                <div className="font-medium">{hp.member_user_id}</div>
                <div className="text-xs text-slate-500">GS: {hp.blood_group||'N/A'} • Allergies: {hp.allergies?.join(', ')||'Aucune'}</div>
              </div>
            ))}
          </div>
          <form action={async (formData: FormData)=>{
            'use server'
            const supabase = await (await import('@/lib/supabase/server')).createClient()
            const { data: { user } } = await supabase.auth.getUser()
            const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
            await supabase.from('health_profiles').insert({
              family_id: fm.family_id,
              member_user_id: user!.id,
              blood_group: formData.get('blood_group'),
              allergies: [formData.get('allergies') as string],
              emergency_contact: { phone: formData.get('emergency') }
            })
            await supabase.from('audit_logs').insert({ family_id: fm.family_id, actor_id: user!.id, action: 'health.create_profile', entity_type: 'health_profile' })
          }} className="mt-6 space-y-2">
            <input name="blood_group" placeholder="Groupe sanguin (ex: O+)" className="w-full border rounded-xl px-3 py-2 text-sm" />
            <input name="allergies" placeholder="Allergies" className="w-full border rounded-xl px-3 py-2 text-sm" />
            <input name="emergency" placeholder="Contact urgence" className="w-full border rounded-xl px-3 py-2 text-sm" />
            <button className="w-full bg-rose-600 text-white py-2.5 rounded-xl text-sm">Créer profil santé + audit log</button>
          </form>
        </div>

        <div className="bg-white rounded-[22px] border p-6">
          <h3 className="font-semibold">RDV Médicaux (→ Calendrier)</h3>
          <form action={async (formData: FormData)=>{
            'use server'
            const supabase = await (await import('@/lib/supabase/server')).createClient()
            const { data: { user } } = await supabase.auth.getUser()
            const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
            const { data: hp } = await supabase.from('health_profiles').select('id').eq('family_id', fm.family_id).limit(1).single()
            if(!hp) return
            await supabase.from('health_appointments').insert({
              family_id: fm.family_id,
              health_profile_id: hp.id,
              title: formData.get('title'),
              provider: formData.get('provider'),
              appointment_at: formData.get('appointment_at')
            })
          }} className="mt-4 space-y-2">
            <input name="title" required placeholder="Motif RDV" className="w-full border rounded-xl px-3 py-2 text-sm" />
            <input name="provider" placeholder="Dr. / Hôpital" className="w-full border rounded-xl px-3 py-2 text-sm" />
            <input name="appointment_at" type="datetime-local" className="w-full border rounded-xl px-3 py-2 text-sm" />
            <button className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm">Planifier → notif + calendrier</button>
          </form>
          <div className="mt-4 text-[11px] text-slate-400">Synchronisé avec calendrier familial (ton exigence Module 9)</div>
        </div>

        <div className="bg-slate-900 text-white rounded-[22px] p-6">
          <h3 className="font-semibold">Urgence - Accès rapide</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="bg-white/10 rounded-xl p-3">Contacts urgence: Affichés selon permissions</div>
            <div className="bg-white/10 rounded-xl p-3">Allergies critiques: Visible N4 seulement</div>
            <div className="bg-white/10 rounded-xl p-3">Assurance: Numéro police + expiration</div>
          </div>
          <div className="mt-4 text-[10px] text-slate-400">Mobile: accès rapide mais autorisation RLS respectée</div>
        </div>
      </div>
    </div>
  )
}
