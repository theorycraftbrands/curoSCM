-- ============================================================================
-- CuroSCM: Team Resources — People, Businesses, Locations, Catalog
-- Plus polymorphic Notes, Files, Tasks, Audit Logs
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

create type business_type as enum ('client', 'vendor', 'fabricator', 'carrier', 'storage', 'other');
create type location_type as enum ('mailing', 'shipping', 'fabrication', 'warehouse', 'office');
create type task_status as enum ('open', 'in_progress', 'complete', 'cancelled');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');

-- ============================================================================
-- BUSINESSES
-- ============================================================================

create table businesses (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  legal_name text,
  business_type business_type not null default 'vendor',
  tax_reference text,
  phone text,
  website text,
  timezone text default 'UTC',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_businesses_team on businesses(team_id);
create index idx_businesses_org on businesses(organization_id);
create index idx_businesses_name on businesses(organization_id, name);

alter table businesses enable row level security;

-- ============================================================================
-- PEOPLE (contacts linked to businesses)
-- ============================================================================

create table people (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  role text,
  department text,
  business_id uuid references businesses(id) on delete set null,
  city text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_people_team on people(team_id);
create index idx_people_org on people(organization_id);
create index idx_people_business on people(business_id);
create index idx_people_name on people(organization_id, last_name, first_name);

alter table people enable row level security;

-- ============================================================================
-- LOCATIONS
-- ============================================================================

create table locations (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  business_id uuid references businesses(id) on delete set null,
  name text not null,
  location_type location_type not null default 'shipping',
  address_line_1 text,
  address_line_2 text,
  city text,
  state_province text,
  postal_code text,
  country text default 'Canada',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_locations_team on locations(team_id);
create index idx_locations_org on locations(organization_id);
create index idx_locations_business on locations(business_id);

alter table locations enable row level security;

-- ============================================================================
-- CATALOG ITEMS
-- ============================================================================

create table catalog_items (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  sku text,
  unit text default 'each',
  category text,
  default_price numeric(12,2),
  currency text default 'CAD',
  is_purchasable boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_catalog_team on catalog_items(team_id);
create index idx_catalog_org on catalog_items(organization_id);
create index idx_catalog_name on catalog_items(organization_id, name);
create index idx_catalog_sku on catalog_items(organization_id, sku);

alter table catalog_items enable row level security;

-- ============================================================================
-- NOTES (polymorphic — attaches to any entity)
-- ============================================================================

create table notes (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  content text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_notes_entity on notes(entity_type, entity_id);
create index idx_notes_org on notes(organization_id);

alter table notes enable row level security;

-- ============================================================================
-- FILES (polymorphic)
-- ============================================================================

create table files (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  file_name text not null,
  storage_path text not null,
  file_size bigint,
  mime_type text,
  uploaded_by uuid not null references profiles(id),
  uploaded_at timestamptz not null default now()
);

create index idx_files_entity on files(entity_type, entity_id);
create index idx_files_org on files(organization_id);

alter table files enable row level security;

-- ============================================================================
-- TASKS (polymorphic)
-- ============================================================================

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  title text not null,
  description text,
  status task_status not null default 'open',
  priority task_priority not null default 'medium',
  assigned_to uuid references profiles(id),
  due_date date,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tasks_entity on tasks(entity_type, entity_id);
create index idx_tasks_org on tasks(organization_id);
create index idx_tasks_assigned on tasks(assigned_to) where status in ('open', 'in_progress');

alter table tasks enable row level security;

-- ============================================================================
-- AUDIT LOGS (polymorphic)
-- ============================================================================

create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  changes jsonb,
  performed_by uuid not null references profiles(id),
  performed_at timestamptz not null default now()
);

create index idx_audit_entity on audit_logs(entity_type, entity_id);
create index idx_audit_org on audit_logs(organization_id);

alter table audit_logs enable row level security;

-- ============================================================================
-- RLS POLICIES: All team resources use org-scoped access
-- ============================================================================

-- Macro: users can see data in their organizations
-- Applied to: businesses, people, locations, catalog_items, notes, files, tasks, audit_logs

-- BUSINESSES
create policy "Users can view businesses in their org"
  on businesses for select using (organization_id in (select get_user_org_ids()));
create policy "Members can create businesses"
  on businesses for insert with check (organization_id in (select get_user_org_ids()));
create policy "Members can update businesses"
  on businesses for update using (organization_id in (select get_user_org_ids()));
create policy "Admins can delete businesses"
  on businesses for delete using (user_is_org_admin(organization_id));

-- PEOPLE
create policy "Users can view people in their org"
  on people for select using (organization_id in (select get_user_org_ids()));
create policy "Members can create people"
  on people for insert with check (organization_id in (select get_user_org_ids()));
create policy "Members can update people"
  on people for update using (organization_id in (select get_user_org_ids()));
create policy "Admins can delete people"
  on people for delete using (user_is_org_admin(organization_id));

-- LOCATIONS
create policy "Users can view locations in their org"
  on locations for select using (organization_id in (select get_user_org_ids()));
create policy "Members can create locations"
  on locations for insert with check (organization_id in (select get_user_org_ids()));
create policy "Members can update locations"
  on locations for update using (organization_id in (select get_user_org_ids()));
create policy "Admins can delete locations"
  on locations for delete using (user_is_org_admin(organization_id));

-- CATALOG ITEMS
create policy "Users can view catalog in their org"
  on catalog_items for select using (organization_id in (select get_user_org_ids()));
create policy "Members can create catalog items"
  on catalog_items for insert with check (organization_id in (select get_user_org_ids()));
create policy "Members can update catalog items"
  on catalog_items for update using (organization_id in (select get_user_org_ids()));
create policy "Admins can delete catalog items"
  on catalog_items for delete using (user_is_org_admin(organization_id));

-- NOTES
create policy "Users can view notes in their org"
  on notes for select using (organization_id in (select get_user_org_ids()));
create policy "Members can create notes"
  on notes for insert with check (organization_id in (select get_user_org_ids()));
create policy "Users can update own notes"
  on notes for update using (created_by = auth.uid());
create policy "Users can delete own notes"
  on notes for delete using (created_by = auth.uid());

-- FILES
create policy "Users can view files in their org"
  on files for select using (organization_id in (select get_user_org_ids()));
create policy "Members can upload files"
  on files for insert with check (organization_id in (select get_user_org_ids()));
create policy "Users can delete own files"
  on files for delete using (uploaded_by = auth.uid());

-- TASKS
create policy "Users can view tasks in their org"
  on tasks for select using (organization_id in (select get_user_org_ids()));
create policy "Members can create tasks"
  on tasks for insert with check (organization_id in (select get_user_org_ids()));
create policy "Members can update tasks in their org"
  on tasks for update using (organization_id in (select get_user_org_ids()));
create policy "Admins can delete tasks"
  on tasks for delete using (user_is_org_admin(organization_id));

-- AUDIT LOGS (read-only for users, write via triggers/admin)
create policy "Users can view audit logs in their org"
  on audit_logs for select using (organization_id in (select get_user_org_ids()));
create policy "System can create audit logs"
  on audit_logs for insert with check (organization_id in (select get_user_org_ids()));

-- ============================================================================
-- TRIGGERS: updated_at
-- ============================================================================

create trigger set_updated_at before update on businesses
  for each row execute function update_updated_at();
create trigger set_updated_at before update on people
  for each row execute function update_updated_at();
create trigger set_updated_at before update on locations
  for each row execute function update_updated_at();
create trigger set_updated_at before update on catalog_items
  for each row execute function update_updated_at();
create trigger set_updated_at before update on notes
  for each row execute function update_updated_at();
create trigger set_updated_at before update on tasks
  for each row execute function update_updated_at();

-- ============================================================================
-- FULL TEXT SEARCH
-- ============================================================================

-- Add tsvector columns for search
alter table people add column search_vector tsvector
  generated always as (
    to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(role, ''))
  ) stored;

alter table businesses add column search_vector tsvector
  generated always as (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(legal_name, '') || ' ' || coalesce(tax_reference, ''))
  ) stored;

alter table catalog_items add column search_vector tsvector
  generated always as (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(category, ''))
  ) stored;

create index idx_people_search on people using gin(search_vector);
create index idx_businesses_search on businesses using gin(search_vector);
create index idx_catalog_search on catalog_items using gin(search_vector);
