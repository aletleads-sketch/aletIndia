import type { MetadataRoute } from "next";
import { pageUrl } from "@/lib/seo";
import { loadOverrides } from "@/lib/seo-overrides";
import { loadSeoSettings } from "@/lib/seo-settings";
import { applySitemapChoice } from "@/lib/seo-sitemap-shared";
import { sitePages } from "@/lib/site-pages";

// Rebuilt when an admin saves SEO changes (cache tag "seo"), and at least hourly.
export const revalidate = 3600;

// Public pages only, minus what the admin left out and pages marked "hide from Google" in Meta Tags.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, overrides] = await Promise.all([loadSeoSettings(), loadOverrides()]);
  const choices = settings.sitemap.pages ?? {};
  const now = new Date();

  return sitePages().flatMap((page) => {
    const entry = applySitemapChoice(page, choices[page.path], Boolean(overrides.get(page.path)?.noindex));
    if (!entry) return [];
    return [
      {
        url: pageUrl(entry.path),
        lastModified: entry.lastModified ? new Date(`${entry.lastModified}T12:00:00Z`) : now,
        changeFrequency: entry.changeFrequency,
        priority: entry.priority,
      },
    ];
  });
}
