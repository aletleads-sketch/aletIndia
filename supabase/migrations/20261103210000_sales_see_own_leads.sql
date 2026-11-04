-- Sales members only see and work the leads assigned to them; admins keep full access.
-- Notes, attachments, lead files and clients follow the lead they belong to.

create or replace function private.can_access_lead(lead_owner uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select coalesce(
    private.current_role() = 'admin'::public.app_role
      or (private.current_role() = 'sales'::public.app_role and lead_owner = auth.uid()),
    false)
$$;

create or replace function private.can_access_lead_id(target uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select exists (select 1 from public.leads l where l.id = target and private.can_access_lead(l.owner_id))
$$;

-- Lead files are stored as `<lead id>/<file>`; anything else is admin-only.
create or replace function private.can_access_lead_file(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = pg_catalog, public, auth, storage
as $$
declare
  lead uuid;
begin
  begin
    lead := (storage.foldername(object_name))[1]::uuid;
  exception when others then
    return private.is_admin();
  end;
  return private.can_access_lead_id(lead);
end;
$$;

-- Leads
drop policy if exists "lead staff read leads" on public.leads;
drop policy if exists "lead staff add leads" on public.leads;
drop policy if exists "lead staff update leads" on public.leads;

create policy "admins or assigned sales read leads" on public.leads
  for select to authenticated
  using ((select private.can_access_lead(owner_id)));

-- Sales can add leads only for themselves; the website form inserts with the service role.
create policy "admins or sales add own leads" on public.leads
  for insert to authenticated
  with check ((select private.can_access_lead(owner_id)));

-- The check also stops sales from handing a lead to someone else.
create policy "admins or assigned sales update leads" on public.leads
  for update to authenticated
  using ((select private.can_access_lead(owner_id)))
  with check ((select private.can_access_lead(owner_id)));

-- Notes
drop policy if exists "lead staff manage notes" on public.lead_notes;

create policy "admins or assigned sales manage notes" on public.lead_notes
  for all to authenticated
  using ((select private.can_access_lead_id(lead_id)))
  with check ((select private.can_access_lead_id(lead_id)));

-- Attachments
drop policy if exists "lead staff read attachments" on public.lead_attachments;
drop policy if exists "lead staff add attachments" on public.lead_attachments;
drop policy if exists "uploader or admin deletes attachments" on public.lead_attachments;

create policy "admins or assigned sales read attachments" on public.lead_attachments
  for select to authenticated
  using ((select private.can_access_lead_id(lead_id)));

create policy "admins or assigned sales add attachments" on public.lead_attachments
  for insert to authenticated
  with check ((select private.can_access_lead_id(lead_id)) and uploaded_by = (select auth.uid()));

create policy "uploader or admin deletes attachments" on public.lead_attachments
  for delete to authenticated
  using ((select private.can_access_lead_id(lead_id)) and (uploaded_by = (select auth.uid()) or (select private.is_admin())));

-- Lead files in storage
drop policy if exists "lead staff read lead files" on storage.objects;
drop policy if exists "lead staff upload lead files" on storage.objects;
drop policy if exists "uploader or admin deletes lead files" on storage.objects;

create policy "admins or assigned sales read lead files" on storage.objects
  for select to authenticated
  using (bucket_id = 'lead-files' and private.can_access_lead_file(name));

create policy "admins or assigned sales upload lead files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'lead-files' and private.can_access_lead_file(name));

create policy "uploader or admin deletes lead files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'lead-files' and private.can_access_lead_file(name)
    and (owner_id = (select auth.uid())::text or (select private.is_admin())));

-- Clients
drop policy if exists "lead staff read clients" on public.clients;
drop policy if exists "lead staff add clients" on public.clients;
drop policy if exists "lead staff update clients" on public.clients;

create policy "admins or owning sales read clients" on public.clients
  for select to authenticated
  using ((select private.can_access_lead(owner_id)));

create policy "admins or owning sales add clients" on public.clients
  for insert to authenticated
  with check ((select private.can_access_lead(owner_id)));

create policy "admins or owning sales update clients" on public.clients
  for update to authenticated
  using ((select private.can_access_lead(owner_id)))
  with check ((select private.can_access_lead(owner_id)));
