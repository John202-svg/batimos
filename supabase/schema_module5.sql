-- Module 5 - Enfants, Staff, Projets, Événements
create table children (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  full_name text not null,
  date_of_birth date,
  class_name text,
  school_id uuid,
  created_at timestamptz default now()
);
create table schools (id uuid primary key default uuid_generate_v4(), name text not null);
create table school_events (id uuid primary key default uuid_generate_v4(), family_id uuid references families(id), child_id uuid references children(id), title text, event_date date);
create table assignments (id uuid primary key default uuid_generate_v4(), family_id uuid references families(id), child_id uuid references children(id), title text, due_date date, status text default 'pending');
create table exams (id uuid primary key default uuid_generate_v4(), family_id uuid references families(id), child_id uuid references children(id), subject text, exam_date date);

create table staff_profiles (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  full_name text not null,
  position text not null,
  phone text,
  salary int default 0,
  status text default 'active',
  created_at timestamptz default now()
);

create table family_projects (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  description text,
  status text default 'planning',
  budget int default 0,
  progress int default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
create table project_tasks (id uuid primary key default uuid_generate_v4(), project_id uuid references family_projects(id) on delete cascade, title text, is_done boolean default false);
create table project_milestones (id uuid primary key default uuid_generate_v4(), project_id uuid references family_projects(id) on delete cascade, title text, is_done boolean default false);

create table family_events (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  event_date date,
  location text,
  budget int default 0,
  status text default 'upcoming',
  created_at timestamptz default now()
);
create table event_guests (id uuid primary key default uuid_generate_v4(), event_id uuid references family_events(id) on delete cascade, name text, rsvp_status text default 'pending');

alter table children enable row level security;
alter table staff_profiles enable row level security;
alter table family_projects enable row level security;
alter table family_events enable row level security;

create policy "tenant_children" on children for all using (is_family_member(family_id));
create policy "staff_n3" on staff_profiles for all using (is_family_member(family_id) and exists (select 1 from family_members where family_id=staff_profiles.family_id and user_id=auth.uid() and role in ('parent_admin','parent_member')));
create policy "tenant_projects" on family_projects for all using (is_family_member(family_id));
create policy "tenant_events" on family_events for all using (is_family_member(family_id));
