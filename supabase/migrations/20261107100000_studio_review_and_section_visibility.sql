-- "In review": saved but waiting for someone to check it (the dashboard's Pending Reviews).
alter type public.publish_status add value if not exists 'review' after 'draft';

-- A page section can be switched off without deleting it; the website skips hidden sections.
alter table public.page_sections add column if not exists hidden boolean not null default false;
