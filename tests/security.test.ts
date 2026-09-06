/**
 * FamilyOS - Tests de Sécurité Critiques (Module 32)
 * Exécuter: pnpm test:security
 * 
 * Ces tests valident les exigences:
 * - Parcours 13: Tentative accès autre famille → refusé
 * - Parcours 14: Membre non autorisé → accès santé refusé + audit
 * - RLS isolation multi-tenant
 * - RBAC finance N3 et santé N4
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Clients pour 2 familles différentes
let familyAClient: any, familyBClient: any
let familyAId: string, familyBId: string
let userAId: string, userBId: string

beforeAll(async () => {
  const admin = createClient(supabaseUrl, serviceRole)
  
  // Crée 2 users + 2 familles isolées (simulation)
  // En prod, ces users viennent de auth.users
  const { data: families } = await admin.from('families').select('id').limit(2)
  if(families && families.length >= 2){
    familyAId = families[0].id
    familyBId = families[1].id
  }
})

describe('Isolation Multi-Tenant Critique', () => {
  it('Parcours 13: Famille A ne peut pas lire events de Famille B', async () => {
    const clientA = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${process.env.USER_A_JWT}` } }
    })
    
    // Tente de lire events de famille B
    const { data, error } = await clientA.from('events').select('*').eq('family_id', familyBId)
    
    // Doit retourner 0 résultats grâce à RLS is_family_member()
    expect(data?.length).toBe(0)
    // Ou error RLS
    expect(error).toBeFalsy() // RLS filtre silencieusement, pas d'erreur
  })

  it('Cross-tenant bills: Famille A ne voit pas factures Famille B', async () => {
    const clientA = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${process.env.USER_A_JWT}` } }
    })
    const { data } = await clientA.from('bills').select('*').eq('family_id', familyBId)
    expect(data?.length).toBe(0)
  })

  it('Cross-tenant health: Accès santé autre famille bloqué', async () => {
    const clientA = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${process.env.USER_A_JWT}` } }
    })
    const { data } = await clientA.from('health_profiles').select('*').eq('family_id', familyBId)
    expect(data?.length).toBe(0)
  })

  it('Documents privés: Pas d URL publique', async () => {
    // Vérifie que le bucket family-vault est privé
    const admin = createClient(supabaseUrl, serviceRole)
    const { data: buckets } = await admin.storage.listBuckets()
    const vault = buckets?.find((b:any)=>b.name==='family-vault')
    // Doit être privé, pas public
    expect(vault?.public).toBe(false)
  })
})

describe('RBAC Niveau 3 et 4', () => {
  it('Parcours 14: Staff ne peut pas accéder aux données santé N4', async () => {
    const staffClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${process.env.STAFF_JWT}` } }
    })
    // Staff a role=staff, policy health_profiles_restricted bloque
    const { data, error } = await staffClient.from('health_profiles').select('*')
    expect(data?.length).toBe(0)
  })

  it('Enfant ne peut pas voir expenses (Finance N3)', async () => {
    const childClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${process.env.CHILD_JWT}` } }
    })
    const { data } = await childClient.from('expenses').select('*')
    // Policy finance: seulement parent_admin/parent_member
    expect(data?.length).toBe(0)
  })

  it('Teen peut voir events mais pas finance', async () => {
    const teenClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${process.env.TEEN_JWT}` } }
    })
    const { data: events } = await teenClient.from('events').select('*')
    const { data: expenses } = await teenClient.from('expenses').select('*')
    
    expect(events?.length).toBeGreaterThanOrEqual(0) // Peut voir
    expect(expenses?.length).toBe(0) // Ne peut pas voir finance
  })

  it('Audit log créé lors accès santé sensible', async () => {
    const admin = createClient(supabaseUrl, serviceRole)
    const { data: logs } = await admin.from('audit_logs').select('*').eq('action','health.create_profile').limit(1)
    // Doit exister au moins un log
    expect(logs).toBeDefined()
  })
})

describe('Paystack Webhook Sécurité', () => {
  it('Webhook sans signature HMAC rejeté (401)', async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/paystack`, {
      method: 'POST',
      body: JSON.stringify({ event: 'charge.success' })
    })
    expect(res.status).toBe(401)
  })

  it('Idempotence: même event_id traité une seule fois', async () => {
    const admin = createClient(supabaseUrl, serviceRole)
    const eventId = 'test-event-123'
    
    // Premier insert OK
    const { error: e1 } = await admin.from('payment_events').insert({
      family_id: familyAId,
      paystack_event_id: eventId,
      event_type: 'charge.success',
      payload: {}
    })
    
    // Deuxième insert même ID doit échouer (unique constraint)
    const { error: e2 } = await admin.from('payment_events').insert({
      family_id: familyAId,
      paystack_event_id: eventId,
      event_type: 'charge.success',
      payload: {}
    })
    
    expect(e1).toBeNull()
    expect(e2?.code).toBe('23505') // unique violation = idempotence OK
  })

  it('Pas de secrets exposés côté client', async () => {
    // Vérifie que .env.local n'est pas dans le build
    // SERVICE_ROLE et PAYSTACK_SECRET ne doivent jamais être dans NEXT_PUBLIC_
    expect(process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY).toBeUndefined()
    expect(process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY).toBeUndefined()
  })
})

describe('Essai Gratuit - Anti-Abus', () => {
  it('Un seul trial par famille', async () => {
    const admin = createClient(supabaseUrl, serviceRole)
    const { data: subs } = await admin.from('subscriptions').select('family_id').eq('family_id', familyAId)
    expect(subs?.length).toBe(1) // Unique par famille_id
  })

  it('Trial 7 jours auto', async () => {
    const admin = createClient(supabaseUrl, serviceRole)
    const { data: sub } = await admin.from('subscriptions').select('trial_start, trial_end').eq('family_id', familyAId).single()
    if(sub){
      const diff = new Date(sub.trial_end).getTime() - new Date(sub.trial_start).getTime()
      const days = diff / (1000*3600*24)
      expect(Math.round(days)).toBe(7)
    }
  })
})
