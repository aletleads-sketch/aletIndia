-- Job applications sent from the Careers page. The website never writes here directly:
-- the job-application-intake edge function checks the captcha and inserts with the service role.
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  career_id uuid references public.careers(id) on delete set null,
  job_title text not null,
  full_name text not null,
  email text not null,
  phone text,
  city text,
  experience text,
  notice_period text,
  portfolio_url text,
  message text,
  resume_path text,
  resume_name text,
  status text not null default 'new' check (status in ('new', 'shortlisted', 'interview', 'hired', 'rejected')),
  notes text,
  viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.job_applications is 'Applications from the Careers page. Resumes are in storage bucket job-applications at resume_path.';
create index if not exists job_applications_created_at_idx on public.job_applications (created_at desc);

drop trigger if exists job_applications_touch_updated_at on public.job_applications;
create trigger job_applications_touch_updated_at
  before update on public.job_applications
  for each row execute function private.touch_updated_at();

alter table public.job_applications enable row level security;
create policy "admins read applications" on public.job_applications
  for select to authenticated using ((select private.is_admin()));
create policy "admins update applications" on public.job_applications
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins delete applications" on public.job_applications
  for delete to authenticated using ((select private.is_admin()));

-- Resumes: private, 5 MB, PDF / DOC / DOCX. Uploaded by the edge function; admins read and delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('job-applications', 'job-applications', false, 5242880,
  array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;

create policy "admins read resumes" on storage.objects
  for select to authenticated using (bucket_id = 'job-applications' and (select private.is_admin()));
create policy "admins delete resumes" on storage.objects
  for delete to authenticated using (bucket_id = 'job-applications' and (select private.is_admin()));
