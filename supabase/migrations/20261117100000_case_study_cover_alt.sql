-- The case study editor's cover picture now saves its description (alt text).
alter table public.case_studies add column if not exists cover_image_alt text;
