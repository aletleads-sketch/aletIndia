-- Owners: the only admins who may switch off, demote or reset the password of another admin.
-- Profiles have no update policy, so nobody can make themselves an owner from the app;
-- owners are set here (or in SQL) by a developer. The team-admin edge function enforces the rule.
alter table public.profiles add column if not exists is_owner boolean not null default false;
comment on column public.profiles.is_owner is 'Owner admins manage other admins. Set by a developer only.';

update public.profiles set is_owner = true
where email in ('akshey22@gmail.com', 'nd22982@gmail.com', 'qa.admin@aletindia.com') and role = 'admin';
