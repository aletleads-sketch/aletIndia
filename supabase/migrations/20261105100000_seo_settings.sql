-- SEO module phase 1: site-wide SEO settings edited in the admin, one row per area.
-- 'sitemap': pages left out of sitemap.xml and per-page priority / change frequency.
-- 'robots':  extra paths crawlers are asked not to visit.
-- A missing row keeps the built-in behaviour, so the site works the same before anyone edits.

create table if not exists public.seo_settings (
  key text primary key check (key in ('sitemap', 'robots', 'general')),
  value jsonb not null default '{}'::jsonb check (jsonb_typeof(value) = 'object' and pg_column_size(value) < 50000),
  updated_by uuid references public.profiles(id) on delete set null default auth.uid(),
  updated_at timestamptz not null default now()
);

comment on table public.seo_settings is 'Site-wide SEO settings from the admin (sitemap choices, robots.txt rules), read by the public site.';

drop trigger if exists seo_settings_touch_updated_at on public.seo_settings;
create trigger seo_settings_touch_updated_at
  before update on public.seo_settings
  for each row execute function private.touch_updated_at();

alter table public.seo_settings enable row level security;

-- The same choices are published in sitemap.xml and robots.txt, so the website reads them without signing in.
create policy "anyone reads seo settings" on public.seo_settings
  for select to anon, authenticated using (true);
create policy "admins add seo settings" on public.seo_settings
  for insert to authenticated with check ((select private.is_admin()));
create policy "admins update seo settings" on public.seo_settings
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins delete seo settings" on public.seo_settings
  for delete to authenticated using ((select private.is_admin()));
