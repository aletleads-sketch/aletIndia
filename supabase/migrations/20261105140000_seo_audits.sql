-- SEO module phase 1: saved results of the admin's SEO Audit runs, so the team can see the score over time.
-- Admin-only: audit findings are internal, the public site never reads them.

create table if not exists public.seo_audits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  score smallint not null check (score between 0 and 100),
  pages smallint not null check (pages >= 0),
  critical integer not null default 0 check (critical >= 0),
  warnings integer not null default 0 check (warnings >= 0),
  notices integer not null default 0 check (notices >= 0),
  issues jsonb not null default '[]'::jsonb check (jsonb_typeof(issues) = 'array' and pg_column_size(issues) < 1000000),
  run_by uuid references public.profiles(id) on delete set null default auth.uid()
);

comment on table public.seo_audits is 'One row per SEO Audit run from the admin: overall score, counts and the list of issues found.';

create index if not exists seo_audits_created_at_idx on public.seo_audits (created_at desc);

alter table public.seo_audits enable row level security;

create policy "admins read seo audits" on public.seo_audits
  for select to authenticated using ((select private.is_admin()));
create policy "admins add seo audits" on public.seo_audits
  for insert to authenticated with check ((select private.is_admin()));
create policy "admins delete seo audits" on public.seo_audits
  for delete to authenticated using ((select private.is_admin()));
