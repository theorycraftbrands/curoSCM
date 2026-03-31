-- ============================================================================
-- CuroSCM: Procurement Chain — Requisitions → Bids
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

create type requisition_status as enum ('draft', 'under_review', 'ready_to_bid', 'transferred', 'cancelled');
create type bid_status as enum ('draft', 'issued', 'awaiting_review', 'awaiting_approval', 'ready_to_issue', 'awarded', 'cancelled');
create type bid_proponent_status as enum ('invited', 'responded', 'declined', 'no_response');

-- ============================================================================
-- REQUISITIONS
-- ============================================================================

create table requisitions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  requisition_number text,
  name text not null,
  description text,
  status requisition_status not null default 'draft',
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_requisitions_project on requisitions(project_id);
create index idx_requisitions_org on requisitions(organization_id);

alter table requisitions enable row level security;

-- Auto-number
create or replace function generate_requisition_number()
returns trigger language plpgsql security definer set search_path = public as $$
declare next_num integer;
begin
  select coalesce(max(cast(regexp_replace(requisition_number, '^REQ-', '') as integer)), 0) + 1
  into next_num from requisitions where project_id = new.project_id;
  new.requisition_number := 'REQ-' || lpad(next_num::text, 3, '0');
  return new;
end; $$;

create trigger set_requisition_number before insert on requisitions
  for each row when (new.requisition_number is null) execute function generate_requisition_number();

-- ============================================================================
-- REQUISITION ITEMS
-- ============================================================================

