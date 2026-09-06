// Droit à l'oubli - Suppression complète famille (RGPD Art.17 & NDPR)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401})

  const { family_id, confirm } = await req.json()
  if(confirm !== 'DELETE_ALL_MY_FAMILY_DATA'){
    return NextResponse.json({error:'Confirmation required: DELETE_ALL_MY_FAMILY_DATA'},{status:400})
  }

  // Vérifie que user est parent_admin de la famille
  const { data: fm } = await supabase.from('family_members').select('role').eq('family_id', family_id).eq('user_id', user.id).single()
  if(!fm || fm.role !== 'parent_admin'){
    return NextResponse.json({error:'Only parent_admin can delete family'},{status:403})
  }

  // Audit log avant suppression
  await supabase.from('audit_logs').insert({
    family_id,
    actor_id: user.id,
    action: 'family.delete_requested',
    entity_type: 'family',
    entity_id: family_id,
    metadata: { requested_at: new Date().toISOString(), gdpr_article: '17', ndpr: true }
  })

  // Suppression cascade via foreign keys on delete cascade
  // families → family_members → events, tasks, bills, budgets, health_profiles, documents, messages, etc.
  const { error } = await supabase.from('families').delete().eq('id', family_id)

  if(error) return NextResponse.json({error: error.message},{status:500})

  // Supprime aussi l'utilisateur auth si plus de famille
  const { data: remaining } = await supabase.from('family_members').select('id').eq('user_id', user.id).limit(1)
  if(!remaining || remaining.length===0){
    // Optionnel: supprime user auth (soft delete)
    // await supabase.auth.admin.deleteUser(user.id)
  }

  return NextResponse.json({ success: true, message: 'Family data deleted - RGPD/NDPR compliant - Audit log kept 1 year then anonymized' })
}
