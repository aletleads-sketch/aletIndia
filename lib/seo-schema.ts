import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/cms-client";
import { SEO_CACHE_TAG } from "@/lib/seo-overrides";
import { defaultSchemaSettings, SCHEMA_TYPES, type SchemaRow, type SchemaSettings } from "@/lib/seo-schema-shared";

/**
 * Structured data switches from the admin, cached with the other SEO data.
 * Missing rows (or Supabase being unreachable at build time) keep the built-in defaults.
 */
export async function loadSchemaSettings(): Promise<SchemaSettings> {
  const settings = defaultSchemaSettings();
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/seo_schema?select=type,enabled,data`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` },
      next: { revalidate: 3600, tags: [SEO_CACHE_TAG] },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return settings;
    for (const row of (await response.json()) as SchemaRow[]) {
      if ((SCHEMA_TYPES as readonly string[]).includes(row.type)) settings[row.type] = row;
    }
  } catch {
    // Keep defaults.
  }
  return settings;
}
