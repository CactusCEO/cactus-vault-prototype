-- Cactus production foundation schema.
-- Apply in Supabase SQL editor or via `supabase db push` once project credentials exist.

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id text primary key,
  name text not null,
  primary_vault_id text not null default 'vault_main',
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id text primary key,
  email text not null unique,
  display_name text not null,
  auth_provider text not null check (auth_provider in ('email','google','microsoft')),
  external_auth_id uuid,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  user_id text not null references public.user_profiles(id) on delete cascade,
  role text not null check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.auth_sessions (
  id text primary key,
  user_id text not null references public.user_profiles(id) on delete cascade,
  organization_id text not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner','admin','member','viewer')),
  auth_provider text not null check (auth_provider in ('email','google','microsoft')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.vault_rows (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  vault_id text not null default 'vault_main',
  row jsonb not null,
  location text generated always as (row->>'location') stored,
  owner text generated always as (row->>'owner') stored,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('pdf','excel','csv','email','web','note')),
  source text not null,
  storage_path text,
  text_preview text not null default '',
  status text not null check (status in ('uploaded','extracting','extracted','needs_review','failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.extraction_jobs (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  document_id text not null references public.documents(id) on delete cascade,
  status text not null check (status in ('queued','running','completed','needs_review','failed')),
  vault_row_id text references public.vault_rows(id) on delete set null,
  facts_created integer not null default 0,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.vault_facts (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  vault_row_id text not null references public.vault_rows(id) on delete cascade,
  field text not null,
  value text not null,
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  source_document_id text not null references public.documents(id) on delete cascade,
  evidence text not null,
  status text not null check (status in ('needs_review','approved','rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create table if not exists public.spaces (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  title text not null,
  context_label text not null,
  vault_row_ids text[] not null default '{}',
  artifact jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_runs (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  workflow text not null,
  mode text not null check (mode in ('Run once','Enable','Open Space')),
  status text not null,
  summary text not null,
  outcome jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_schedules (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  workflow text not null,
  cadence text not null check (cadence in ('manual','daily','weekly','monthly')),
  status text not null check (status in ('approval_required','enabled','paused')),
  approval_summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.source_connections (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  name text not null,
  direction text not null check (direction in ('Read to Vault','Write from Vault','Read + write')),
  status text not null check (status in ('draft','approval_required','connected','paused')),
  created_at timestamptz not null default now()
);

create table if not exists public.map_features (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  vault_row_id text not null references public.vault_rows(id) on delete cascade,
  label text not null,
  latitude double precision not null,
  longitude double precision not null,
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  created_at timestamptz not null default now()
);

create table if not exists public.analyzer_runs (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  analyzer text not null,
  vault_row_ids text[] not null default '{}',
  status text not null check (status in ('completed','needs_review')),
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  title text not null,
  queue text not null,
  status text not null check (status in ('Inbox','Doing','Review','Done')),
  target_type text not null,
  target_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  actor text not null,
  action text not null,
  target_type text not null,
  target_id text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_vault_rows_org on public.vault_rows(organization_id);
create index if not exists idx_vault_facts_row on public.vault_facts(vault_row_id);
create index if not exists idx_documents_org_status on public.documents(organization_id, status);
create index if not exists idx_workflow_runs_org_created on public.workflow_runs(organization_id, created_at desc);
create index if not exists idx_audit_events_org_created on public.audit_events(organization_id, created_at desc);

create or replace function public.user_can_access_org(org_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = org_id
      and (m.user_id = auth.uid()::text or m.user_id = current_setting('app.current_user_id', true))
  );
$$;

alter table public.organizations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.auth_sessions enable row level security;
alter table public.vault_rows enable row level security;
alter table public.documents enable row level security;
alter table public.extraction_jobs enable row level security;
alter table public.vault_facts enable row level security;
alter table public.spaces enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.workflow_schedules enable row level security;
alter table public.source_connections enable row level security;
alter table public.map_features enable row level security;
alter table public.analyzer_runs enable row level security;
alter table public.tasks enable row level security;
alter table public.audit_events enable row level security;

create policy "members can read organizations" on public.organizations for select using (public.user_can_access_org(id));
create policy "users can read their own profile" on public.user_profiles for select using (id in (select user_id from public.organization_memberships where organization_id in (select organization_id from public.organization_memberships where user_id = public.user_profiles.id)));
create policy "members can read memberships" on public.organization_memberships for select using (public.user_can_access_org(organization_id));
create policy "members can read auth_sessions" on public.auth_sessions for select using (public.user_can_access_org(organization_id));
create policy "members can write auth_sessions" on public.auth_sessions for all using (public.user_can_access_org(organization_id)) with check (public.user_can_access_org(organization_id));

create policy "members can read vault_rows" on public.vault_rows for select using (public.user_can_access_org(organization_id));
create policy "members can write vault_rows" on public.vault_rows for all using (public.user_can_access_org(organization_id)) with check (public.user_can_access_org(organization_id));
create policy "members can read documents" on public.documents for select using (public.user_can_access_org(organization_id));
create policy "members can write documents" on public.documents for all using (public.user_can_access_org(organization_id)) with check (public.user_can_access_org(organization_id));
create policy "members can read extraction_jobs" on public.extraction_jobs for select using (public.user_can_access_org(organization_id));
create policy "members can write extraction_jobs" on public.extraction_jobs for all using (public.user_can_access_org(organization_id)) with check (public.user_can_access_org(organization_id));
create policy "members can read vault_facts" on public.vault_facts for select using (public.user_can_access_org(organization_id));
create policy "members can write vault_facts" on public.vault_facts for all using (public.user_can_access_org(organization_id)) with check (public.user_can_access_org(organization_id));
create policy "members can read spaces" on public.spaces for select using (public.user_can_access_org(organization_id));
create policy "members can write spaces" on public.spaces for all using (public.user_can_access_org(organization_id)) with check (public.user_can_access_org(organization_id));
create policy "members can read workflow_runs" on public.workflow_runs for select using (public.user_can_access_org(organization_id));
create policy "members can write workflow_runs" on public.workflow_runs for all using (public.user_can_access_org(organization_id)) with check (public.user_can_access_org(organization_id));
create policy "members can read workflow_schedules" on public.workflow_schedules for select using (public.user_can_access_org(organization_id));
create policy "members can write workflow_schedules" on public.workflow_schedules for all using (public.user_can_access_org(organization_id)) with check (public.user_can_access_org(organization_id));
create policy "members can read source_connections" on public.source_connections for select using (public.user_can_access_org(organization_id));
create policy "members can write source_connections" on public.source_connections for all using (public.user_can_access_org(organization_id)) with check (public.user_can_access_org(organization_id));
create policy "members can read map_features" on public.map_features for select using (public.user_can_access_org(organization_id));
create policy "members can write map_features" on public.map_features for all using (public.user_can_access_org(organization_id)) with check (public.user_can_access_org(organization_id));
create policy "members can read analyzer_runs" on public.analyzer_runs for select using (public.user_can_access_org(organization_id));
create policy "members can write analyzer_runs" on public.analyzer_runs for all using (public.user_can_access_org(organization_id)) with check (public.user_can_access_org(organization_id));
create policy "members can read tasks" on public.tasks for select using (public.user_can_access_org(organization_id));
create policy "members can write tasks" on public.tasks for all using (public.user_can_access_org(organization_id)) with check (public.user_can_access_org(organization_id));
create policy "members can read audit_events" on public.audit_events for select using (public.user_can_access_org(organization_id));
create policy "members can write audit_events" on public.audit_events for all using (public.user_can_access_org(organization_id)) with check (public.user_can_access_org(organization_id));
