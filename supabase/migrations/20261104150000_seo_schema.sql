-- SEO module phase 1: structured data (JSON-LD) switches and company details edited in the admin.
-- A missing row means "on, with the built-in values", so the site works the same before anyone edits.

create table if not exists public.seo_schema (
  type text primary key check (type in ('organization', 'service', 'faq', 'article', 'job_posting', 'breadcrumb')),
  enabled boolean not null default true,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 20000),
  updated_by uuid references public.profiles(id) on delete set null default auth.uid(),
  updated_at timestamptz not null default now()
);

comment on table public.seo_schema is 'Per-type switches for the structured data Google reads, plus admin overrides in data (e.g. company name, logo, social links for organization).';

drop trigger if exists seo_schema_touch_updated_at on public.seo_schema;
create trigger seo_schema_touch_updated_at
  before update on public.seo_schema
  for each row execute function private.touch_updated_at();

alter table public.seo_schema enable row level security;

-- The same data is published inside every page, so the website reads it without signing in.
create policy "anyone reads seo schema" on public.seo_schema
  for select to anon, authenticated using (true);
create policy "admins add seo schema" on public.seo_schema
  for insert to authenticated with check ((select private.is_admin()));
create policy "admins update seo schema" on public.seo_schema
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins delete seo schema" on public.seo_schema
  for delete to authenticated using ((select private.is_admin()));
