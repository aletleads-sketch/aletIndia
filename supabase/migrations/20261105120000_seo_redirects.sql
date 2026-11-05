-- SEO module phase 1: URL redirects managed in the admin.
-- The site's proxy reads enabled rows and sends visitors (and Google) from the old path to the new one.

create table if not exists public.seo_redirects (
  id uuid primary key default gen_random_uuid(),
  source text not null unique check (source ~ '^/[A-Za-z0-9/_.~%-]*$' and source <> '/' and char_length(source) <= 300),
  destination text not null check (
    (destination ~ '^/[A-Za-z0-9/_.~%#?=&-]*$' or destination ~ '^https://[^\s]+$') and char_length(destination) <= 500
  ),
  status_code smallint not null default 301 check (status_code in (301, 302)),
  enabled boolean not null default true,
  note text check (char_length(note) <= 200),
  updated_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source <> destination)
);

comment on table public.seo_redirects is 'Old URL -> new URL redirects from the admin SEO screen, applied by the website proxy.';

drop trigger if exists seo_redirects_touch_updated_at on public.seo_redirects;
create trigger seo_redirects_touch_updated_at
  before update on public.seo_redirects
  for each row execute function private.touch_updated_at();

alter table public.seo_redirects enable row level security;

-- Visitors are redirected before signing in, so the website reads the rules with the public key.
create policy "anyone reads seo redirects" on public.seo_redirects
  for select to anon, authenticated using (true);
create policy "admins add seo redirects" on public.seo_redirects
  for insert to authenticated with check ((select private.is_admin()));
create policy "admins update seo redirects" on public.seo_redirects
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins delete seo redirects" on public.seo_redirects
  for delete to authenticated using ((select private.is_admin()));
