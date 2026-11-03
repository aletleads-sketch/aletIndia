-- Lead management phase 3: won leads become clients.

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone_country_code text,
  phone_number text,
  country text,
  lead_id uuid unique references public.leads(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  notes text,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.clients is 'Customers. Usually created from a won lead (lead_id); can also be added by hand.';

create index if not exists clients_created_at_idx on public.clients (created_at desc);

drop trigger if exists clients_touch_updated_at on public.clients;
create trigger clients_touch_updated_at
  before update on public.clients
  for each row execute function private.touch_updated_at();

alter table public.clients enable row level security;

create policy "lead staff read clients" on public.clients
  for select to authenticated using ((select private.can_manage_leads()));
create policy "lead staff add clients" on public.clients
  for insert to authenticated with check ((select private.can_manage_leads()));
create policy "lead staff update clients" on public.clients
  for update to authenticated
  using ((select private.can_manage_leads())) with check ((select private.can_manage_leads()));
create policy "admins delete clients" on public.clients
  for delete to authenticated using ((select private.is_admin()));

-- Converting a lead is recorded on the lead's timeline.
create or replace function private.log_client_conversion()
returns trigger
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'auth'
as $$
begin
  if new.lead_id is not null then
    insert into public.lead_notes (lead_id, author_id, kind, body, metadata)
    values (new.lead_id, auth.uid(), 'system', 'Converted to client ' || new.name,
      jsonb_build_object('client_id', new.id));
    update public.leads set last_activity_at = now() where id = new.lead_id;
  end if;
  return new;
end;
$$;

drop trigger if exists clients_log_conversion on public.clients;
create trigger clients_log_conversion
  after insert on public.clients
  for each row execute function private.log_client_conversion();
