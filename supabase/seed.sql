-- Only run this in non-production!
-- Insert test org, user, entities, and locations for local/dev testing.

insert into organizations (id, name)
  values ('11111111-1111-1111-1111-111111111111', 'Test Org')
  on conflict do nothing;

insert into entity_types (org_id, name, schema)
  select '11111111-1111-1111-1111-111111111111', 'Customer', '{}'
  where not exists (
    select 1 from entity_types
    where org_id = '11111111-1111-1111-1111-111111111111' and name = 'Customer'
  );

insert into pipelines (org_id, name)
  select '11111111-1111-1111-1111-111111111111', 'Test Pipeline'
  where not exists (
    select 1 from pipelines
    where org_id = '11111111-1111-1111-1111-111111111111' and name = 'Test Pipeline'
  );

insert into pipeline_stages (pipeline_id, name, position)
  select p.id, s.name, s.pos
  from pipelines p
  cross join (
    values ('New',0),('Contacted',1),('Qualified',2),('Won',3),('Lost',4)
  ) as s(name,pos)
  where p.org_id = '11111111-1111-1111-1111-111111111111'
    and not exists (
      select 1 from pipeline_stages
      where pipeline_id = p.id and name = s.name
    );

-- Insert demo entity
insert into entities (org_id, name)
  values ('11111111-1111-1111-1111-111111111111', 'Demo Customer')
  on conflict do nothing;

-- Insert demo location (point)
insert into entity_locations (org_id, entity_id, geom, geom_type)
  select '11111111-1111-1111-1111-111111111111', e.id,
    ST_SetSRID(ST_MakePoint(-97.5, 39.8),4326), 'Point'
  from entities e
  where e.org_id = '11111111-1111-1111-1111-111111111111'
    and e.name = 'Demo Customer'
  on conflict do nothing;