create table requisition_items (
  id uuid primary key default uuid_generate_v4(),
  requisition_id uuid not null references requisitions(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  catalog_item_id uuid references catalog_items(id) on delete set null,
  bom_item_id uuid references bom_items(id) on delete set null,
  description text not null,
  quantity numeric(12,2) not null default 0,
  unit text default 'each',
  cost_code text,
  group_name text,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

create index idx_req_items_req on requisition_items(requisition_id);

alter table requisition_items enable row level security;

-- ============================================================================
-- BIDS
-- ============================================================================

create table bids (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  requisition_id uuid references requisitions(id) on delete set null,
  bid_number text,
  name text not null,
  description text,
  status bid_status not null default 'draft',
  due_date date,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_bids_project on bids(project_id);
create index idx_bids_org on bids(organization_id);
create index idx_bids_requisition on bids(requisition_id);

alter table bids enable row level security;

-- Auto-number
create or replace function generate_bid_number()
returns trigger language plpgsql security definer set search_path = public as $$
declare next_num integer;
begin
  select coalesce(max(cast(regexp_replace(bid_number, '^BID-', '') as integer)), 0) + 1
  into next_num from bids where project_id = new.project_id;
  new.bid_number := 'BID-' || lpad(next_num::text, 3, '0');
  return new;
end; $$;

create trigger set_bid_number before insert on bids
  for each row when (new.bid_number is null) execute function generate_bid_number();

-- ============================================================================
-- BID PROPONENTS (vendors invited to bid)
-- ============================================================================

create table bid_proponents (
  id uuid primary key default uuid_generate_v4(),
  bid_id uuid not null references bids(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  status bid_proponent_status not null default 'invited',
  is_recommended boolean not null default false,
  invited_at timestamptz not null default now(),
  responded_at timestamptz,
  unique(bid_id, business_id)
);

create index idx_bid_proponents_bid on bid_proponents(bid_id);

alter table bid_proponents enable row level security;

-- ============================================================================
-- BID ITEMS (what we're asking vendors to quote on)
-- ============================================================================

create table bid_items (
  id uuid primary key default uuid_generate_v4(),
  bid_id uuid not null references bids(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  requisition_item_id uuid references requisition_items(id) on delete set null,
  catalog_item_id uuid references catalog_items(id) on delete set null,
  bom_type bom_item_type not null default 'purchase',
  description text not null,
  quantity numeric(12,2) not null default 0,
  unit text default 'each',
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

create index idx_bid_items_bid on bid_items(bid_id);

alter table bid_items enable row level security;

-- ============================================================================
-- BID RESPONSES (vendor quotes per item)
-- ============================================================================

create table bid_responses (
  id uuid primary key default uuid_generate_v4(),
  bid_item_id uuid not null references bid_items(id) on delete cascade,
  proponent_id uuid not null references bid_proponents(id) on delete cascade,
  unit_price numeric(12,2),
  currency text default 'CAD',
  lead_time_days integer,
  is_compliant boolean default true,
  offered_item_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(bid_item_id, proponent_id)
);

create index idx_bid_responses_item on bid_responses(bid_item_id);
create index idx_bid_responses_proponent on bid_responses(proponent_id);

alter table bid_responses enable row level security;

-- ============================================================================
-- BID EVALUATIONS (scoring per proponent)
-- ============================================================================

create table bid_evaluations (
  id uuid primary key default uuid_generate_v4(),
  bid_id uuid not null references bids(id) on delete cascade,
  proponent_id uuid not null references bid_proponents(id) on delete cascade,
  criteria_name text not null,
  score numeric(5,2),
  max_score numeric(5,2) default 10,
  notes text,
  evaluated_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create index idx_bid_evals_bid on bid_evaluations(bid_id);

alter table bid_evaluations enable row level security;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- REQUISITIONS
create policy "Users can view requisitions in their org"
  on requisitions for select using (organization_id in (select get_user_org_ids()));
create policy "Members can create requisitions"
  on requisitions for insert with check (organization_id in (select get_user_org_ids()));
create policy "Members can update requisitions"
  on requisitions for update using (organization_id in (select get_user_org_ids()));

-- REQUISITION ITEMS
create policy "Users can view req items in their org"
  on requisition_items for select using (organization_id in (select get_user_org_ids()));
create policy "Members can create req items"
  on requisition_items for insert with check (organization_id in (select get_user_org_ids()));
create policy "Members can update req items"
  on requisition_items for update using (organization_id in (select get_user_org_ids()));
create policy "Members can delete req items"
  on requisition_items for delete using (organization_id in (select get_user_org_ids()));

-- BIDS
create policy "Users can view bids in their org"
  on bids for select using (organization_id in (select get_user_org_ids()));
create policy "Members can create bids"
  on bids for insert with check (organization_id in (select get_user_org_ids()));
create policy "Members can update bids"
  on bids for update using (organization_id in (select get_user_org_ids()));

-- BID PROPONENTS (access via bid → org)
create policy "Users can view bid proponents"
  on bid_proponents for select
  using (bid_id in (select id from bids where organization_id in (select get_user_org_ids())));
create policy "Members can manage bid proponents"
  on bid_proponents for insert
  with check (bid_id in (select id from bids where organization_id in (select get_user_org_ids())));
create policy "Members can update bid proponents"
  on bid_proponents for update
  using (bid_id in (select id from bids where organization_id in (select get_user_org_ids())));
create policy "Members can delete bid proponents"
  on bid_proponents for delete
  using (bid_id in (select id from bids where organization_id in (select get_user_org_ids())));

-- BID ITEMS
create policy "Users can view bid items in their org"
  on bid_items for select using (organization_id in (select get_user_org_ids()));
create policy "Members can create bid items"
  on bid_items for insert with check (organization_id in (select get_user_org_ids()));
create policy "Members can update bid items"
  on bid_items for update using (organization_id in (select get_user_org_ids()));
create policy "Members can delete bid items"
  on bid_items for delete using (organization_id in (select get_user_org_ids()));

-- BID RESPONSES (access via bid_item → org)
create policy "Users can view bid responses"
  on bid_responses for select
  using (bid_item_id in (select id from bid_items where organization_id in (select get_user_org_ids())));
create policy "Members can manage bid responses"
  on bid_responses for insert
  with check (bid_item_id in (select id from bid_items where organization_id in (select get_user_org_ids())));
create policy "Members can update bid responses"
  on bid_responses for update
  using (bid_item_id in (select id from bid_items where organization_id in (select get_user_org_ids())));

-- BID EVALUATIONS
create policy "Users can view bid evaluations"
  on bid_evaluations for select
  using (bid_id in (select id from bids where organization_id in (select get_user_org_ids())));
create policy "Members can create bid evaluations"
  on bid_evaluations for insert
  with check (bid_id in (select id from bids where organization_id in (select get_user_org_ids())));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

create trigger set_updated_at before update on requisitions
  for each row execute function update_updated_at();
create trigger set_updated_at before update on bids
  for each row execute function update_updated_at();
create trigger set_updated_at before update on bid_responses
  for each row execute function update_updated_at();
