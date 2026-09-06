-- FAMILYOS - SCHEMA PRODUCTION V1 - MULTI-TENANT + RLS + SANTE NIVEAU 4
-- À exécuter dans Supabase SQL Editor

-- Extensions
create extension if not exists "uuid-ossp";

-- ENUMS
create type family_role as enum ('parent_admin','parent_member','teen','child','staff','other');
create type subscription_status as enum ('TRIALING','ACTIVE','PAST_DUE','CANCELLED','EXPIRED');
create type health_sensitivity as enum ('N1','N2','N3','N4');

-- PROFILES (lié à auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  locale text default 'fr' check (locale in ('fr','en')),
  created_at timestamptz default now()
);

-- FAMILIES = Tenant logique
create table families (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  avatar_url text,
  settings jsonb default '{}'::jsonb,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- FAMILY_MEMBERS = Adhésion
create table family_members (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role family_role not null default 'parent_member',
  is_active boolean default true,
  joined_at timestamptz default now(),
  unique(family_id, user_id)
);
create index idx_family_members_family on family_members(family_id);
create index idx_family_members_user on family_members(user_id);

-- TRIAL & SUBSCRIPTION
create table subscription_plans (
  id text primary key, -- 'premium_monthly'
  name text not null,
  price_usd integer not null, -- 1000 = 10.00 USD
  interval text not null default 'month',
  is_active boolean default true
);
insert into subscription_plans (id,name,price_usd,interval) values ('premium_monthly','Premium',1000,'month') on conflict do nothing;

create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null unique references families(id) on delete cascade,
  plan_id text references subscription_plans(id),
  status subscription_status not null default 'TRIALING',
  trial_start timestamptz,
  trial_end timestamptz,
  current_period_end timestamptz,
  paystack_customer_code text,
  paystack_subscription_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table payment_events (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references families(id),
  paystack_event_id text unique not null, -- idempotence
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

-- ORGANISATION
create table events (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  category text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
create index idx_events_family_time on events(family_id, start_at);

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending','in_progress','done','late')),
  priority text default 'medium',
  due_at timestamptz,
  assigned_to uuid references profiles(id),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- FINANCE (N3 Sensible)
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  amount integer not null, -- en centimes
  category text not null,
  description text,
  spent_at date default current_date,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- SANTE NIVEAU 4 - Hautement sensible
create table health_profiles (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  member_user_id uuid not null references profiles(id) on delete cascade,
  blood_group text,
  allergies text[],
  conditions text[],
  emergency_contact jsonb,
  sensitivity health_sensitivity default 'N4',
  created_at timestamptz default now(),
  unique(family_id, member_user_id)
);

create table health_appointments (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  health_profile_id uuid not null references health_profiles(id) on delete cascade,
  title text not null,
  provider text,
  location text,
  appointment_at timestamptz not null,
  notes text,
  created_at timestamptz default now()
);

create table health_documents (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  health_profile_id uuid references health_profiles(id) on delete cascade,
  file_path text not null, -- storage path privé
  category text not null,
  expires_at date,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table documents (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  file_path text not null,
  category text,
  title text,
  expires_at date,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- AUDIT
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references families(id) on delete set null,
  actor_id uuid references profiles(id),
  action text not null, -- 'health.view', 'finance.view', 'member.remove', 'doc.download'
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);
create index idx_audit_family on audit_logs(family_id, created_at desc);

-- NOTIFICATIONS
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- =========================
-- RLS ACTIVATION
-- =========================
alter table profiles enable row level security;
alter table families enable row level security;
alter table family_members enable row level security;
alter table subscriptions enable row level security;
alter table events enable row level security;
alter table tasks enable row level security;
alter table expenses enable row level security;
alter table health_profiles enable row level security;
alter table health_appointments enable row level security;
alter table health_documents enable row level security;
alter table documents enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;
alter table payment_events enable row level security;

-- Helper: est membre de la famille ?
create or replace function is_family_member(fid uuid)
returns boolean language sql security definer
as $$ select exists (select 1 from family_members where family_id = fid and user_id = auth.uid() and is_active = true) $$;

-- Helper: est admin famille ?
create or replace function is_family_admin(fid uuid)
returns boolean language sql security definer
as $$ select exists (select 1 from family_members where family_id = fid and user_id = auth.uid() and role = 'parent_admin' and is_active = true) $$;

-- POLICIES
-- profiles: soi-même + membres même famille peuvent voir
create policy "profiles_self" on profiles for all using (id = auth.uid() or exists (select 1 from family_members fm1 join family_members fm2 on fm1.family_id=fm2.family_id where fm1.user_id=auth.uid() and fm2.user_id=profiles.id));

-- families: seulement si membre
create policy "families_member" on families for all using (is_family_member(id));

-- family_members
create policy "fm_member_read" on family_members for select using (is_family_member(family_id));
create policy "fm_admin_write" on family_members for all using (is_family_admin(family_id));

-- events, tasks, documents: tenant isolation
create policy "tenant_isolation_events" on events for all using (is_family_member(family_id));
create policy "tenant_isolation_tasks" on tasks for all using (is_family_member(family_id));
create policy "tenant_isolation_docs" on documents for all using (is_family_member(family_id));
create policy "tenant_isolation_expenses" on expenses for all using (is_family_member(family_id) and exists (select 1 from family_members where family_id=expenses.family_id and user_id=auth.uid() and role in ('parent_admin','parent_member')));

-- SANTE N4: seulement parent_admin ou soi-même + permission explicite future via health_access
create policy "health_profiles_restricted" on health_profiles for all using (
  is_family_member(family_id) and (
    member_user_id = auth.uid() or is_family_admin(family_id)
  )
);
create policy "health_appointments_restricted" on health_appointments for all using (
  is_family_member(family_id) and exists (select 1 from health_profiles hp where hp.id=health_profile_id and (hp.member_user_id=auth.uid() or is_family_admin(family_id)))
);
create policy "health_docs_restricted" on health_documents for all using (is_family_member(family_id) and (is_family_admin(family_id) or exists (select 1 from health_profiles hp where hp.id=health_profile_id and hp.member_user_id=auth.uid())));

-- subscriptions: admin only
create policy "sub_admin" on subscriptions for all using (is_family_admin(family_id));

-- audit_logs: admin read only
create policy "audit_admin_read" on audit_logs for select using (is_family_admin(family_id));
create policy "audit_insert" on audit_logs for insert with check (true);

-- notifications: soi-même
create policy "notif_self" on notifications for all using (user_id = auth.uid());

-- TRIAL AUTO TRIGGER
create or replace function handle_new_family() returns trigger language plpgsql security definer as $$
begin
  insert into subscriptions (family_id, plan_id, status, trial_start, trial_end, current_period_end)
  values (new.id, 'premium_monthly', 'TRIALING', now(), now() + interval '7 days', now() + interval '7 days');
  insert into family_members (family_id, user_id, role) values (new.id, new.created_by, 'parent_admin') on conflict do nothing;
  return new;
end; $$;

drop trigger if exists on_family_created on families;
create trigger on_family_created after insert on families for each row execute function handle_new_family();

-- PROFILE AUTO
create or replace function handle_new_user() returns trigger language plpgsql security definer as $$
begin insert into profiles (id,email,full_name) values (new.id,new.email,new.raw_user_meta_data->>'full_name') on conflict do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
