-- Connect CMS-managed projects to one or more service slugs.
alter table public.projects
  add column if not exists service_slugs text[] not null default '{}';

create index if not exists projects_service_slugs_idx
  on public.projects using gin (service_slugs);

-- The corresponding production migration seeds the initial published menu,
-- service catalogue and showcase projects. Existing records are never replaced.
