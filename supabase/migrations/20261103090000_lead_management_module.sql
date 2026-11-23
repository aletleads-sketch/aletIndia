-- Lead management module: pipeline tabs, trash, unread state, typed follow-ups and an
-- automatic activity timeline. Additive only; existing leads keep their status.

alter table public.leads
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.profiles(id) on delete set null,
  add column if not exists lost_reason text,
  add column if not exists won_at timestamptz,
  add column if not exists first_viewed_at timestamptz,
  add column if not exists last_activity_at timestamptz not null default now();

comment on column public.leads.deleted_at is 'Set when a lead is moved to Trash; null again on restore.';
comment on column public.leads.first_viewed_at is 'First time any staff member opened the lead; null shows it as unread.';

update public.leads set last_activity_at = greatest(created_at, updated_at);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_active_idx on public.leads (status) where deleted_at is null;

alter table public.lead_notes
  add column if not exists kind text not null default 'comment',
  add column if not exists author_name text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.lead_notes drop constraint if exists lead_notes_kind_check;
alter table public.lead_notes add constraint lead_notes_kind_check
  check (kind in ('comment', 'call', 'email', 'meeting', 'client_reply', 'status_change', 'system'));

comment on column public.lead_notes.author_name is 'Display name for entries not written by staff, e.g. a client reply logged by staff.';

create index if not exists lead_notes_lead_created_idx on public.lead_notes (lead_id, created_at desc);

-- Any follow-up bumps the lead's last activity. Status/system entries come from the
-- leads trigger below, which already sets last_activity_at on the row being updated.
create or replace function private.touch_lead_activity()
returns trigger
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $$
begin
  update public.leads set last_activity_at = new.created_at where id = new.lead_id;
  return new;
end;
$$;

drop trigger if exists lead_notes_touch_lead on public.lead_notes;
create trigger lead_notes_touch_lead
  after insert on public.lead_notes
  for each row
  when (new.kind not in ('status_change', 'system'))
  execute function private.touch_lead_activity();

-- Status changes and trash/restore are written to the timeline automatically.
create or replace function private.log_lead_changes()
returns trigger
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'auth'
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'won' and new.won_at is null then
      new.won_at := now();
    end if;
    insert into public.lead_notes (lead_id, author_id, kind, body, metadata)
    values (new.id, auth.uid(), 'status_change',
      'Status changed from ' || old.status || ' to ' || new.status
        || case when new.status = 'lost' and new.lost_reason is not null then ': ' || new.lost_reason else '' end,
      jsonb_build_object('from', old.status, 'to', new.status));
  end if;

  if new.deleted_at is distinct from old.deleted_at then
    insert into public.lead_notes (lead_id, author_id, kind, body)
    values (new.id, auth.uid(), 'system',
      case when new.deleted_at is null then 'Restored from Trash' else 'Moved to Trash' end);
  end if;

  if new.owner_id is distinct from old.owner_id then
    insert into public.lead_notes (lead_id, author_id, kind, body, metadata)
    values (new.id, auth.uid(), 'system',
      coalesce('Assigned to ' || (select coalesce(full_name, email) from public.profiles where id = new.owner_id), 'Unassigned'),
      jsonb_build_object('owner_id', new.owner_id));
  end if;

  new.last_activity_at := now();
  return new;
end;
$$;

drop trigger if exists leads_log_changes on public.leads;
create trigger leads_log_changes
  before update on public.leads
  for each row
  when (old.status is distinct from new.status
     or old.deleted_at is distinct from new.deleted_at
     or old.owner_id is distinct from new.owner_id)
  execute function private.log_lead_changes();

-- Lead staff can work leads; only admins can delete permanently.
drop policy if exists "lead staff manage leads" on public.leads;
create policy "lead staff read leads" on public.leads
  for select to authenticated using ((select private.can_manage_leads()));
create policy "lead staff add leads" on public.leads
  for insert to authenticated with check ((select private.can_manage_leads()));
create policy "lead staff update leads" on public.leads
  for update to authenticated
  using ((select private.can_manage_leads())) with check ((select private.can_manage_leads()));
create policy "admins delete leads" on public.leads
  for delete to authenticated using ((select private.is_admin()));

-- Lead staff need teammates' names for the timeline and the assignee picker.
create policy "lead staff read team profiles" on public.profiles
  for select to authenticated using ((select private.can_manage_leads()));
