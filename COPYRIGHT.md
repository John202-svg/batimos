# Preuve de Propriété - FamilyOS SaaS
# Pour toutes les familles du monde - Mais propriété intellectuelle protégée

## 1. Déclaration de Propriété Intellectuelle

**Œuvre:** FamilyOS - Système d'Exploitation Numérique de la Famille
**Auteur/Créateur:** [Votre Nom / Votre Société]
**Date de création:** 2024-2026
**Version:** V10 Final Commercial (77 Ko, 44 modules, 100% bilingue FR/EN, Web + Mobile Android/iOS)

**Description de l'œuvre originale:**
- Architecture multi-tenant avec RLS is_family_member()
- Modèle d'accès santé N1-N4 avec audit_logs
- Machine d'états abonnement TRIALING→ACTIVE→PAST_DUE→EXPIRED J+7→Réactivation
- Matrice intégration Santé ↔ Calendrier ↔ Budget ↔ Coffre-fort
- 25 tables Postgres, 15 modules produit, 17 modules architecture, 12 modules process
- Code source complet Next.js 14 + Expo SDK 51 + Supabase + Paystack + Resend + PostHog + Sentry
- Bilingue FR/EN 100% dès conception, bandeau cookies RGPD/NDPR, droit à l'oubli

**Cette œuvre est protégée par:**
- Droit d'auteur (Code de la propriété intellectuelle + Berne Convention - Toutes familles monde mais IP protégée)
- Secret des affaires (algorithmes RLS, dunning J+7, isolation family_id)
- Base de données (structure 25 tables + policies)

## 2. Preuves Techniques d'Antériorité (Fais foi)

### A. Empreinte SHA-256 du code source complet
Voir PROOF_HASHES.json - Hash de chaque fichier + hash global ZIP V10

### B. Historique Git (si repo Git)
```bash
git log --reverse --format="%H %ad %s" --date=iso > git-history.txt
git log --stat > git-stats.txt
# Premier commit = preuve antériorité
```

### C. Horodatage blockchain (OpenTimestamps - Preuve infalsifiable)
```bash
# Installer: pip install opentimestamps-client
# Horodater le hash global du ZIP V10 sur Bitcoin blockchain
ots stamp familyos-starter-v10-final-commercial.zip
# Vérifiable par tiers: ots verify familyos-starter-v10-final-commercial.zip.ots
# Preuve que le fichier existait à date T sur blockchain Bitcoin - Infalsifiable
```

### D. Dépôt légal
- GitHub Private Repo avec historique complet + dates
- Supabase Project Creation Date (Dashboard → Settings → Created At)
- Vercel Deployment History
- EAS Build History (Expo)
- Paystack Account Creation
- Domaine familyos.app WHOIS Creation Date

## 3. Preuves Juridiques

### A. Dépôt INPI / OAPI / USPTO (Recommandé)
- **France:** INPI - Dépôt enveloppe e-Soleau (15€) - Preuve antériorité 5 ans - https://www.inpi.fr
  - Déposer ZIP V10 + architecture PDF
- **Afrique OAPI (Cameroun, etc.):** OAPI - 17 pays Afrique francophone - Dépôt marque + logiciel
- **Nigeria:** Trademarks, Patents and Designs Registry + NDPR compliance filing
- **USA:** Copyright Office - Form TX (55$) + USPTO Trademark FamilyOS

### B. Marque FamilyOS
- Déposer marque verbale "FamilyOS" + logo en classes 9 (logiciel), 42 (SaaS), 45 (services familiaux)
- Vérifier disponibilité: https://www3.wipo.int/branddb/fr/
- OAPI: Classe 9, 42 couvre Cameroun, Nigeria (via ARIPO), etc.

### C. Société & Contrats
- Créer société (SAS, SARL, LLC) - Factures Paystack au nom société
- Contrats: Cession droits si dev externe, NDA, Contrats travail avec clause IP
- CGV/CGU: Clause "FamilyOS est marque déposée et logiciel propriétaire - Tous droits réservés"

### D. Licence Propriétaire
Voir LICENSE file - Propriétaire, pas open-source

## 4. Comment prouver devant investisseur/tribunal?

**Pack à fournir:**
1. COPYRIGHT.md (ce fichier) + LICENSE
2. PROOF_HASHES.json - SHA-256 de tous fichiers + date
3. Git history complet avec premier commit 2024
4. OpenTimestamps .ots sur Bitcoin (infalsifiable)
5. Captures Supabase Project Created At, Vercel, EAS, Domaine WHOIS
6. Dépôt INPI e-Soleau ou OAPI certificat
7. Factures Paystack, Resend, Supabase au nom société
8. Captures previews V1-V10 avec dates

**Ordre de force probante:**
1. OpenTimestamps Bitcoin (plus fort - infalsifiable, décentralisé, mondial)
2. Dépôt INPI/OAPI/USPTO (officiel étatique)
3. Git history + GitHub private + Supabase creation date (technique)
4. WHOIS domaine + factures (commercial)

## 5. Protection continue

- Ne jamais publier code source complet en public
- NDA avec tout dev/freelance + clause cession IP
- Watermark previews si partage investisseur
- Déposer chaque version majeure V11, V12, etc. en e-Soleau
