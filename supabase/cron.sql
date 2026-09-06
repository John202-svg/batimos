-- CRON JOBS pour Dunning Abonnements (Module 20)
-- À exécuter dans Supabase SQL Editor après avoir activé pg_cron

-- Active pg_cron si pas déjà
create extension if not exists pg_cron;

-- 1. Job quotidien à minuit: vérifie expirations + envoie rappels + déconnecte J+7
-- Appelle l'Edge Function check-subscriptions
select cron.schedule(
  'check-subscriptions-daily',
  '0 0 * * *', -- Tous les jours à 00:00 UTC
  $$
  select net.http_post(
    url:='https://YOUR_PROJECT.supabase.co/functions/v1/check-subscriptions',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body:='{"trigger": "cron_daily"}'::jsonb
  ) as request_id;
  $$
);

-- Alternative si net.http non dispo: utilise pg_cron direct sans Edge Function
-- Cette version met à jour directement les statuts

-- Fonction qui gère le dunning directement en SQL (backup si Edge Function down)
create or replace function handle_subscription_dunning()
returns void language plpgsql security definer as $$
declare
  expired_count int;
  disconnected_count int;
begin
  -- 1. ACTIVE dont period_end < now → PAST_DUE
  with updated as (
    update subscriptions
    set status = 'PAST_DUE', updated_at = now()
    where status = 'ACTIVE' and current_period_end < now()
    returning id, family_id
  )
  select count(*) into expired_count from updated;

  -- Crée notifications pour les expirés
  insert into notifications (family_id, user_id, type, title, body)
  select s.family_id, fm.user_id, 'subscription_payment_due',
    'Votre abonnement a expiré - Renouvellement requis',
    'Votre abonnement Premium a expiré le ' || s.current_period_end::date || '. Renouvelez pour éviter déconnexion dans 7 jours.'
  from subscriptions s
  join family_members fm on fm.family_id = s.family_id
  where s.status = 'PAST_DUE' and s.current_period_end < now() and s.current_period_end > now() - interval '1 day';

  -- 2. PAST_DUE depuis >7j → EXPIRED (déconnexion)
  with disconnected as (
    update subscriptions
    set status = 'EXPIRED', updated_at = now()
    where status = 'PAST_DUE' and current_period_end < now() - interval '7 days'
    returning id, family_id
  )
  select count(*) into disconnected_count from disconnected;

  -- Notif déconnexion
  insert into notifications (family_id, user_id, type, title, body)
  select s.family_id, fm.user_id, 'subscription_expired_disconnected',
    'Compte déconnecté - Abonnement expiré depuis 7 jours',
    'Espace familial suspendu. Payez maintenant pour réactiver immédiatement.'
  from subscriptions s
  join family_members fm on fm.family_id = s.family_id
  where s.status = 'EXPIRED' and s.updated_at > now() - interval '1 day';

  -- Logs
  insert into audit_logs (family_id, action, entity_type, metadata)
  select family_id, 'subscription.cron_dunning', 'subscription', jsonb_build_object('expired', expired_count, 'disconnected', disconnected_count)
  from (select 1) t
  where expired_count > 0 or disconnected_count > 0;

  raise notice 'Dunning: % expired, % disconnected', expired_count, disconnected_count;
end;
$$;

-- Job SQL backup (si Edge Function échoue)
select cron.schedule(
  'dunning-sql-backup',
  '30 0 * * *', -- 00h30 backup
  $$ select handle_subscription_dunning(); $$
);
