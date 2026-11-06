-- Content Studio: who changed what, and when.
-- Every add, edit and delete of website content is written to content_activity by a trigger,
-- so the admin dashboard can show recent changes (with the person) and activity per week.

create table if not exists public.content_activity (
  id bigint generated always as identity primary key,
  table_name text not null,
  row_id text,
  title text,
  action text not null check (action in ('created', 'updated', 'deleted')),
  status text,
  actor uuid references public.profiles (id) on delete set null,
  at timestamptz not null default now()
);

create index if not exists content_activity_at_idx on public.content_activity (at desc);

alter table public.content_activity enable row level security;

drop policy if exists "Content staff read activity" on public.content_activity;
create policy "Content staff read activity" on public.content_activity
  for select to authenticated using (private.can_manage_content());

create or replace function private.log_content_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
  page text;
begin
  -- Skip saves that changed nothing but the timestamps or the order (dragging sections is not news).
  if tg_op = 'UPDATE' and (to_jsonb(new) - 'updated_at' - 'updated_by' - 'sort_order') = (to_jsonb(old) - 'updated_at' - 'updated_by' - 'sort_order') then
    return new;
  end if;
  page := case when tg_table_name = 'page_sections' then rec ->> 'page_path' end;
  insert into public.content_activity (table_name, row_id, title, action, status, actor)
  values (
    tg_table_name,
    -- Sections are found by "page#section" in the admin, everything else by its id (pages by path).
    coalesce(case when page is not null then page || '#' || (rec ->> 'section_key') end, rec ->> 'id', rec ->> 'path'),
    coalesce(rec ->> 'title', rec ->> 'name', rec ->> 'question', rec ->> 'client_name', rec ->> 'client', rec ->> 'label'),
    case tg_op when 'INSERT' then 'created' when 'UPDATE' then 'updated' else 'deleted' end,
    coalesce(rec ->> 'status', case when rec ? 'visible' then case when (rec ->> 'visible')::boolean then 'published' else 'draft' end end),
    auth.uid()
  );
  return coalesce(new, old);
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['services', 'projects', 'case_studies', 'blogs', 'faqs', 'testimonials', 'client_logos', 'industries', 'careers', 'menu_items', 'page_sections', 'site_pages']
  loop
    execute format('drop trigger if exists %I on public.%I', t || '_log_activity', t);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function private.log_content_activity()', t || '_log_activity', t);
  end loop;
end $$;

-- industries had no updated_at stamp.
drop trigger if exists industries_touch_updated_at on public.industries;
create trigger industries_touch_updated_at before update on public.industries
  for each row execute function private.touch_updated_at();
