"use client";

import { getSupabase } from "@/lib/supabase-browser";
import type { SeoOverride } from "@/lib/seo-overrides";
import type { SitePage } from "@/lib/seo-sitemap-shared";
import { SITE_URL } from "@/lib/seo";
import { BASE_PATH } from "@/lib/site-path";

/** SEO screens in the sidebar, in mockup order. `href: null` shows as "Soon" until that screen is built. */
export const SEO_NAV = [
  { label: "SEO Dashboard", href: null },
  { label: "Meta Tags", href: "/admin/seo/meta-tags" },
  { label: "Keywords Tracking", href: null },
  { label: "Sitemap & Robots", href: "/admin/seo/sitemap" },
  { label: "Redirects", href: "/admin/seo/redirects" },
  { label: "Schema Markup", href: "/admin/seo/schema" },
  { label: "SEO Audit", href: "/admin/seo/audit" },
  { label: "Reports", href: null },
  { label: "SEO Settings", href: "/admin/seo/settings" },
] as const;

export const SEO_LIMITS = {
  title: { min: 30, max: 60, hard: 120 },
  description: { min: 70, max: 160, hard: 320 },
};

export type PageKind = "Page" | "Service" | "Case study" | "Blog";

export type PageMeta = {
  path: string;
  kind: PageKind;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
};

export type { SeoOverride };

const SERVICE_PATHS = new Set([
  "/mobile-app-development",
  "/cross-functional-application",
  "/web-application",
  "/graphic-design",
  "/ux-ui-design",
  "/digital-marketing",
  "/ai-data-solutions",
  "/salesforce-solutions",
  "/game-development",
]);

function kindOf(path: string): PageKind {
  if (path.startsWith("/blogs/")) return "Blog";
  if (path.startsWith("/case-studies/")) return "Case study";
  if (SERVICE_PATHS.has(path)) return "Service";
  return "Page";
}

/** The browser URL for a site path (the admin runs on the same origin as the site). */
export function siteHref(path: string) {
  return `${BASE_PATH}${path === "/" ? "" : path}` || "/";
}

/** Every public page with its built-in sitemap values, including pages the admin left out of the sitemap. */
export async function loadSitePages(): Promise<SitePage[]> {
  const response = await fetch(`${BASE_PATH}/api/seo/pages`, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not read the list of pages.");
  return (await response.json()) as SitePage[];
}

export async function loadSitemapPaths(): Promise<string[]> {
  return (await loadSitePages()).map((page) => page.path);
}

/** Loads one row of `public.seo_settings` ({} when nobody has saved it yet). */
export async function loadSeoSetting<T>(key: "sitemap" | "robots" | "general") {
  const { data, error } = await getSupabase().from("seo_settings").select("value").eq("key", key).maybeSingle();
  return { value: ((data as { value: T } | null)?.value ?? {}) as T, error: error?.message ?? null };
}

export async function saveSeoSetting(key: "sitemap" | "robots" | "general", value: object) {
  const { error } = await getSupabase().from("seo_settings").upsert({ key, value });
  return error?.message ?? null;
}

/** The public URL of a site file such as sitemap.xml, as Google sees it. */
export const publicUrl = (path: string) => `${SITE_URL.replace(/\/$/, "")}${path}`;

/** What a page currently tells Google, read from the page itself. */
export async function loadPageMeta(path: string): Promise<PageMeta> {
  const empty: PageMeta = { path, kind: kindOf(path), title: "", description: "", ogTitle: "", ogDescription: "", ogImage: "" };
  try {
    const response = await fetch(siteHref(path), { cache: "no-store" });
    if (!response.ok) return empty;
    const doc = new DOMParser().parseFromString(await response.text(), "text/html");
    const meta = (selector: string) => doc.querySelector(selector)?.getAttribute("content")?.trim() ?? "";
    return {
      ...empty,
      title: doc.querySelector("title")?.textContent?.trim() ?? "",
      description: meta('meta[name="description"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogDescription: meta('meta[property="og:description"]'),
      ogImage: meta('meta[property="og:image"]'),
    };
  } catch {
    return empty;
  }
}

export async function loadOverrides() {
  const { data, error } = await getSupabase()
    .from("seo_pages")
    .select("path,title,description,og_title,og_description,og_image,noindex");
  return { rows: (data as SeoOverride[] | null) ?? [], error: error?.message ?? null };
}

/** Runs `task` over `items` with at most `limit` running at once. */
export async function mapLimit<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export type MetaIssue = string;

/** Plain-language problems with a page's title and description; none means "Optimized". */
export function metaIssues(title: string, description: string): MetaIssue[] {
  const issues: MetaIssue[] = [];
  const t = title.trim().length;
  const d = description.trim().length;
  if (!t) issues.push("Title is missing");
  else if (t < SEO_LIMITS.title.min) issues.push(`Title is short (${t} characters, aim for ${SEO_LIMITS.title.min}–${SEO_LIMITS.title.max})`);
  else if (t > SEO_LIMITS.title.max) issues.push(`Title is long (${t} characters; Google cuts it after about ${SEO_LIMITS.title.max})`);
  if (!d) issues.push("Description is missing");
  else if (d < SEO_LIMITS.description.min) issues.push(`Description is short (${d} characters, aim for ${SEO_LIMITS.description.min}–${SEO_LIMITS.description.max})`);
  else if (d > SEO_LIMITS.description.max) issues.push(`Description is long (${d} characters; Google cuts it after about ${SEO_LIMITS.description.max})`);
  return issues;
}

/** Asks the site to drop its cached SEO data so saved changes show on the next page visit. */
export async function publishSeoChanges() {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) return "Your session has expired. Sign in again.";
  try {
    const response = await fetch(`${BASE_PATH}/api/seo/revalidate`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) return null;
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    return body.error ?? "Saved, but the website could not be refreshed. It will update within an hour.";
  } catch {
    return "Saved, but the website could not be refreshed. It will update within an hour.";
  }
}
