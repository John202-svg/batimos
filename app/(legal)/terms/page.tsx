export default function TermsPage({ params: { locale } }: { params: { locale: string } }){
  const isFr = locale === 'fr' || !locale
  return (
    <div className="max-w-4xl mx-auto p-8 prose">
      <h1>{isFr ? 'CGV/CGU - Conditions Générales' : 'Terms & Conditions - FamilyOS'}</h1>
      <p className="text-sm text-slate-500">{isFr ? 'Applicable à toutes les familles du monde' : 'Applicable to all families worldwide'} - 6 jan 2026</p>

      <h2>1. {isFr ? 'Objet' : 'Object'}</h2>
      <p>{isFr ? 'FamilyOS est le Système d'Exploitation Numérique de la Famille: organisation, foyer, finance, école, santé (non avis médical), docs, communication, projets, événements, notifications. SaaS multi-tenant à 10$/mois, essai 7 jours sans carte, toutes familles du monde.' : 'FamilyOS is the Digital Operating System for Family: organization, home, finance, school, health (not medical advice), docs, comms, projects, events, notifications. SaaS multi-tenant $10/month, 7-day trial no card, all families worldwide.'}</p>

      <h2>2. {isFr ? 'Abonnement & Paiement' : 'Subscription & Payment'}</h2>
      <ul>
        <li>{isFr ? 'Essai 7 jours automatique à création famille - Sans carte - Un seul essai par famille (anti-abus)' : '7-day trial auto at family creation - No card - One trial per family (anti-abuse)'}</li>
        <li>{isFr ? 'Premium 10$/mois après essai via Paystack (supporte cartes mondiales + Mobile Money Afrique)' : 'Premium $10/month after trial via Paystack (supports worldwide cards + Africa Mobile Money)'}</li>
        <li>{isFr ? 'Machine d'états: TRIALING → ACTIVE → PAST_DUE (rappel J0) → Rappel J+3 → Rappel J+6 → EXPIRED (déconnexion J+7) → Réactivation immédiate au paiement' : 'State machine: TRIALING → ACTIVE → PAST_DUE (reminder D0) → Reminder D+3 → Reminder D+6 → EXPIRED (disconnect D+7) → Immediate reactivation on payment'}</li>
        <li>{isFr ? 'Facturation: Mensuelle, renouvellement automatique, annulable à tout moment dans Paramètres → Abonnement' : 'Billing: Monthly, auto-renewal, cancellable anytime in Settings → Subscription'}</li>
        <li>{isFr ? 'Remboursement: 14 jours après premier paiement si non utilisé (droit rétractation UE)' : 'Refund: 14 days after first payment if unused (EU withdrawal right)'}</li>
      </ul>

      <h2>3. {isFr ? 'Obligations' : 'Obligations'}</h2>
      <p>{isFr ? 'Utilisateur: Ne pas partager accès hors famille, ne pas tenter cross-tenant (Parcours 13 bloqué), ne pas stocker données illégales dans coffre-fort. FamilyOS: Fournir service avec RLS, isolation family_id, chiffrage, audit, pas d'accès admin auto aux contenus privés (Module 27).' : 'User: Do not share access outside family, do not attempt cross-tenant (Journey 13 blocked), do not store illegal data in vault. FamilyOS: Provide service with RLS, family_id isolation, encryption, audit, no admin auto access to private contents (Module 27).'}</p>

      <h2>4. {isFr ? 'Santé - Avertissement' : 'Health - Disclaimer'}</h2>
      <p className="bg-amber-50 border border-amber-200 p-4 rounded-xl">{isFr ? 'Module 9 Santé: Les informations relatives aux médicaments sont destinées uniquement à l'organisation et aux rappels et ne constituent pas un avis médical. Consultez des professionnels de santé qualifiés. FamilyOS n'est pas un dispositif médical.' : 'Module 9 Health: Medication information is for organization and reminders only and does not constitute medical advice. Consult qualified healthcare professionals. FamilyOS is not a medical device.'}</p>

      <h2>5. {isFr ? 'Résiliation & Droit à l'oubli' : 'Termination & Right to be forgotten'}</h2>
      <p>{isFr ? 'Vous pouvez supprimer votre famille à tout moment: Paramètres → Supprimer ma famille → Suppression cascade de toutes données (calendrier, santé, budget, docs, messages) sous 30 jours. Audit_logs anonymisés après 1 an. Export JSON disponible avant suppression.' : 'You can delete your family anytime: Settings → Delete my family → Cascade deletion of all data (calendar, health, budget, docs, messages) within 30 days. Audit_logs anonymized after 1 year. JSON export available before deletion.'}</p>

      <h2>6. {isFr ? 'Loi applicable' : 'Applicable law'}</h2>
      <p>{isFr ? 'Toutes familles du monde bienvenues. Pour UE: RGPD, pour Nigeria: NDPR, pour Cameroun: Loi 2010/012. Litiges: Médiation puis Tribunal compétent. Contact: legal@familyos.app' : 'All families worldwide welcome. For EU: GDPR, for Nigeria: NDPR, for Cameroon: Law 2010/012. Disputes: Mediation then competent court. Contact: legal@familyos.app'}</p>
    </div>
  )
}
