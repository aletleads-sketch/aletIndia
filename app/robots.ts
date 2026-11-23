import type { MetadataRoute } from "next";
import { NOINDEX, pageUrl } from "@/lib/seo";
import { loadSeoSettings } from "@/lib/seo-settings";
import { cleanDisallow, ROBOTS_BUILT_IN_DISALLOW } from "@/lib/seo-sitemap-shared";

// Rebuilt when an admin saves SEO changes (cache tag "seo"), and at least hourly.
export const revalidate = 3600;

// Design samples are not blocked here: they carry noindex, which crawlers must be able to read.
// Crawlers only read robots.txt at a domain's root, so the server must route /robots.txt to this app.
export default async function robots(): Promise<MetadataRoute.Robots> {
  if (NOINDEX) return { rules: { userAgent: "*", disallow: "/" } };
  const { robots: settings } = await loadSeoSettings();
  return {
    rules: { userAgent: "*", allow: "/", disallow: [...ROBOTS_BUILT_IN_DISALLOW, ...cleanDisallow(settings.disallow)] },
    sitemap: pageUrl("/sitemap.xml"),
  };
}
