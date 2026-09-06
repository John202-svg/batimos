# Checklist Légal & Technique - Lancement Commercial Global

## 1. Conformité Légale RGPD/NDPR - Pour toutes familles monde
- [x] Privacy Policy / Politique Confidentialité (app/(legal)/privacy/page.tsx) - N1-N4 expliqué, base légale Art.6, droits, sous-traitants
- [x] CGV/CGU (app/(legal)/terms/page.tsx) - Essai 7j, $10/mois, machine états, résiliation, santé disclaimer
- [x] Bandeau cookies (components/CookieBanner.tsx) - Essentiels vs Analytics, consentement, RGPD/NDPR, santé jamais trackée
- [x] Droit à l'oubli (app/api/delete-family/route.ts) - DELETE_ALL_MY_FAMILY_DATA, cascade, audit 1 an, 30j max
- [ ] DPO: privacy@familyos.app + legal@familyos.app - Réponse 30j
- [ ] Registre traitement (interne) - Liste N1-N4 + finalités + durées

## 2. Infrastructure Emails SPF/DKIM/DMARC
- [x] Doc docs/EMAIL_DNS_SETUP.md - SPF, DKIM 2 clés, DMARC p=quarantine puis reject, MX, vérif dig + mail-tester
- [ ] Resend Domain Verified: familyos.app ✅
- [ ] From: noreply@familyos.app (pas gmail)
- [ ] Test mail-tester.com >9/10
- [ ] Bounce rate <2%, spam <0.1%

## 3. Monitoring Erreurs & Perf
- [x] Sentry Web (sentry.client.config.ts + server.config.ts) - traces 10%, filtre N4/N3, ignore bénignes
- [x] Sentry Mobile (mobile/lib/sentry.ts) - même filtre
- [ ] SENTRY_DSN dans Vercel + EAS
- [ ] Supabase → Logs → Slow queries >1s → index
- [ ] Vercel Analytics + Logs

## 4. Templates Emails Bilingues
- [x] lib/email/templates.ts - 5 templates FR/EN HTML responsive marque indigo:
  - welcome_trial (J0 essai 7j)
  - trial_ending_j1 (J-1 avant fin essai)
  - payment_failed (échec Paystack → PAST_DUE)
  - suspension (J+7 EXPIRED → /blocked)
  - reactivation (paiement → ACTIVE)
- [ ] Resend → Templates → Import HTML
- [ ] Test en FR et EN

## 5. Analytics Produit - Tunnel Conversion
- [x] lib/analytics.ts - PostHog RGPD compliant, opt-in via cookie banner, filtre N4/N3, before_send bloque santé/vault
- [x] Tunnel: visitor → signup → trial_started → payment_initiated → payment_success → suspension → reactivation
- [ ] POSTHOG_KEY dans Vercel + mobile
- [ ] Dashboard PostHog:
  - Funnel conversion % (où abandonnent?)
  - Retention J7/J30
  - Feature adoption % (calendrier, budget, santé - pas contenu)
  - Geo: répartition familles par pays (toutes familles monde)
  - Drop-off fin essai vs paiement

## Pour toutes les familles du monde
- [x] i18n FR/EN 100% + extensible
- [x] Paystack supporte cartes mondiales + Mobile Money Afrique (MTN, Orange, etc.)
- [x] Emails délivrabilité mondiale (AWS SES via Resend)
- [x] RGPD (UE) + NDPR (Nigeria) + Loi Cameroun 2010/012 mentionnés
- [x] Timezone agnostic - dates en UTC, affichage local
- [x] Devise $10/mois + support multi-devises Paystack future

## Commande finale avant lancement commercial global
```bash
pnpm test:security # 12/12 PASS
# Vérif DNS
dig TXT familyos.app
dig TXT _dmarc.familyos.app
# Test email
mail-tester.com → >9/10
# Vérif bilingue
# Switch FR/EN → 0 perte données
# Vérif droit oubli
# POST /api/delete-family avec confirm DELETE_ALL_MY_FAMILY_DATA
```
