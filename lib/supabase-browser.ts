"use client";

import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/cms-client";

let client: SupabaseClient | null = null;

/**
 * Browser Supabase client for the admin. Shares its session with `public/cms-admin.html`
 * (same project, same origin storage key), so one sign-in covers both.
 */
export function getSupabase() {
  if (!client) {
    const created = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    // Live updates run as the signed-in user, not as an anonymous visitor: otherwise the
    // database's read rules (admins and assigned sales only) silently drop every change.
    // supabase-js does not pass a restored or refreshed session to Realtime on its own.
    created.auth.onAuthStateChange((event, session) => {
      if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        void created.realtime.setAuth(session.access_token);
      }
    });
    client = created;
  }
  return client;
}

/**
 * Subscribes to live database changes as the signed-in user. `build` adds the listeners;
 * the returned function unsubscribes (safe to call before the subscription has started).
 */
export function subscribeLive(name: string, build: (channel: RealtimeChannel) => RealtimeChannel) {
  const supabase = getSupabase();
  let channel: RealtimeChannel | null = null;
  let stopped = false;
  void (async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) await supabase.realtime.setAuth(data.session.access_token);
    if (stopped) return;
    channel = build(supabase.channel(name)).subscribe();
  })();
  return () => {
    stopped = true;
    if (channel) void supabase.removeChannel(channel);
  };
}
