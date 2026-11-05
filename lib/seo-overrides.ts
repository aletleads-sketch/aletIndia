import type { Metadata } from "next";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/cms-client";
import { pageUrl } from "@/lib/seo";
import { SEO_CACHE_TAG } from "@/lib/seo-cache";
import { resolveGeneral } from "@/lib/seo-general-shared";
import { loadSeoSettings } from "@/lib/seo-settings";

/** A row of `public.seo_pages`: what an admin changed for one page. Empty fields keep the page's own value. */
export type SeoOverride = {
  path: string;
  title: string | null;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  noindex: boolean;
};

export { SEO_CACHE_TAG };

const COLUMNS = "path,title,description,og_title,og_description,og_image,noindex";

/**
 * All overrides in one request, cached for an hour and shared by every page.
 * Any failure (no network at build time, Supabase down) returns no overrides,
 * so pages fall back to their built-in metadata instead of breaking.
 */
export async function loadOverrides(): Promise<Map<string, SeoOverride>> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/seo_pages?select=${COLUMNS}`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` },
      next: { revalidate: 3600, tags: [SEO_CACHE_TAG] },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return new Map();
    const rows = (await response.json()) as SeoOverride[];
    return new Map(rows.map((row) => [row.path, row]));
  } catch {
    return new Map();
  }
}

const filled = (value: string | null | undefined) => (value && value.trim() ? value.trim() : undefined);

/** Absolute URL for a share image given as a site path or https:// link. */
export const shareImageUrl = (value: string) => (value.startsWith("/") ? pageUrl(value) : value);

/**
 * A page that sets its own Open Graph data replaces the site-wide one from the layout,
 * so give it the default share image and site name when it has none of its own.
 */
async function withShareDefaults(metadata: Metadata): Promise<Metadata> {
  const og = metadata.openGraph;
  if (!og || (og.images && og.siteName)) return metadata;
  const general = resolveGeneral((await loadSeoSettings()).general);
  return {
    ...metadata,
    openGraph: {
      ...og,
      siteName: og.siteName ?? general.siteName,
      images: og.images ?? [{ url: shareImageUrl(general.defaultShareImage) }],
    },
  };
}

/** Applies the admin's override for `path` on top of the page's own metadata. */
export async function withSeoOverrides(path: string, base: Metadata): Promise<Metadata> {
  const override = (await loadOverrides()).get(path);
  if (!override) return withShareDefaults(base);

  const title = filled(override.title);
  const description = filled(override.description);
  const ogTitle = filled(override.og_title);
  const ogDescription = filled(override.og_description);
  const ogImage = filled(override.og_image);

  const metadata: Metadata = { ...base };
  if (title) metadata.title = { absolute: title };
  if (description) metadata.description = description;
  if (ogTitle || ogDescription || ogImage) {
    metadata.openGraph = {
      ...base.openGraph,
      ...(ogTitle ? { title: ogTitle } : {}),
      ...(ogDescription ? { description: ogDescription } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    };
  }
  if (override.noindex) metadata.robots = { index: false, follow: true };
  return withShareDefaults(metadata);
}
