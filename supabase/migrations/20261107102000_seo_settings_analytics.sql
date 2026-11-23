-- Site Settings → Analytics: the Google Analytics / Tag Manager ids the website loads (admins only, like the other settings).
alter table public.seo_settings drop constraint if exists seo_settings_key_check;
alter table public.seo_settings add constraint seo_settings_key_check check (key = any (array['sitemap', 'robots', 'general', 'analytics']));
