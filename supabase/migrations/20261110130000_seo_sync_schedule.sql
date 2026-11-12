-- SEO module phase 2: secrets for the seo-sync edge function, and its nightly schedule.
--
-- Both secrets live in Supabase Vault (encrypted), never in a table the website can read:
--   seo_sync_secret              random value the nightly job sends; the function checks it
--   seo_google_service_account   the Google service account key file, uploaded by an admin in SEO Settings
-- Only the service role (the edge function) can read or change them, through the two functions below.

create extension if not exists pg_net;
create extension if not exists pg_cron;

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'seo_sync_secret') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'seo_sync_secret', 'Header value the nightly SEO sync job sends to the seo-sync function.');
  end if;
end $$;

-- Reads one of the two SEO secrets (service role only).
create or replace function public.seo_secret(p_name text)
returns text
language sql stable security definer set search_path = '' as $$
  select decrypted_secret from vault.decrypted_secrets
  where name = p_name and p_name in ('seo_sync_secret', 'seo_google_service_account')
  limit 1;
$$;

-- Saves the Google service account key (service role only; the edge function checks the caller is an admin).
create or replace function public.seo_set_google_key(p_json text)
returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  existing uuid;
begin
  select id into existing from vault.secrets where name = 'seo_google_service_account';
  if existing is null then
    perform vault.create_secret(p_json, 'seo_google_service_account', 'Google service account key for the SEO sync.');
  else
    perform vault.update_secret(existing, p_json);
  end if;
end;
$$;

revoke all on function public.seo_secret(text) from public, anon, authenticated;
revoke all on function public.seo_set_google_key(text) from public, anon, authenticated;
grant execute on function public.seo_secret(text) to service_role;
grant execute on function public.seo_set_google_key(text) to service_role;

-- Every night at 02:30 IST (21:00 UTC): copy the latest Google numbers.
select cron.unschedule('seo-sync-nightly') where exists (select 1 from cron.job where jobname = 'seo-sync-nightly');
select cron.schedule(
  'seo-sync-nightly',
  '0 21 * * *',
  $job$
  select net.http_post(
    url := 'https://seegtwkfeolpjlgjlbyd.supabase.co/functions/v1/seo-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-seo-sync-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'seo_sync_secret')
    ),
    body := '{"action":"sync"}'::jsonb,
    timeout_milliseconds := 120000
  );
  $job$
);
