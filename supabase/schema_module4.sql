-- Module 4 - Conversations, Messages, Notifications Central
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  name text,
  is_group boolean default true,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
create table conversation_members (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(conversation_id, user_id)
);
create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

alter table conversations enable row level security;
alter table conversation_members enable row level security;
alter table messages enable row level security;

create policy "conv_member" on conversations for all using (is_family_member(family_id));
create policy "conv_members_tenant" on conversation_members for all using (exists (select 1 from conversations c where c.id=conversation_id and is_family_member(c.family_id)));
create policy "messages_tenant" on messages for all using (is_family_member(family_id));
