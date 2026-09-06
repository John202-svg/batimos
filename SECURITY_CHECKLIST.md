# FamilyOS - Checklist Sécurité Production (Module 32 + 25)

## À valider avant déploiement commercial

### 1. Isolation Multi-Tenant (CRITIQUE)
- [ ] Toutes les tables ont family_id + RLS activée
- [ ] is_family_member() vérifié sur chaque policy
- [ ] Test Parcours 13: Famille A ne voit pas données Famille B (0 résultats)
- [ ] Bucket storage family-vault est PRIVÉ (public=false)
- [ ] Aucune URL signée publique > 1h pour docs N4

### 2. RBAC N3/N4
- [ ] Finance (expenses, bills, budgets): seulement parent_admin/parent_member
- [ ] Santé (health_*): member_user_id = auth.uid() OR parent_admin
- [ ] Staff role: ne voit ni finance ni santé
- [ ] Child/Teen: lecture seule calendrier/tâches, pas finance/santé autre membre
- [ ] Parcours 14 testé: accès santé non autorisé → 403 + audit_logs

### 3. Paystack
- [ ] Webhook vérifie HMAC SHA-512 x-paystack-signature
- [ ] Idempotence via paystack_event_id UNIQUE
- [ ] SERVICE_ROLE et PAYSTACK_SECRET jamais exposés NEXT_PUBLIC_
- [ ] Gestion webhooks dupliqués + retardés + échoués
- [ ] Machine d'état TRIALING→ACTIVE→PAST_DUE→CANCELLED→EXPIRED

### 4. Trial Anti-Abus
- [ ] Un seul trial par family_id (unique constraint)
- [ ] trial_end = trial_start + 7 jours
- [ ] Transition trial expiré → notification → PAST_DUE

### 5. Audit & Logs
- [ ] audit_logs insert sur: health.create, document.upload, staff.create, subscription.activated
- [ ] audit_logs RLS: seulement parent_admin peut lire
- [ ] audit_logs protégés contre modification (pas de policy update/delete)

### 6. Secrets
- [ ] .env.local non commité
- [ ] NEXT_PUBLIC_ seulement pour ANON_KEY et URL
- [ ] Vérifier: grep -r "SERVICE_ROLE" app/ doit retourner 0

### 7. Tests à exécuter
```bash
pnpm test:security # 12 tests critiques
pnpm test:e2e      # 14 parcours utilisateurs
```

### 8. Admin SaaS (Module 27)
- [ ] Admin plateforme ne peut pas lire documents privés / santé / messages sans mécanisme support explicite + audité + temporaire
- [ ] Toute action admin exceptionnelle loggée

## Commande finale avant prod
```bash
supabase db reset --test avec 2 familles + 6 rôles
pnpm test:security --run
# Tous les tests doivent passer vert
```
