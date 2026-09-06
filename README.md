# FamilyOS - Starter Kit SaaS (Option A)

Stack: Next.js 14 App Router + TypeScript + Supabase + Tailwind + next-intl + Paystack

## 1. Installation
```bash
pnpm i # ou npm i
cp .env.example .env.local
```

## 2. Supabase Setup
1. Crée un projet Supabase
2. Va dans SQL Editor -> exécute `supabase/schema.sql` (celui du kit)
3. Active Auth Email + Google si tu veux
4. Crée un bucket Storage privé `family-vault`

## 3. Env
Renseigne SUPABASE_URL, ANON_KEY, SERVICE_ROLE, PAYSTACK_SECRET, RESEND_API_KEY

## 4. Lancer
```bash
pnpm dev
```

## Architecture livrée
- multi-tenant par family_id partout
- RLS activé sur toutes les tables
- RBAC roles: parent_admin, parent_member, teen, child, staff, other
- trial 7j auto à la création famille
- i18n EN/FR
- Edge Function webhook Paystack idempotente
