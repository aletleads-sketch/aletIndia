-- Full website content in the database, page by page and section by section,
-- so the client can change any text or image later.
--
-- New tables:
--   site_pages     one row per public page (plus '_shared' for blocks used on many pages)
--   page_sections  every section of every page, in order, with its text, links and images
--   case_studies   the case study detail pages
--
-- Existing content tables get the columns the website needs. Nothing is dropped, so the
-- older Content Manager screen keeps working.

-- Pages -------------------------------------------------------------------------------------

create table if not exists public.site_pages (
  path text primary key,
  name text not null,
  page_type text not null default 'Page',
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint site_pages_path_check check (path = '_shared' or path like '/%')
);

comment on table public.site_pages is
  'Every public page of the website. The row ''_shared'' holds blocks used on many pages (header, footer, contact form, stats).';

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_path text not null references public.site_pages(path) on update cascade on delete cascade,
  section_key text not null,
  label text not null,
  sort_order integer not null default 0,
  -- When set, this row only places a shared block (page_path = '_shared') on the page.
  shared_key text,
  -- Lists this section shows, read from their own tables (services, faqs, testimonials ...).
  collections text[] not null default '{}',
  -- { eyebrow, heading, accent, intro, blocks: [...], images: [{src, alt}], data: {...} }
  content jsonb not null default '{}'::jsonb,
  status public.publish_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  unique (page_path, section_key)
);

create index if not exists page_sections_page_order_idx on public.page_sections (page_path, sort_order);

comment on column public.page_sections.content is
  'Section copy. blocks keeps the exact page order: headings (h1-h6), paragraphs (p), list items (li), links ({text, href}), images ({src, alt}), form labels and options.';

-- Case studies ------------------------------------------------------------------------------

create table if not exists public.case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  client text not null,
  industry text,
  title text not null,
  summary text,
  cover_image_url text,
  -- Facts, snapshot, screens, narrative sections, challenge, approach, outcome.
  data jsonb not null default '{}'::jsonb,
  -- Card shown on the Case Studies index (title, summary, tags, image), when featured there.
  preview jsonb,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

-- Columns the website needs on existing tables ----------------------------------------------

alter table public.services
  add column if not exists service_key text,
  add column if not exists nav_label text,
  add column if not exists hero_image_alt text,
  add column if not exists channels text[] not null default '{}',
  add column if not exists visual jsonb;
create unique index if not exists services_service_key_key on public.services (service_key);

alter table public.projects
  add column if not exists logo_url text,
  add column if not exists theme text,
  add column if not exists display jsonb not null default '{}'::jsonb;

alter table public.blogs
  add column if not exists author_name text,
  add column if not exists categories text[] not null default '{}',
  add column if not exists images jsonb;

alter table public.testimonials
  add column if not exists image_fit text not null default 'cover';

alter table public.industries
  add column if not exists image_alt text;

alter table public.client_logos
  add column if not exists logo_alt text;

alter table public.menu_items
  add column if not exists menu text not null default 'header';
create index if not exists menu_items_menu_order_idx on public.menu_items (menu, sort_order);

comment on column public.menu_items.menu is
  'Which menu the link belongs to: header, footer_services, footer_company, footer_legal, portals.';

alter table public.careers
  add column if not exists department text,
  add column if not exists experience text,
  add column if not exists image_url text,
  add column if not exists summary text,
  add column if not exists sort_order integer not null default 0;

-- updated_at ------------------------------------------------------------------------------

drop trigger if exists site_pages_touch_updated_at on public.site_pages;
create trigger site_pages_touch_updated_at before update on public.site_pages
  for each row execute function private.touch_updated_at();
drop trigger if exists page_sections_touch_updated_at on public.page_sections;
create trigger page_sections_touch_updated_at before update on public.page_sections
  for each row execute function private.touch_updated_at();
drop trigger if exists case_studies_touch_updated_at on public.case_studies;
create trigger case_studies_touch_updated_at before update on public.case_studies
  for each row execute function private.touch_updated_at();

-- Access: everyone reads published rows, content staff manage them --------------------------

alter table public.site_pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.case_studies enable row level security;

grant select on table public.site_pages, public.page_sections, public.case_studies to anon, authenticated;
grant insert, update, delete on table public.site_pages, public.page_sections, public.case_studies to authenticated;

drop policy if exists "Public reads published pages" on public.site_pages;
create policy "Public reads published pages" on public.site_pages
  for select to anon using (status = 'published');
drop policy if exists "Signed-in users read pages" on public.site_pages;
create policy "Signed-in users read pages" on public.site_pages
  for select to authenticated using (status = 'published' or private.can_manage_content());
drop policy if exists "Content staff manage pages" on public.site_pages;
create policy "Content staff manage pages" on public.site_pages
  for all to authenticated using (private.can_manage_content()) with check (private.can_manage_content());

drop policy if exists "Public reads published page sections" on public.page_sections;
create policy "Public reads published page sections" on public.page_sections
  for select to anon using (status = 'published');
drop policy if exists "Signed-in users read page sections" on public.page_sections;
create policy "Signed-in users read page sections" on public.page_sections
  for select to authenticated using (status = 'published' or private.can_manage_content());
drop policy if exists "Content staff manage page sections" on public.page_sections;
create policy "Content staff manage page sections" on public.page_sections
  for all to authenticated using (private.can_manage_content()) with check (private.can_manage_content());

drop policy if exists "Public reads published case studies" on public.case_studies;
create policy "Public reads published case studies" on public.case_studies
  for select to anon using (status = 'published');
drop policy if exists "Signed-in users read case studies" on public.case_studies;
create policy "Signed-in users read case studies" on public.case_studies
  for select to authenticated using (status = 'published' or private.can_manage_content());
drop policy if exists "Content staff manage case studies" on public.case_studies;
create policy "Content staff manage case studies" on public.case_studies
  for all to authenticated using (private.can_manage_content()) with check (private.can_manage_content());
