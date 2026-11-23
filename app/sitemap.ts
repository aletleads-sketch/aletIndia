import type { MetadataRoute } from "next";
import { pageUrl } from "@/lib/seo";
import { loadOverrides } from "@/lib/seo-overrides";
import { loadSeoSettings } from "@/lib/seo-settings";
import { applySitemapChoice } from "@/lib/seo-sitemap-shared";
import { loadCustomPagePaths, loadSiteContent } from "@/lib/site-content";
import { sitePages } from "@/lib/site-pages";

// Rebuilt when an admin saves SEO changes (cache tag "seo"), and at least hourly.
export const revalidate = 3600;

// Public pages only, minus what the admin left out and pages marked "hide from Google" in Meta Tags.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, overrides, custom, { services }] = await Promise.all([loadSeoSettings(), loadOverrides(), loadCustomPagePaths(), loadSiteContent()]);
  const choices = settings.sitemap.pages ?? {};
  const now = new Date();

  // Pages made in the admin (Pages → Add Page), unless marked "hide from Google".
  const made: MetadataRoute.Sitemap = custom
    .filter((page) => !overrides.get(page.path)?.noindex)
    .map((page) => ({ url: pageUrl(page.path), lastModified: new Date(page.updated_at), changeFrequency: "monthly", priority: 0.6 }));

  // Services added in the admin (the built-in ones are already in sitePages).
  const known = new Set([...sitePages().map((page) => page.path), ...custom.map((page) => page.path)]);
  const addedServices: MetadataRoute.Sitemap = services
    .map((service) => `/${service.slug}`)
    .filter((path) => !known.has(path) && !overrides.get(path)?.noindex)
    .map((path) => ({ url: pageUrl(path), lastModified: now, changeFrequency: "monthly", priority: 0.7 }));

  return [...made, ...addedServices, ...sitePages().flatMap((page) => {
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
  })];
}
