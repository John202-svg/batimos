// Analytics Produit - PostHog (léger, RGPD compliant, pour toutes familles monde) - Module 5
import posthog from 'posthog-js'

export function initAnalytics(){
  if(typeof window === 'undefined') return
  
  const consent = localStorage.getItem('cookie-consent')
  if(consent){
    const { analytics } = JSON.parse(consent)
    if(!analytics) return // Respecte refus
  }

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    // Ne jamais tracker santé N4 ou coffre-fort
    before_send: (event) => {
      if(event.properties){
        const props = JSON.stringify(event.properties)
        if(props.includes('health') || props.includes('vault') || props.includes('blood_group')){
          return null // Bloque tracking données sensibles
        }
      }
      return event
    },
    // RGPD compliant
    opt_out_capturing_by_default: true, // Opt-in via cookie banner
    capture_pageview: true,
    autocapture: false // Pas d'autocapture agressive
  })
}

// Tunnel conversion - Pour toutes familles monde
export const trackFunnel = {
  visitor: () => posthog.capture('visitor_landing'),
  signup: (family_id: string) => posthog.capture('signup_completed', { family_id }),
  trial_started: (family_id: string) => posthog.capture('trial_started', { family_id, trial_days: 7 }),
  trial_ending_j1: (family_id: string) => posthog.capture('trial_ending_j1', { family_id }),
  payment_initiated: (family_id: string) => posthog.capture('payment_initiated', { family_id, amount: 10 }),
  payment_success: (family_id: string) => posthog.capture('payment_success', { family_id, revenue: 10 }),
  payment_failed: (family_id: string, reason: string) => posthog.capture('payment_failed', { family_id, reason }),
  suspension: (family_id: string) => posthog.capture('account_suspended', { family_id, after_days: 7 }),
  reactivation: (family_id: string) => posthog.capture('account_reactivated', { family_id }),
  feature_used: (family_id: string, feature: string) => posthog.capture('feature_used', { family_id, feature }) // calendar, tasks, health, etc. mais pas données sensibles
}

// Dashboard PostHog à créer:
// 1. Funnel: Visitor → Signup → Trial → Payment Success (conversion rate)
// 2. Drop-off: Où abandonnent? Fin essai? Paiement?
// 3. Retention: Combien reviennent après J7, J30?
// 4. Feature adoption: % familles utilisent calendrier, budget, santé (pas contenu santé)
// 5. Geo: Répartition familles par pays (pour toutes familles monde)
