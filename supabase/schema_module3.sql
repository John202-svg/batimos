-- Module 3 - Finance & Achats
create table shopping_lists (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
create table shopping_items (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  shopping_list_id uuid not null references shopping_lists(id) on delete cascade,
  name text not null,
  quantity int default 1,
  estimated_price int default 0,
  priority text default 'medium',
  is_bought boolean default false,
  assigned_to uuid references profiles(id),
  created_at timestamptz default now()
);
create table bills (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  provider text not null,
  category text not null,
  amount int not null,
  due_date date,
  recurrence text default 'monthly',
  is_paid boolean default false,
  created_at timestamptz default now()
);
create table budgets (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  amount int not null,
  period text default 'monthly',
  created_at timestamptz default now()
);
create table incomes (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  source text not null,
  amount int not null,
  received_at date default current_date,
  created_at timestamptz default now()
);

alter table shopping_lists enable row level security;
alter table shopping_items enable row level security;
alter table bills enable row level security;
alter table budgets enable row level security;
alter table incomes enable row level security;

create policy "tenant_shopping_lists" on shopping_lists for all using (is_family_member(family_id));
create policy "tenant_shopping_items" on shopping_items for all using (is_family_member(family_id));
create policy "finance_bills" on bills for all using (is_family_member(family_id) and exists (select 1 from family_members where family_id=bills.family_id and user_id=auth.uid() and role in ('parent_admin','parent_member')));
create policy "finance_budgets" on budgets for all using (is_family_member(family_id) and exists (select 1 from family_members where family_id=budgets.family_id and user_id=auth.uid() and role in ('parent_admin','parent_member')));
create policy "finance_incomes" on incomes for all using (is_family_member(family_id) and exists (select 1 from family_members where family_id=incomes.family_id and user_id=auth.uid() and role in ('parent_admin','parent_member')));

-- Expenses table already exists in schema.sql, ensure RLS N3
