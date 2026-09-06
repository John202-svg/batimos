import { use } from 'react'
export default function PrivacyPage({ params: { locale } }: { params: { locale: string } }){
  const isFr = locale === 'fr' || !locale
  return (
    <div className="max-w-4xl mx-auto p-8 prose">
      <h1>{isFr ? 'Politique de Confidentialité - FamilyOS' : 'Privacy Policy - FamilyOS'}</h1>
      <p className="text-sm text-slate-500">Dernière mise à jour: 6 janvier 2026 - Conforme RGPD (UE), NDPR (Nigeria), Loi Cameroun 2010/012</p>
      
      <h2>{isFr ? '1. Données collectées' : '1. Data collected'}</h2>
      <ul>
        <li><strong>{isFr ? 'Niveau N1 - Faible sensibilité' : 'Level N1 - Low sensitivity'}:</strong> {isFr ? 'Prénom, langue, préférences' : 'First name, language, preferences'}</li>
        <li><strong>N2 - Opérationnel:</strong> {isFr ? 'Calendrier, tâches, achats' : 'Calendar, tasks, shopping'}</li>
        <li><strong>N3 - Sensible:</strong> {isFr ? 'Finance, factures, personnel, documents privés - Accès Parent uniquement' : 'Finance, bills, staff, private docs - Parent access only'}</li>
        <li><strong>N4 - Hautement sensible (Module 9 & 12):</strong> {isFr ? 'Santé: groupe sanguin, allergies, médicaments, vaccins, docs médicaux. Coffre-fort: passeports, identités, assurances. Stockage chiffré AES-256, bucket privé family-vault, RLS + audit_logs, pas d'URL publique.' : 'Health: blood group, allergies, medications, vaccines, medical docs. Vault: passports, IDs, insurance. AES-256 encrypted, private bucket family-vault, RLS + audit_logs, no public URL.'}</li>
      </ul>

      <h2>{isFr ? '2. Base légale (RGPD Art.6) & NDPR' : '2. Legal basis (GDPR Art.6) & NDPR'}</h2>
      <p>{isFr ? 'Contrat (fourniture service familial), Intérêt légitime (sécurité), Consentement explicite pour santé N4 (case à cocher), Obligation légale (facturation Paystack). Pour Nigeria: NDPR Section 2.2 - Consentement libre, spécifique, éclairé.' : 'Contract (family service), Legitimate interest (security), Explicit consent for health N4 (checkbox), Legal obligation (Paystack billing). For Nigeria: NDPR Sec 2.2 - Free, specific, informed consent.'}</p>

      <h2>{isFr ? '3. Stockage & Protection' : '3. Storage & Protection'}</h2>
      <ul>
        <li>{isFr ? 'Hébergement: Supabase (Postgres) région EU/US, chiffré au repos AES-256' : 'Hosting: Supabase (Postgres) EU/US region, encrypted at rest AES-256'}</li>
        <li>{isFr ? 'Isolation multi-tenant: family_id + RLS is_family_member() - Cross-famille impossible (Parcours 13 testé)' : 'Multi-tenant isolation: family_id + RLS is_family_member() - Cross-family impossible (Journey 13 tested)'}</li>
        <li>{isFr ? 'Santé N4: Accès seulement soi-même ou parent_admin + audit log obligatoire' : 'Health N4: Access self or parent_admin only + mandatory audit log'}</li>
        <li>{isFr ? 'Coffre-fort: Bucket privé family-vault, pas d'URL publique, documents avec expiration + rappel' : 'Vault: Private bucket family-vault, no public URL, documents with expiry + reminder'}</li>
        <li>{isFr ? 'Admin SaaS: Pas d'accès auto aux contenus privés familles sans mécanisme support explicite, audité, temporaire (Module 27)' : 'SaaS Admin: No auto access to private family contents without explicit, audited, temporary support mechanism (Module 27)'}</li>
      </ul>

      <h2>{isFr ? '4. Droits - Droit à l'oubli (RGPD Art.17 & NDPR)' : '4. Rights - Right to be forgotten (GDPR Art.17 & NDPR)'}</h2>
      <p>{isFr ? 'Vous pouvez demander suppression complète compte et données famille: Paramètres → Supprimer ma famille. Suppression en cascade: families → family_members → tous les modules (calendrier, santé, budget, docs, messages). Audit_logs conservés 1 an pour obligation légale puis anonymisés. Délai: 30 jours max. Email: privacy@familyos.app' : 'You can request complete deletion of account and family data: Settings → Delete my family. Cascade deletion: families → family_members → all modules (calendar, health, budget, docs, messages). Audit_logs kept 1 year for legal then anonymized. Delay: 30 days max. Email: privacy@familyos.app'}</p>
      <ul>
        <li>{isFr ? 'Droit accès: Export JSON de toutes vos données' : 'Right access: JSON export of all your data'}</li>
        <li>{isFr ? 'Droit rectification: Modifier dans chaque module' : 'Right rectification: Edit in each module'}</li>
        <li>{isFr ? 'Droit opposition: Désactiver notifications' : 'Right objection: Disable notifications'}</li>
        <li>{isFr ? 'Droit portabilité: Export JSON' : 'Right portability: JSON export'}</li>
      </ul>

      <h2>5. Cookies</h2>
      <p>{isFr ? 'Essentiels: auth (Supabase session), locale (fr/en), analytics anonymisés PostHog (sans données personnelles). Pas de pub tierce. Bandeau consentement au premier visit. Refus possible sauf essentiels.' : 'Essential: auth (Supabase session), locale (fr/en), anonymized analytics PostHog (no personal data). No third-party ads. Consent banner on first visit. Refusal possible except essential.'}</p>

      <h2>{isFr ? '6. Sous-traitants' : '6. Sub-processors'}</h2>
      <ul>
        <li>Supabase (hébergement DB + Auth + Storage)</li>
        <li>Paystack (paiement - Nigeria/Cameroun/Monde)</li>
        <li>Resend (emails transactionnels - SPF/DKIM/DMARC configurés)</li>
        <li>Vercel (hébergement web)</li>
        <li>Expo/EAS (build mobile)</li>
        <li>PostHog (analytics anonymisé, hébergé EU, RGPD compliant)</li>
      </ul>

      <h2>{isFr ? '7. Contact DPO' : '7. DPO Contact'}</h2>
      <p>Email: privacy@familyos.app - {isFr ? 'Réponse sous 30 jours' : 'Response within 30 days'} - {isFr ? 'Toutes familles du monde' : 'All families worldwide'}</p>
    </div>
  )
}
