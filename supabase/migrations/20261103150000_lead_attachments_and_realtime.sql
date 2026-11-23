-- Lead management phase 2: private file attachments and live updates.

-- Files live in a private bucket; staff open them through short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit)
values ('lead-files', 'lead-files', false, 26214400)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

create table if not exists public.lead_attachments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  note_id uuid references public.lead_notes(id) on delete set null,
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint not null default 0,
  uploaded_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

comment on table public.lead_attachments is 'Files attached to a lead (proposals, briefs, quotes). The bytes are in storage bucket lead-files at storage_path.';
comment on column public.lead_attachments.note_id is 'Set when the file was sent with a follow-up comment.';

create index if not exists lead_attachments_lead_idx on public.lead_attachments (lead_id, created_at desc);
create index if not exists lead_attachments_note_idx on public.lead_attachments (note_id) where note_id is not null;

alter table public.lead_attachments enable row level security;

create policy "lead staff read attachments" on public.lead_attachments
  for select to authenticated using ((select private.can_manage_leads()));
create policy "lead staff add attachments" on public.lead_attachments
  for insert to authenticated
  with check ((select private.can_manage_leads()) and uploaded_by = (select auth.uid()));
create policy "uploader or admin deletes attachments" on public.lead_attachments
  for delete to authenticated
  using ((select private.can_manage_leads()) and (uploaded_by = (select auth.uid()) or (select private.is_admin())));

create policy "lead staff read lead files" on storage.objects
  for select to authenticated using (bucket_id = 'lead-files' and (select private.can_manage_leads()));
create policy "lead staff upload lead files" on storage.objects
  for insert to authenticated with check (bucket_id = 'lead-files' and (select private.can_manage_leads()));
create policy "uploader or admin deletes lead files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'lead-files' and (select private.can_manage_leads())
    and (owner_id = (select auth.uid())::text or (select private.is_admin())));

-- A file uploaded on its own (not with a comment) still shows in the timeline.
create or replace function private.log_lead_attachment()
returns trigger
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $$
begin
  if new.note_id is null then
    insert into public.lead_notes (lead_id, author_id, kind, body, metadata)
    values (new.lead_id, new.uploaded_by, 'system', 'Attached ' || new.file_name,
      jsonb_build_object('attachment_id', new.id));
  end if;
  update public.leads set last_activity_at = now() where id = new.lead_id;
  return new;
end;
$$;

drop trigger if exists lead_attachments_log on public.lead_attachments;
create trigger lead_attachments_log
  after insert on public.lead_attachments
  for each row execute function private.log_lead_attachment();

-- Live updates in the admin. Realtime still applies each table's RLS per subscriber.
do $$
declare t text;
begin
  foreach t in array array['leads', 'lead_notes', 'lead_attachments'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
