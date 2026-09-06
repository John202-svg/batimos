import { createClient } from '@/lib/supabase/server'

export type SubscriptionStatus = 'TRIALING'|'ACTIVE'|'PAST_DUE'|'CANCELLED'|'EXPIRED'

export async function getSubscriptionState(family_id: string){
  const supabase = await createClient()
  const { data: sub } = await supabase.from('subscriptions').select('*').eq('family_id', family_id).single()
  if(!sub) return { status: 'EXPIRED' as SubscriptionStatus, isBlocked: true, daysLeft: 0, graceDaysLeft: 0 }

  const now = new Date()
  const periodEnd = new Date(sub.current_period_end)
  const trialEnd = new Date(sub.trial_end)

  // Calculs
  const isTrialing = sub.status === 'TRIALING' && trialEnd > now
  const isActive = sub.status === 'ACTIVE' && periodEnd > now
  const isPastDue = sub.status === 'PAST_DUE'
  const isExpired = sub.status === 'EXPIRED' || (isPastDue && periodEnd < new Date(now.getTime() - 7*24*3600*1000))

  const daysLeft = Math.ceil((periodEnd.getTime() - now.getTime())/(1000*3600*24))
  const graceDaysLeft = isPastDue ? Math.max(0, 7 + daysLeft) : 0 // daysLeft est négatif en PAST_DUE

  // Bloqué si EXPIRED ou PAST_DUE + 7j
  const isBlocked = sub.status === 'EXPIRED' || (isPastDue && graceDaysLeft <= 0)

  return {
    status: sub.status as SubscriptionStatus,
    isTrialing,
    isActive,
    isPastDue,
    isExpired: isExpired,
    isBlocked,
    daysLeft: Math.max(0, daysLeft),
    graceDaysLeft,
    current_period_end: sub.current_period_end,
    trial_end: sub.trial_end
  }
}

// Middleware helper: bloque accès si EXPIRED
export async function requireActiveSubscription(family_id: string){
  const state = await getSubscriptionState(family_id)
  if(state.isBlocked){
    throw new Error(`SUBSCRIPTION_EXPIRED:${state.graceDaysLeft}`)
  }
  return state
}
