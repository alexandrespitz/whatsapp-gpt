-- Enable extensions
create extension if not exists postgis;
create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- profiles table
create table if not exists profiles (
  user_id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  created_at timestamptz default now()
);

-- organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- memberships
create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text check (role in ('owner','admin','member')) not null default 'owner',
  created_at timestamptz default now()
);

-- entity_types
create table if not exists entity_types (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  name text not null,
  schema jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

-- pipelines
create table if not exists pipelines (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- pipeline_stages
create table if not exists pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid references pipelines on delete cascade,
  name text not null,
  position int not null,
  created_at timestamptz default now()
);

-- entities
create table if not exists entities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  type_id uuid references entity_types on delete set null,
  name text not null,
  fields jsonb not null default '{}'::jsonb,
  pipeline_id uuid references pipelines on delete set null,
  stage_id uuid references pipeline_stages on delete set null,
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- entity_locations
create table if not exists entity_locations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  entity_id uuid references entities on delete cascade,
  geom geometry(GEOMETRY, 4326) not null,
  geom_type text not null check (geom_type in ('Point','LineString','Polygon','MultiPoint','MultiLineString','MultiPolygon')),
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

-- entity_links
create table if not exists entity_links (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  source_entity_id uuid references entities on delete cascade,
  target_entity_id uuid references entities on delete cascade,
  relation_type text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_memberships_org on memberships(org_id);
create index if not exists idx_entity_types_org on entity_types(org_id);
create index if not exists idx_pipelines_org on pipelines(org_id);
create index if not exists idx_pipeline_stages_pipeline on pipeline_stages(pipeline_id);
create index if not exists idx_entities_org on entities(org_id);
create index if not exists idx_entity_locations_org on entity_locations(org_id);
create index if not exists idx_entity_locations_geom on entity_locations using gist(geom);
create index if not exists idx_entity_links_org on entity_links(org_id);

-- updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_update_updated_at on entities;
create trigger trigger_update_updated_at
before update on entities
for each row
execute procedure update_updated_at();

-- RLS setup and org helper
alter table organizations enable row level security;
alter table memberships enable row level security;
alter table entity_types enable row level security;
alter table pipelines enable row level security;
alter table pipeline_stages enable row level security;
alter table entities enable row level security;
alter table entity_locations enable row level security;
alter table entity_links enable row level security;

create or replace function public.current_user_org_ids()
returns setof uuid
language sql
security definer
set search_path = public
as $
  select org_id from memberships where user_id = auth.uid()
$;
grant execute on function public.current_user_org_ids() to authenticated;

-- RLS policies for org-scoped tables
do $
declare
  tbl text;
begin
  foreach tbl in array [
    'memberships',
    'entity_types',
    'pipelines',
    'pipeline_stages',
    'entities',
    'entity_locations',
    'entity_links'
  ]
  loop
    execute format('
      drop policy if exists "%1$s_rls" on %1$s;
      create policy "%1$s_rls" on %1$s
        for all
        using (org_id = any (array(select current_user_org_ids())))
        with check (org_id = any (array(select current_user_org_ids())));
    ', tbl);
    execute format('
      alter table %1$s force row level security;
    ', tbl);
  end loop;
end $;

-- organizations visibility: row policy for memberships, insert policy for service role, block update/delete
drop policy if exists "orgs_members_view" on organizations;
create policy "orgs_members_view" on organizations
  for select
  using (exists (
    select 1 from memberships
    where memberships.org_id = organizations.id
      and memberships.user_id = auth.uid()
  ));

drop policy if exists "orgs_insert_service_role" on organizations;
create policy "orgs_insert_service_role" on organizations
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists "orgs_no_update" on organizations;
create policy "orgs_no_update" on organizations
  for update
  using (false);

drop policy if exists "orgs_no_delete" on organizations;
create policy "orgs_no_delete" on organizations
  for delete
  using (false);

-- Insert/Update org_id validation for child tables (entity_locations, entity_links, etc.)
-- (Additional RLS policies for INSERT/UPDATE available as needed.)

-- Auth bootstrap: handle new user
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_org_id uuid;
  v_pipeline_id uuid;
begin
  insert into profiles(user_id, email, full_name)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name')
    on conflict (user_id) do nothing;

  insert into organizations(name) values (coalesce(new.raw_user_meta_data->>'org_name', new.email || ' org'))
    returning id into v_org_id;

  insert into memberships(org_id, user_id, role) values (v_org_id, new.id, 'owner');

  -- Seed entity types
  insert into entity_types(org_id, name, schema) values
    (v_org_id, 'Customer', '{}'),
    (v_org_id, 'Salesperson', '{}'),
    (v_org_id, 'Location', '{}');

  -- Seed pipeline and stages
  insert into pipelines(org_id, name) values (v_org_id, 'Default Pipeline') returning id into v_pipeline_id;
  insert into pipeline_stages(pipeline_id, name, position) values
    (v_pipeline_id, 'New', 0),
    (v_pipeline_id, 'Contacted', 1),
    (v_pipeline_id, 'Qualified', 2),
    (v_pipeline_id, 'Won', 3),
    (v_pipeline_id, 'Lost', 4);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Geo upsert function (now infers org_id from entity, drops p_org)
create or replace function public.upsert_entity_location(
  p_entity uuid,
  p_geojson jsonb,
  p_properties jsonb default '{}'::jsonb,
  p_location_id uuid default null
) returns uuid
language plpgsql
as $
declare
  v_geom geometry;
  v_geom_type text;
  v_id uuid;
  v_org_id uuid;
begin
  select org_id into v_org_id from entities where id = p_entity;
  if v_org_id is null then
    raise exception 'Entity not found or missing org_id';
  end if;
  v_geom := ST_SetSRID(ST_GeomFromGeoJSON(p_geojson::text), 4326);
  v_geom_type := GeometryType(v_geom);

  if p_location_id is not null then
    update entity_locations
      set geom = v_geom, geom_type = v_geom_type, properties = p_properties
      where id = p_location_id and org_id = v_org_id and entity_id = p_entity
      returning id into v_id;
    if v_id is not null then
      return v_id;
    end if;
  end if;

  insert into entity_locations(org_id, entity_id, geom, geom_type, properties)
    values (v_org_id, p_entity, v_geom, v_geom_type, p_properties)
    returning id into v_id;
  return v_id;
end;
$;

-- Geo bounding box query (removes p_org, filters by org_id in current_user_org_ids())
create or replace function public.locations_within_bbox(
  p_minlon float8,
  p_minlat float8,
  p_maxlon float8,
  p_maxlat float8
) returns setof entity_locations
language sql
as $
  select * from entity_locations
  where org_id = any(array(select current_user_org_ids()))
    and ST_Intersects(
      geom,
      ST_MakeEnvelope(p_minlon, p_minlat, p_maxlon, p_maxlat, 4326)
    )
$;