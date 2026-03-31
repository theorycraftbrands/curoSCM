-- ============================================================================
-- CuroSCM: Projects, BOM, Project Inventory, Flexible Dates
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

create type project_status as enum ('draft', 'active', 'on_hold', 'complete', 'cancelled');
create type bom_item_type as enum ('purchase', 'client_supplied', 'vendor_supplied', 'feed_through');

-- ============================================================================
-- PROJECTS
-- ============================================================================

create table projects (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  project_number text,
  name text not null,
  description text,
  status project_status not null default 'draft',
  currency text not null default 'CAD',
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_projects_team on projects(team_id);
create index idx_projects_org on projects(organization_id);
create index idx_projects_number on projects(organization_id, project_number);

alter table projects enable row level security;

-- ============================================================================
-- PROJECT MEMBERSHIPS (user <-> project with role)
-- ============================================================================

create table project_memberships (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role project_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique(project_id, user_id)
);

create index idx_project_memberships_project on project_memberships(project_id);
create index idx_project_memberships_user on project_memberships(user_id);

alter table project_memberships enable row level security;

-- ============================================================================
-- PROJECT LOCATIONS (which locations are relevant to this project)
-- ============================================================================

create table project_locations (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  role text default 'primary',
  unique(project_id, location_id)
);

create index idx_project_locations_project on project_locations(project_id);

alter table project_locations enable row level security;

-- ============================================================================
-- BOM ITEMS (Bill of Materials — 4 types)
-- ============================================================================

create table bom_items (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  catalog_item_id uuid references catalog_items(id) on delete set null,
  bom_type bom_item_type not null default 'purchase',
  description text not null,
  quantity numeric(12,2) not null default 0,
  unit text default 'each',
  unit_price numeric(12,2),
  currency text,
  cost_code text,
  group_name text,
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_bom_project on bom_items(project_id);
create index idx_bom_type on bom_items(project_id, bom_type);
create index idx_bom_org on bom_items(organization_id);

alter table bom_items enable row level security;

-- ============================================================================
-- DATE TYPES (team-configurable date presets)
-- ============================================================================

create table date_types (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  name text not null,
  category text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_date_types_team on date_types(team_id);

alter table date_types enable row level security;

-- ============================================================================
-- CUSTOM DATES (flexible dates on any entity)
-- ============================================================================

create table custom_dates (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  date_type_id uuid references date_types(id) on delete set null,
  label text not null,
  original_date date,
  planned_date date,
  completed_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_custom_dates_entity on custom_dates(entity_type, entity_id);
create index idx_custom_dates_org on custom_dates(organization_id);

alter table custom_dates enable row level security;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- PROJECTS
create policy "Users can view projects in their org"
  on projects for select using (organization_id in (select get_user_org_ids()));
create policy "Members can create projects"
  on projects for insert with check (organization_id in (select get_user_org_ids()));
create policy "Members can update projects"
  on projects for update using (organization_id in (select get_user_org_ids()));

-- PROJECT MEMBERSHIPS
create policy "Users can view project memberships in their org"
  on project_memberships for select
  using (project_id in (select id from projects where organization_id in (select get_user_org_ids())));
create policy "Members can manage project memberships"
  on project_memberships for insert
  with check (project_id in (select id from projects where organization_id in (select get_user_org_ids())));
create policy "Members can update project memberships"
  on project_memberships for update
  using (project_id in (select id from projects where organization_id in (select get_user_org_ids())));
create policy "Members can delete project memberships"
  on project_memberships for delete
  using (project_id in (select id from projects where organization_id in (select get_user_org_ids())));

-- PROJECT LOCATIONS
create policy "Users can view project locations"
  on project_locations for select
  using (project_id in (select id from projects where organization_id in (select get_user_org_ids())));
create policy "Members can manage project locations"
  on project_locations for insert
  with check (project_id in (select id from projects where organization_id in (select get_user_org_ids())));
create policy "Members can delete project locations"
  on project_locations for delete
  using (project_id in (select id from projects where organization_id in (select get_user_org_ids())));

-- BOM ITEMS
create policy "Users can view bom items in their org"
  on bom_items for select using (organization_id in (select get_user_org_ids()));
create policy "Members can create bom items"
  on bom_items for insert with check (organization_id in (select get_user_org_ids()));
create policy "Members can update bom items"
  on bom_items for update using (organization_id in (select get_user_org_ids()));
create policy "Members can delete bom items"
  on bom_items for delete using (organization_id in (select get_user_org_ids()));

-- DATE TYPES
create policy "Users can view date types in their teams"
  on date_types for select using (team_id in (select get_user_team_ids()));
create policy "Admins can manage date types"
  on date_types for insert with check (team_id in (select get_user_team_ids()));

-- CUSTOM DATES
create policy "Users can view custom dates in their org"
  on custom_dates for select using (organization_id in (select get_user_org_ids()));
create policy "Members can create custom dates"
  on custom_dates for insert with check (organization_id in (select get_user_org_ids()));
create policy "Members can update custom dates"
  on custom_dates for update using (organization_id in (select get_user_org_ids()));
create policy "Members can delete custom dates"
  on custom_dates for delete using (organization_id in (select get_user_org_ids()));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

create trigger set_updated_at before update on projects
  for each row execute function update_updated_at();
create trigger set_updated_at before update on bom_items
  for each row execute function update_updated_at();
create trigger set_updated_at before update on custom_dates
  for each row execute function update_updated_at();

-- ============================================================================
-- AUTO-GENERATE PROJECT NUMBER
-- ============================================================================

create or replace function generate_project_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_num integer;
  year_str text;
begin
  year_str := to_char(now(), 'YYYY');
  select coalesce(max(
    cast(regexp_replace(project_number, '^PRJ-\d{4}-', '') as integer)
  ), 0) + 1
  into next_num
  from projects
  where organization_id = new.organization_id
    and project_number like 'PRJ-' || year_str || '-%';

  new.project_number := 'PRJ-' || year_str || '-' || lpad(next_num::text, 3, '0');
  return new;
end;
$$;

create trigger set_project_number
  before insert on projects
  for each row
  when (new.project_number is null)
  execute function generate_project_number();
