-- ============================================================================
-- CuroSCM: Organizations, Teams, Profiles, Memberships
-- Multi-tenant foundation with Row-Level Security
-- ============================================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

create type team_role as enum ('owner', 'admin', 'member', 'viewer');
create type project_role as enum ('manager', 'buyer', 'expediter', 'viewer');

-- ============================================================================
-- ORGANIZATIONS (top-level tenant)
-- ============================================================================

create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table organizations enable row level security;

-- ============================================================================
-- PROFILES (extends auth.users)
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- ============================================================================
-- TEAMS (workgroups within an organization)
-- ============================================================================

create table teams (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_teams_org on teams(organization_id);

alter table teams enable row level security;

-- ============================================================================
-- TEAM MEMBERSHIPS (user <-> team with role)
-- ============================================================================

create table team_memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  role team_role not null default 'member',
  created_at timestamptz not null default now(),
  unique(user_id, team_id)
);

create index idx_team_memberships_user on team_memberships(user_id);
create index idx_team_memberships_team on team_memberships(team_id);
create index idx_team_memberships_org on team_memberships(organization_id);

alter table team_memberships enable row level security;

-- ============================================================================
-- HELPER FUNCTIONS (used by RLS policies)
-- ============================================================================

-- Get all organization IDs the current user belongs to
create or replace function get_user_org_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select distinct organization_id
  from team_memberships
  where user_id = auth.uid();
$$;

-- Get all team IDs the current user belongs to
create or replace function get_user_team_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select distinct team_id
  from team_memberships
  where user_id = auth.uid();
$$;

-- Check if user has a specific role (or higher) in a team
create or replace function user_has_team_role(p_team_id uuid, p_min_role team_role)
returns boolean
language sql
security definer
stable
as $$
  select exists(
    select 1 from team_memberships
    where user_id = auth.uid()
      and team_id = p_team_id
      and role <= p_min_role  -- enum ordering: owner < admin < member < viewer
  );
$$;

-- Check if user is org owner/admin (has 'owner' or 'admin' in any team of the org)
create or replace function user_is_org_admin(p_org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists(
    select 1 from team_memberships
    where user_id = auth.uid()
      and organization_id = p_org_id
      and role in ('owner', 'admin')
  );
$$;

-- ============================================================================
-- RLS POLICIES: profiles
-- ============================================================================

-- Users can read profiles of people in their organizations
create policy "Users can view profiles in their org"
  on profiles for select
  using (
    id = auth.uid()
    or id in (
      select tm.user_id from team_memberships tm
      where tm.organization_id in (select get_user_org_ids())
    )
  );

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================================
-- RLS POLICIES: organizations
-- ============================================================================

-- Users can view orgs they belong to
create policy "Users can view own orgs"
  on organizations for select
  using (id in (select get_user_org_ids()));

-- Anyone authenticated can create an org (during onboarding)
create policy "Authenticated users can create orgs"
  on organizations for insert
  with check (auth.uid() is not null);

-- Only org admins can update
create policy "Org admins can update org"
  on organizations for update
  using (user_is_org_admin(id));

-- ============================================================================
-- RLS POLICIES: teams
-- ============================================================================

-- Users can view teams in their org
create policy "Users can view teams in their org"
  on teams for select
  using (organization_id in (select get_user_org_ids()));

-- Org admins can create teams
create policy "Org admins can create teams"
  on teams for insert
  with check (user_is_org_admin(organization_id));

-- Org admins can update teams
create policy "Org admins can update teams"
  on teams for update
  using (user_is_org_admin(organization_id));

-- ============================================================================
-- RLS POLICIES: team_memberships
-- ============================================================================

-- Users can view memberships in their org
create policy "Users can view memberships in their org"
  on team_memberships for select
  using (organization_id in (select get_user_org_ids()));

-- Team admins+ can add members
create policy "Team admins can add members"
  on team_memberships for insert
  with check (
    user_is_org_admin(organization_id)
    or user_has_team_role(team_id, 'admin')
  );

-- Team admins+ can update member roles
create policy "Team admins can update members"
  on team_memberships for update
  using (
    user_is_org_admin(organization_id)
    or user_has_team_role(team_id, 'admin')
  );

-- Team admins+ can remove members (or user can remove self)
create policy "Team admins can remove members"
  on team_memberships for delete
  using (
    user_id = auth.uid()
    or user_is_org_admin(organization_id)
    or user_has_team_role(team_id, 'admin')
  );

-- ============================================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- TRIGGER: updated_at auto-update
-- ============================================================================

create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on organizations
  for each row execute function update_updated_at();

create trigger set_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger set_updated_at before update on teams
  for each row execute function update_updated_at();
