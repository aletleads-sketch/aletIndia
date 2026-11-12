-- SEO module phase 2: Google Search Console and Google Analytics numbers for the SEO Dashboard,
-- Keywords Tracking and Reports screens.
--
-- The seo-sync edge function copies the numbers from Google once a night (service role).
-- Admins only read them; nothing here is public. Keywords to track are added by admins.
-- 'google' in seo_settings holds the Search Console site and GA4 property the sync reads (no secrets).

alter table public.seo_settings drop constraint if exists seo_settings_key_check;
alter table public.seo_settings add constraint seo_settings_key_check
  check (key = any (array['sitemap', 'robots', 'general', 'analytics', 'google']));

-- Site totals per day.
create table if not exists public.seo_daily (
  day date primary key,
  clicks integer not null default 0 check (clicks >= 0),
  impressions integer not null default 0 check (impressions >= 0),
  position numeric(7, 2) check (position is null or position >= 0),
  sessions integer not null default 0 check (sessions >= 0),
  users integer not null default 0 check (users >= 0),
  synced_at timestamptz not null default now()
);
comment on table public.seo_daily is 'Organic search totals per day: Search Console clicks, impressions, average position; GA4 organic sessions and users.';

-- Per page per day.
create table if not exists public.seo_page_daily (
  day date not null,
  page text not null check (char_length(page) between 1 and 2000),
  clicks integer not null default 0 check (clicks >= 0),
  impressions integer not null default 0 check (impressions >= 0),
  position numeric(7, 2) check (position is null or position >= 0),
  sessions integer not null default 0 check (sessions >= 0),
  synced_at timestamptz not null default now(),
  primary key (day, page)
);
comment on table public.seo_page_daily is 'Organic search numbers per page path per day (Search Console + GA4 landing pages).';
create index if not exists seo_page_daily_page_idx on public.seo_page_daily (page, day desc);

-- Per search query and ranking page per day (Search Console).
create table if not exists public.seo_query_daily (
  day date not null,
  query text not null check (char_length(query) between 1 and 500),
  page text not null check (char_length(page) between 1 and 2000),
  clicks integer not null default 0 check (clicks >= 0),
  impressions integer not null default 0 check (impressions >= 0),
  position numeric(7, 2) check (position is null or position >= 0),
  primary key (day, query, page)
);
comment on table public.seo_query_daily is 'Search Console rows per day, query and ranking page; used by Keywords Tracking and Reports.';
create index if not exists seo_query_daily_query_idx on public.seo_query_daily (query, day desc);

-- Keywords the team wants to follow.
create table if not exists public.seo_keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text not null check (keyword = lower(btrim(keyword)) and char_length(keyword) between 1 and 200),
  tags text[] not null default '{}' check (cardinality(tags) <= 10),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  unique (keyword)
);
comment on table public.seo_keywords is 'Keywords tracked in the admin; positions come from seo_query_daily.';

-- One row per sync run, so the admin can show "last synced" and any error.
create table if not exists public.seo_sync_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  trigger text not null check (trigger in ('schedule', 'admin')),
  ok boolean,
  days smallint check (days between 1 and 500),
  row_count integer check (row_count >= 0),
  message text check (message is null or char_length(message) <= 2000)
);
comment on table public.seo_sync_runs is 'Each copy of Google numbers into the database: when, how many rows, and any error.';
create index if not exists seo_sync_runs_started_idx on public.seo_sync_runs (started_at desc);

alter table public.seo_daily enable row level security;
alter table public.seo_page_daily enable row level security;
alter table public.seo_query_daily enable row level security;
alter table public.seo_keywords enable row level security;
alter table public.seo_sync_runs enable row level security;

create policy "admins read seo daily" on public.seo_daily
  for select to authenticated using ((select private.is_admin()));
create policy "admins read seo page daily" on public.seo_page_daily
  for select to authenticated using ((select private.is_admin()));
create policy "admins read seo query daily" on public.seo_query_daily
  for select to authenticated using ((select private.is_admin()));
create policy "admins read seo sync runs" on public.seo_sync_runs
  for select to authenticated using ((select private.is_admin()));

create policy "admins read seo keywords" on public.seo_keywords
  for select to authenticated using ((select private.is_admin()));
create policy "admins add seo keywords" on public.seo_keywords
  for insert to authenticated with check ((select private.is_admin()));
create policy "admins update seo keywords" on public.seo_keywords
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins delete seo keywords" on public.seo_keywords
  for delete to authenticated using ((select private.is_admin()));

-- Totals per query (and the page that shows most for it) over a date range, for Keywords and Reports.
-- security invoker: the caller's row-level security still applies, so only admins get rows.
create or replace function public.seo_query_summary(p_from date, p_to date, p_queries text[] default null, p_limit integer default 500)
returns table (query text, clicks bigint, impressions bigint, "position" numeric, page text)
language sql stable security invoker set search_path = '' as $$
  with picked as (
    select q.query, q.page, q.clicks, q.impressions, q.position
    from public.seo_query_daily q
    where q.day between p_from and p_to and (p_queries is null or q.query = any (p_queries))
  ),
  totals as (
    select r.query, sum(r.clicks) as clicks, sum(r.impressions) as impressions,
           round(sum(r.position * r.impressions) / nullif(sum(r.impressions), 0), 1) as position
    from picked r group by r.query
  ),
  top_page as (
    select distinct on (r.query) r.query, r.page
    from (select query, page, sum(impressions) as impressions from picked group by query, page) r
    order by r.query, r.impressions desc
  )
  select t.query, t.clicks, t.impressions, t.position, p.page
  from totals t left join top_page p using (query)
  order by t.clicks desc, t.impressions desc
  limit least(greatest(p_limit, 1), 5000);
$$;

-- Totals per page over a date range, for Reports.
create or replace function public.seo_page_summary(p_from date, p_to date, p_limit integer default 200)
returns table (page text, clicks bigint, impressions bigint, "position" numeric, sessions bigint)
language sql stable security invoker set search_path = '' as $$
  select p.page, sum(p.clicks), sum(p.impressions),
         round(sum(p.position * p.impressions) / nullif(sum(p.impressions), 0), 1),
         sum(p.sessions)
  from public.seo_page_daily p
  where p.day between p_from and p_to
  group by p.page
  order by sum(p.sessions) desc, sum(p.clicks) desc
  limit least(greatest(p_limit, 1), 2000);
$$;

revoke all on function public.seo_query_summary(date, date, text[], integer) from public, anon;
revoke all on function public.seo_page_summary(date, date, integer) from public, anon;
grant execute on function public.seo_query_summary(date, date, text[], integer) to authenticated;
grant execute on function public.seo_page_summary(date, date, integer) to authenticated;

-- The phase 2 SEO tables are admin-only; signed-out visitors need no access at all.
revoke all on public.seo_daily, public.seo_page_daily, public.seo_query_daily, public.seo_keywords, public.seo_sync_runs from anon;
