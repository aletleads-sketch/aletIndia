"use client";

import { getSupabase } from "@/lib/supabase-browser";
import { SECTION_FIELDS, type SectionId } from "@/lib/section-fields";
import { BASE_PATH } from "@/lib/site-path";

/** Roles the database lets change website content (private.can_manage_content). */
export const CONTENT_ROLES = new Set(["admin", "editor", "marketing"]);

export type SitePageRow = { path: string; name: string; page_type: string; sort_order: number };
export type SectionRow = {
  page_path: string;
  section_key: string;
  label: string;
  sort_order: number;
  content: { fields?: Record<string, unknown>; data?: Record<string, unknown> } & Record<string, unknown>;
  updated_at: string;
};

export type EditablePage = { path: string; name: string; sections: (SectionRow & { id: SectionId })[] };

const isSectionId = (id: string): id is SectionId => id in SECTION_FIELDS;

/** Every page with the sections an editor can change, in website order. */
export async function loadEditablePages(): Promise<{ pages: EditablePage[]; company: SectionRow | null; error: string | null }> {
  const supabase = getSupabase();
  const [pagesResult, sectionsResult] = await Promise.all([
    supabase.from("site_pages").select("path,name,page_type,sort_order").order("sort_order"),
    supabase.from("page_sections").select("page_path,section_key,label,sort_order,content,updated_at").order("sort_order"),
  ]);
  const error = pagesResult.error?.message ?? sectionsResult.error?.message ?? null;
  const rows = (sectionsResult.data as SectionRow[] | null) ?? [];
  const pages = ((pagesResult.data as SitePageRow[] | null) ?? []).map((page) => ({
    path: page.path,
    name: page.path === "_shared" ? "Used on many pages" : page.name,
    sections: rows
      .filter((row) => row.page_path === page.path && isSectionId(`${row.page_path}#${row.section_key}`))
      .map((row) => ({ ...row, id: `${row.page_path}#${row.section_key}` as SectionId })),
  }));
  const company = rows.find((row) => row.page_path === "_shared" && row.section_key === "company") ?? null;
  return { pages: pages.filter((page) => page.sections.length), company, error };
}

/** Saves one section's fields, keeping anything else stored on the row. */
export async function saveSectionFields(row: SectionRow, fields: Record<string, unknown>) {
  const content = { ...row.content, fields };
  delete (content as Record<string, unknown>).blocks;
  const { data, error } = await getSupabase()
    .from("page_sections")
    .update({ content })
    .eq("page_path", row.page_path)
    .eq("section_key", row.section_key)
    .select("page_path,section_key,label,sort_order,content,updated_at")
    .single();
  return { row: (data as SectionRow | null) ?? null, error: error?.message ?? null };
}

/** Saves the company details (stored as data on the shared "company" section). */
export async function saveCompanyData(row: SectionRow, data: Record<string, unknown>) {
  const { data: saved, error } = await getSupabase()
    .from("page_sections")
    .update({ content: { ...row.content, data } })
    .eq("page_path", "_shared")
    .eq("section_key", "company")
    .select("page_path,section_key,label,sort_order,content,updated_at")
    .single();
  return { row: (saved as SectionRow | null) ?? null, error: error?.message ?? null };
}

/** Tells the website to show saved content now instead of within the hour. */
export async function publishContent(): Promise<string | null> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) return "Saved. Sign in again to publish it to the website now.";
  const response = await fetch(`${BASE_PATH}/api/content/revalidate`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  if (response.ok) return null;
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  return `Saved, but the website could not be refreshed: ${body.error ?? response.statusText}. It updates within the hour.`;
}

/** What the cms-media storage bucket accepts. */
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Uploads a picture to the website's media storage and returns its public link. */
export async function uploadImage(file: File): Promise<{ url: string | null; error: string | null }> {
  if (!IMAGE_TYPES.includes(file.type)) return { url: null, error: "Choose a JPG, PNG, WebP or GIF picture." };
  if (file.size > 6 * 1024 * 1024) return { url: null, error: "Choose a picture smaller than 6 MB." };
  const extension = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `content/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const storage = getSupabase().storage.from("cms-media");
  const { data, error } = await storage.upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (error || !data) return { url: null, error: error?.message ?? "Upload failed." };
  return { url: storage.getPublicUrl(data.path).data.publicUrl, error: null };
}

/** Where to look at a section on the website. */
export function previewPath(pagePath: string) {
  if (pagePath === "_shared") return "/";
  if (pagePath === "/blogs/[slug]") return "/blogs";
  if (pagePath === "/case-studies/[slug]") return "/case-studies/tajika";
  return pagePath;
}
