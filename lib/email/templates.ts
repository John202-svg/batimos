// Templates emails transactionnels bilingues HTML (Module 4)
// Design: Couleurs marque indigo-600, responsive, dark mode friendly

export const emailTemplates = {
  welcome_trial: {
    fr: (name: string, trialEnd: string) => ({
      subject: 'Bienvenue dans FamilyOS - Votre essai 7 jours a commencé 🏠',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 24px;">
          <div style="background: white; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0;">
            <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">Bienvenue ${name} !</h1>
            <p style="color: #475569; margin-top: 12px;">Votre espace familial est créé. Essai gratuit 7 jours activé automatiquement - Sans carte.</p>
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 16px; padding: 16px; margin-top: 24px;">
              <div style="font-weight: bold; color: #065f46;">🎉 Essai Premium actif jusqu'au ${trialEnd}</div>
              <div style="font-size: 14px; color: #047857; margin-top: 4px;">Accès complet: Calendrier, Tâches, Budget, Santé N4, Coffre-fort, Messagerie - Pour toutes les familles du monde</div>
            </div>
            <a href="https://familyos.app/dashboard" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 24px;">Accéder à mon dashboard →</a>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">Sécurité: RLS + isolation family_id + bucket privé family-vault + audit_logs. Conforme RGPD/NDPR.</p>
          </div>
        </div>
      `
    }),
    en: (name: string, trialEnd: string) => ({
      subject: 'Welcome to FamilyOS - Your 7-day trial started 🏠',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 24px;">
          <div style="background: white; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0;">
            <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">Welcome ${name}!</h1>
            <p style="color: #475569; margin-top: 12px;">Your family space is created. 7-day free trial auto-activated - No card.</p>
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 16px; padding: 16px; margin-top: 24px;">
              <div style="font-weight: bold; color: #065f46;">🎉 Premium trial active until ${trialEnd}</div>
              <div style="font-size: 14px; color: #047857; margin-top: 4px;">Full access: Calendar, Tasks, Budget, Health N4, Vault, Messaging - For all families worldwide</div>
            </div>
            <a href="https://familyos.app/dashboard" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 24px;">Go to my dashboard →</a>
          </div>
        </div>
      `
    })
  },
  trial_ending_j1: {
    fr: (name: string) => ({
      subject: 'Votre essai FamilyOS expire demain - Passez Premium $10/mois',
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: white; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0;"><h2>⏰ ${name}, votre essai expire demain</h2><p>Ne perdez pas vos données familiales. Passez Premium $10/mois pour toutes les familles du monde.</p><a href="https://familyos.app/subscription" style="background: #4f46e5; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; margin-top: 16px;">Activer Premium →</a></div></div>`
    }),
    en: (name: string) => ({
      subject: 'Your FamilyOS trial expires tomorrow - Go Premium $10/month',
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: white; border-radius: 20px; padding: 32px;"><h2>⏰ ${name}, your trial expires tomorrow</h2><p>Don't lose your family data. Go Premium $10/month for all families worldwide.</p><a href="https://familyos.app/subscription" style="background: #4f46e5; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; margin-top: 16px;">Activate Premium →</a></div></div>`
    })
  },
  payment_failed: {
    fr: (name: string, amount: string) => ({
      subject: 'Échec paiement FamilyOS - Action requise',
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: white; border-radius: 20px; padding: 32px; border: 1px solid #fecaca;"><h2 style="color: #dc2626;">❌ Échec paiement ${amount}</h2><p>${name}, votre paiement Premium a échoué. Votre abonnement passe en PAST_DUE. Rappel J0 envoyé. Vous avez 7 jours avant déconnexion.</p><a href="https://familyos.app/subscription" style="background: #dc2626; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; margin-top: 16px;">Mettre à jour paiement →</a></div></div>`
    }),
    en: (name: string, amount: string) => ({
      subject: 'FamilyOS payment failed - Action required',
      html: `<div style="font-family: sans-serif; max-width: 600px;"><div style="background: white; border-radius: 20px; padding: 32px; border: 1px solid #fecaca;"><h2 style="color: #dc2626;">❌ Payment failed ${amount}</h2><p>${name}, your Premium payment failed. Subscription goes PAST_DUE. Reminder D0 sent. You have 7 days before disconnect.</p><a href="https://familyos.app/subscription" style="background: #dc2626; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; margin-top: 16px;">Update payment →</a></div></div>`
    })
  },
  suspension: {
    fr: (name: string) => ({
      subject: 'Compte FamilyOS suspendu - Réactivez maintenant',
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: #1e293b; color: white; border-radius: 20px; padding: 32px;"><h2>🔒 Compte suspendu depuis 7 jours</h2><p style="color: #cbd5e1;">${name}, votre espace familial est suspendu. Toutes vos données sont conservées en sécurité (calendrier, santé N4, budget, coffre-fort). Aucune suppression.</p><a href="https://familyos.app/blocked" style="background: #10b981; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; margin-top: 16px; font-weight: bold;">Payer $10 et réactiver immédiatement →</a><p style="font-size: 11px; color: #64748b; margin-top: 16px;">Pour toutes les familles du monde - Réactivation instantanée après Paystack webhook HMAC vérifié</p></div></div>`
    }),
    en: (name: string) => ({
      subject: 'FamilyOS account suspended - Reactivate now',
      html: `<div style="font-family: sans-serif; max-width: 600px;"><div style="background: #1e293b; color: white; border-radius: 20px; padding: 32px;"><h2>🔒 Account suspended for 7 days</h2><p style="color: #cbd5e1;">${name}, your family space is suspended. All data kept safe (calendar, health N4, budget, vault). No deletion.</p><a href="https://familyos.app/blocked" style="background: #10b981; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; margin-top: 16px; font-weight: bold;">Pay $10 and reactivate now →</a></div></div>`
    })
  },
  reactivation: {
    fr: (name: string) => ({
      subject: 'Compte FamilyOS réactivé - Bienvenue à nouveau ! 🎉',
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: white; border-radius: 20px; padding: 32px; border: 2px solid #10b981;"><h2 style="color: #065f46;">✅ Compte réactivé !</h2><p>${name}, votre espace familial est de nouveau actif. Toutes vos données sont restaurées: calendrier, tâches, budget, santé N4, coffre-fort, messages.</p><a href="https://familyos.app/dashboard" style="background: #10b981; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; margin-top: 16px;">Retour dashboard →</a></div></div>`
    }),
    en: (name: string) => ({
      subject: 'FamilyOS account reactivated - Welcome back! 🎉',
      html: `<div style="font-family: sans-serif; max-width: 600px;"><div style="background: white; border-radius: 20px; padding: 32px; border: 2px solid #10b981;"><h2 style="color: #065f46;">✅ Account reactivated!</h2><p>${name}, your family space is active again. All data restored: calendar, tasks, budget, health N4, vault, messages.</p><a href="https://familyos.app/dashboard" style="background: #10b981; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; margin-top: 16px;">Back to dashboard →</a></div></div>`
    })
  }
}
