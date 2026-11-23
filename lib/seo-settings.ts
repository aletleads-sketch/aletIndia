import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/cms-client";
import { SEO_CACHE_TAG } from "@/lib/seo-cache";
import type { AnalyticsSettings } from "@/lib/analytics-shared";
import type { GeneralSeoSettings } from "@/lib/seo-general-shared";
import type { RobotsSettings, SitemapSettings } from "@/lib/seo-sitemap-shared";

type SeoSettings = { sitemap: SitemapSettings; robots: RobotsSettings; general: GeneralSeoSettings; analytics: AnalyticsSettings };

/**
 * Site-wide SEO settings from the admin, cached with the other SEO data.
 * Missing rows (or Supabase being unreachable) keep the built-in behaviour.
 */
export async function loadSeoSettings(): Promise<SeoSettings> {
  const settings: SeoSettings = { sitemap: {}, robots: {}, general: {}, analytics: {} };
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/seo_settings?select=key,value`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` },
      next: { revalidate: 3600, tags: [SEO_CACHE_TAG] },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return settings;
    for (const row of (await response.json()) as { key: string; value: Record<string, unknown> }[]) {
      if (row.key === "sitemap") settings.sitemap = row.value as SitemapSettings;
      if (row.key === "robots") settings.robots = row.value as RobotsSettings;
      if (row.key === "general") settings.general = row.value as GeneralSeoSettings;
      if (row.key === "analytics") settings.analytics = row.value as AnalyticsSettings;
    }
  } catch {
    // Keep the built-in behaviour.
  }
  return settings;
}
