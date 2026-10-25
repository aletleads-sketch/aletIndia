-- Preserve each field from the public enquiry form, including the original service label.
alter table public.leads
  add column if not exists phone_country_code text,
  add column if not exists service_name text,
  add column if not exists form_data jsonb not null default '{}'::jsonb;

comment on column public.leads.service_name is 'The exact service selected on the enquiry form, retained even when no services row matches.';
comment on column public.leads.form_data is 'Additional submitted enquiry data retained for CRM review.';
