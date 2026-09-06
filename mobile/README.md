# FamilyOS Mobile - Module 23

Expo App Android + iOS - Même Supabase que Web

## Lancer
```bash
cd mobile
pnpm i
cp .env.example .env
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...
pnpm start
# Scan QR avec Expo Go
```

## Priorités Module 23 (ton cahier des charges)
- Dashboard, Calendrier, Tâches, Achats, Factures, Messagerie, Notifications, École, Événements, Santé
- Santé mobile: accès sécurisé urgence + RDV + médicaments + vaccins + assurance + docs médicaux autorisés
- Push notifications via expo-notifications + FCM

## Build Production
```bash
eas build --platform android
eas build --platform ios
eas submit --platform all
```

## Sécurité Mobile
- SecureStore pour session (pas AsyncStorage)
- RLS identique Web - is_family_member() vérifié côté Supabase
- Pas de secrets exposés
