# Email Transactionnel - Configuration DNS SPF/DKIM/DMARC (Module 2)

## Pourquoi c'est critique
Sans SPF/DKIM/DMARC, vos emails (reset password, rappels paiement, suspension) arrivent en SPAM → utilisateurs bloqués ne reçoivent pas lien réactivation.

## Pour toutes les familles du monde - Domaine familyos.app

### 1. Resend - Ajouter domaine
Resend Dashboard → Domains → Add Domain → familyos.app
Resend donne 3 enregistrements DNS à ajouter chez votre registrar (Namecheap, Cloudflare, GoDaddy, etc.)

### 2. Enregistrements DNS à configurer

#### Chez Cloudflare / Namecheap / Route53 - Ajoutez:

**SPF (TXT) - Autorise Resend à envoyer pour votre domaine**
```
Type: TXT
Name: @ ou familyos.app
Value: v=spf1 include:amazonses.com include:resend.com ~all
TTL: 3600
```

**DKIM (TXT) - Signature cryptographique (Resend donne valeur unique)**
```
Type: TXT
Name: resend._domainkey.familyos.app
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (clé fournie par Resend)
TTL: 3600
```

**DKIM 2ème clé (si Resend en donne 2)**
```
Type: TXT
Name: resend2._domainkey.familyos.app
Value: p=MIGf... (2ème clé Resend)
```

**DMARC (TXT) - Politique anti-spoofing**
```
Type: TXT
Name: _dmarc.familyos.app
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@familyos.app; ruf=mailto:dmarc@familyos.app; pct=100
TTL: 3600
```
- p=quarantine = met en spam si SPF/DKIM échoue
- rua = rapport agrégé quotidien
- Après 2 semaines sans problème, passe à p=reject pour plus strict

**MX (si vous voulez recevoir réponses à dmarc@)**
```
Type: MX
Name: familyos.app
Value: 10 inbound-smtp.us-east-1.amazonaws.com (Resend inbound)
```

### 3. Vérification

**Resend Dashboard → Domains → Verify**
Doit afficher ✅ Verified pour SPF, DKIM, DMARC

**Tests:**
```bash
# Vérifie SPF
dig TXT familyos.app +short

# Vérifie DKIM
dig TXT resend._domainkey.familyos.app +short

# Vérifie DMARC
dig TXT _dmarc.familyos.app +short

# Test délivrabilité
https://www.mail-tester.com/ → Envoyez email depuis Resend → Score >9/10 requis
```

### 4. Pour chaque email transactionnel critique

**Reset password, alertes paiement, factures, suspension:**
- From: noreply@familyos.app (domaine vérifié)
- Pas @gmail.com ou @resend.dev (arrive en spam)
- Ajoutez List-Unsubscribe header pour désabonnement facile (évite spam complaints)

### 5. Monitoring délivrabilité

- Resend → Logs → Vérifiez bounce rate <2%, spam complaints <0.1%
- Si bounce >5% → liste emails invalides → nettoyez
- Postmark / Resend webhook pour bounces

### 6. Pour toutes les familles du monde

- Resend envoie depuis AWS SES (IP réputation élevée)
- Supporte: Gmail, Outlook, Yahoo, + tous fournisseurs africains (MTN, Orange, etc.)
- Si utilisateur Nigeria/Cameroun avec @yahoo.fr → DKIM/SPF garantit livraison inbox pas spam
