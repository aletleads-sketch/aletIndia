-- SEO module phase 1: per-page meta tag overrides edited in the admin.
-- The site reads these when it renders a page; an empty field keeps the page's built-in value.

create table if not exists public.seo_pages (
  path text primary key check (path ~ '^/[a-z0-9/_-]*$'),
  title text check (char_length(title) <= 120),
  description text check (char_length(description) <= 320),
  og_title text check (char_length(og_title) <= 120),
  og_description text check (char_length(og_description) <= 320),
  og_image text check (char_length(og_image) <= 500),
  noindex boolean not null default false,
  updated_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.seo_pages is 'Admin overrides for a page''s Google title, description and share (Open Graph) tags. Keyed by site path, e.g. /about-us.';

drop trigger if exists seo_pages_touch_updated_at on public.seo_pages;
create trigger seo_pages_touch_updated_at
  before update on public.seo_pages
  for each row execute function private.touch_updated_at();

alter table public.seo_pages enable row level security;

-- Titles and descriptions are public on every page anyway, so the website reads them without signing in.
create policy "anyone reads seo pages" on public.seo_pages
  for select to anon, authenticated using (true);
create policy "admins add seo pages" on public.seo_pages
  for insert to authenticated with check ((select private.is_admin()));
create policy "admins update seo pages" on public.seo_pages
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins delete seo pages" on public.seo_pages
  for delete to authenticated using ((select private.is_admin()));
