# FamilyOS - Guide Déploiement Production Finale V7

## Architecture Finale
- Web: Next.js 14 App Router (Vercel)
- Mobile: Expo SDK 51 Android + iOS (EAS)
- Backend: Supabase Postgres + Auth + RLS + Storage + Edge Functions
- Paiement: Paystack
- Email: Resend
- Push: Expo Notifications + FCM

## 1. Supabase Setup (5 min)

### Créer projet
https://supabase.com → New Project → Region EU ou proche Lagos

### SQL - Exécuter dans l'ordre dans SQL Editor
1. `supabase/schema.sql` - Core 15 tables + RLS + trial trigger
2. `supabase/schema_module3.sql` - Achats, Factures, Budgets, Incomes
3. `supabase/schema_module4.sql` - Conversations, Messages
4. `supabase/schema_module5.sql` - Enfants, Staff, Projets, Événements

### Storage - Bucket privé (CRITIQUE sécurité)
Dashboard → Storage → New Bucket
- Name: `family-vault`
- Public: **NON** (false) - Pas d'URL publique pour docs N4
- Policies: RLS vérifie is_family_member()

### Auth
Authentication → Settings
- Enable Email
- Enable Google OAuth (optionnel)
- Site URL: https://tondomaine.com
- Redirect URLs: https://tondomaine.com/auth/callback

## 2. Variables d'Environnement

### Web - .env.local (Vercel → Settings → Environment Variables)
```env
# Supabase (Public = ANON_KEY seulement)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # SECRET - Jamais NEXT_PUBLIC_

# App
NEXT_PUBLIC_APP_URL=https://familyos.app

# Paystack (Test puis Live)
PAYSTACK_SECRET_KEY=sk_test_xxx # SECRET
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx

# Email
RESEND_API_KEY=re_xxx

# i18n
NEXT_PUBLIC_DEFAULT_LOCALE=fr
```

### Mobile - mobile/.env
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
EXPO_PUBLIC_APP_URL=exp://...
```

### Vérification sécurité secrets (Module 25)
```bash
# Doit retourner 0 résultats
grep -r "SERVICE_ROLE" app/ --include="*.tsx"
grep -r "PAYSTACK_SECRET" app/ --include="*.tsx"
grep -r "NEXT_PUBLIC.*SERVICE" .
```

## 3. Edge Function Paystack Webhook (Module 20)

### Déployer
```bash
supabase functions deploy paystack-webhook --no-verify-jwt
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxx SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
```

### Paystack Dashboard → Settings → Webhooks
- URL: https://xxx.supabase.co/functions/v1/paystack-webhook
- Events: `charge.success`, `invoice.payment_failed`, `subscription.create`, `subscription.disable`
- Le code vérifie HMAC SHA-512 + idempotence paystack_event_id UNIQUE

## 4. Web - Déployer Vercel

```bash
vercel --prod
# Ou GitHub connect → Vercel auto deploy
```

### Checklist Vercel
- [ ] Env vars renseignées
- [ ] Build OK
- [ ] Test parcours 1: /login → /families/new → /dashboard badge TRIALING
- [ ] Test parcours 13: 2 familles différentes ne voient pas données cross
- [ ] Test bilingue: switch FR/EN sans perte données

## 5. Mobile - Déployer EAS (Module 23)

```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
# Configure app.json projectId

# Build
eas build --platform android # APK/AAB
eas build --platform ios # IPA

# Submit stores
eas submit --platform android
eas submit --platform ios
```

### Expo Push Notifications
- `app.json` → plugins: expo-notifications
- FCM: Firebase Console → Cloud Messaging → Server Key → EAS credentials
- APNs: Apple Developer → Keys → EAS credentials

## 6. Bilingue - Vérification 100% (Module 21)

### Architecture i18n
- `middleware.ts` → next-intl avec locales ['fr','en'], default 'fr'
- `messages/fr.json` et `en.json` - 100% clés traduites
- `app/layout.tsx` → NextIntlClientProvider

### Clés traduites (exemple)
```json
// fr.json
{
  "dashboard": "Tableau de bord",
  "calendar": "Calendrier familial",
  "tasks": "Tâches et corvées",
  "shopping": "Achats du foyer",
  "bills": "Factures et paiements",
  "budget": "Budget familial - Règle: Budget → Dépenses → Solde restant",
  "children": "Enfants et gestion scolaire",
  "staff": "Personnel domestique",
  "health": "Santé familiale - Niveau N4 hautement sensible",
  "health_disclaimer": "Les informations relatives aux médicaments sont destinées uniquement à l'organisation et aux rappels et ne constituent pas un avis médical.",
  "projects": "Projets familiaux",
  "events": "Événements familiaux",
  "vault": "Coffre-fort familial numérique - Stockage sécurisé privé",
  "messages": "Messagerie familiale privée",
  "subscription": "Abonnement - TRIALING → ACTIVE → PAST_DUE",
  "trial": "Essai gratuit 7 jours - {days} jours restants",
  "trial_auto": "Essai gratuit activé automatiquement à la création famille",
  "security_n4": "NIVEAU N4 - Hautement sensible - RLS + audit",
  "security_n3": "NIVEAU N3 - Finance protégée - Parent uniquement",
  "no_access": "Accès restreint - Niveau {level}",
  "emergency": "Urgence - Accès rapide mobile - RLS respectée"
}
```

### Tester bilingue
```bash
# Parcours 12: Switch EN/FR sans perte données
# 1. Va /dashboard en FR
# 2. Change langue → EN (middleware.ts)
# 3. Vérifie données toujours là + textes traduits
# 4. Crée tâche en EN → Switch FR → Tâche toujours là traduite
```

### Mobile bilingue
- Expo Localization + i18n-js
- Même clés fr/en
- Device locale auto-detect mais switch manuel possible dans paramètres famille

## 7. Tests Avant Prod (Module 32)

```bash
# Sécurité critique
pnpm test:security # 12 tests - Doit être 12/12 PASS

# E2E 14 parcours
pnpm test:e2e

# Checklist SECURITY_CHECKLIST.md - 8 sections à cocher
```

## 8. Monitoring Prod

- Supabase → Logs → Edge Functions (webhook Paystack)
- Vercel → Analytics + Logs
- Sentry (optionnel): Ajouter pour erreurs
- Audit_logs table: Vérifier health.create, document.upload

## 9. Domaines & SSL

- Vercel → Domains → Add familyos.app
- Supabase → Auth → Site URL = https://familyos.app
- Paystack → Webhook URL = https://xxx.supabase.co/functions/v1/paystack-webhook (pas ton domaine Vercel, mais Supabase)

## Coût mensuel estimé
- Supabase Free → Pro $25/mois (après 500MB)
- Vercel Hobby Free → Pro $20/mois
- Paystack: 1.5% + 100 NGN par transaction
- Resend: 3000 emails/mois free
- EAS Build: Free tier + $29/mois si builds fréquents

Total MVP: ~$25-50/mois pour démarrer

## Support
- Docs: /docs folder
- Architecture: /familyos_architecture_master_plan_agentic_artifact_1...
