import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/cms-client";
import { normalizePath } from "@/lib/seo-redirects-shared";

type Rule = { destination: string; status: 301 | 302 };

/** How long redirect rules are reused before they are read again. Admin changes go live within this time. */
const TTL_MS = 60_000;

let rules: Map<string, Rule> | null = null;
let fetchedAt = 0;
let refreshing: Promise<void> | null = null;

async function refresh() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/seo_redirects?select=source,destination,status_code&enabled=eq.true`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` },
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const rows = (await response.json()) as { source: string; destination: string; status_code: 301 | 302 }[];
    rules = new Map(rows.map((row) => [normalizePath(row.source), { destination: row.destination, status: row.status_code }]));
  } catch {
    // Keep the last rules (or none): a Supabase hiccup must never break the website.
    rules ??= new Map();
  } finally {
    fetchedAt = Date.now();
    refreshing = null;
  }
}

/** Rules for this request. After the first load, stale rules are served while fresh ones load in the background. */
async function currentRules() {
  if (!rules) {
    refreshing ??= refresh();
    await refreshing;
  } else if (Date.now() - fetchedAt > TTL_MS) {
    refreshing ??= refresh();
  }
  return rules ?? new Map<string, Rule>();
}

export async function proxy(request: NextRequest) {
  const rule = (await currentRules()).get(normalizePath(request.nextUrl.pathname));
  if (!rule) return NextResponse.next();

  let target: URL;
  if (rule.destination.startsWith("https://")) {
    target = new URL(rule.destination);
  } else {
    target = request.nextUrl.clone();
    const url = new URL(rule.destination, "https://placeholder.local");
    target.pathname = url.pathname;
    target.hash = url.hash;
    if (url.search) target.search = url.search;
  }
  return NextResponse.redirect(target, rule.status);
}

export const config = {
  // Pages only: skip build assets, API routes, the admin and metadata files.
  matcher: ["/((?!_next/|api/|admin(?:/|$)|favicon\\.ico$|icon\\.png$|apple-icon\\.png$|robots\\.txt$|sitemap\\.xml$).*)"],
};
