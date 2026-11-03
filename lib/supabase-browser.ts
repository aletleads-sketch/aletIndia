"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/cms-client";

let client: SupabaseClient | null = null;

/**
 * Browser Supabase client for the admin. Shares its session with `public/cms-admin.html`
 * (same project, same origin storage key), so one sign-in covers both.
 */
export function getSupabase() {
  client ??= createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}
