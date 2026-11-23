"use client";

import { getSupabase } from "@/lib/supabase-browser";
import { BASE_PATH } from "@/lib/site-path";

/** Data for the Content Studio dashboard and media library. */

export const CONTENT_TABLES: Record<string, { type: string; tone: string }> = {
  page_sections: { type: "Page", tone: "bg-[#eaf1ff] text-[#1a4fb8]" },
  site_pages: { type: "Page", tone: "bg-[#eaf1ff] text-[#1a4fb8]" },
  services: { type: "Service", tone: "bg-[#efe9ff] text-[#5b3cc4]" },
  projects: { type: "Portfolio", tone: "bg-[#e3f6f4] text-[#0f766e]" },
  case_studies: { type: "Case study", tone: "bg-[#e3f6f4] text-[#0f766e]" },
  blogs: { type: "Blog", tone: "bg-[#fff1e6] text-[#b4530f]" },
  faqs: { type: "FAQ", tone: "bg-[#fdeef4] text-[#b0285d]" },
  testimonials: { type: "Testimonial", tone: "bg-[#fdeef4] text-[#b0285d]" },
  client_logos: { type: "Client logo", tone: "bg-[#eef1f6] text-[#475569]" },
  industries: { type: "Industry", tone: "bg-[#eef1f6] text-[#475569]" },
  careers: { type: "Career", tone: "bg-[#e6f6ec] text-[#1c7a3e]" },
  menu_items: { type: "Menu", tone: "bg-[#eef1f6] text-[#475569]" },
};

/** Where a changed item is edited in the admin. */
export function editHref(table: string, rowId: string | null) {
  if (table === "page_sections" && rowId?.includes("#")) {
    const [page, section] = rowId.split("#");
    // Blocks of a page made with Add Page.
    if (section.startsWith("b-")) return `/admin/pages/edit?path=${encodeURIComponent(page)}`;
    return page === "_shared" && section === "company" ? "/admin/settings" : `/admin/website?page=${encodeURIComponent(page)}&section=${encodeURIComponent(section)}`;
  }
  if (table === "site_pages") return "/admin/pages";
  return `/admin/lists/${table}${rowId ? `?id=${rowId}` : ""}`;
}

export type Activity = { id: number; table_name: string; row_id: string | null; title: string | null; action: string; status: string | null; actor: string | null; at: string };

export async function loadActivity(since: Date) {
  const { data, error } = await getSupabase()
    .from("content_activity")
    .select("id,table_name,row_id,title,action,status,actor,at")
    .gte("at", since.toISOString())
    .order("at", { ascending: false })
    .limit(1000);
  return { activity: (data as Activity[] | null) ?? [], error: error?.message ?? null };
}

/** Rows per status in each list table. */
export async function loadStatusCounts(tables: string[]) {
  const supabase = getSupabase();
  const results = await Promise.all(
    tables.map(async (table) => {
      const column = table === "menu_items" ? "visible" : "status";
      const { data } = await supabase.from(table).select(column);
      const counts: Record<string, number> = {};
      for (const row of (data as Record<string, unknown>[] | null) ?? []) {
        const value = table === "menu_items" ? (row.visible ? "published" : "draft") : String(row.status ?? "published");
        counts[value] = (counts[value] ?? 0) + 1;
      }
      return [table, counts] as const;
    }),
  );
  return Object.fromEntries(results) as Record<string, Record<string, number>>;
}

/**
 * A file in the Media Library. `url` is what a form stores: a full link for uploads,
 * a site path ("/images/…") for the pictures that came with the website (`source: "website"`).
 */
export type MediaFile = { name: string; path: string; url: string; size: number; type: string; created: string; source: "upload" | "website" };

const BUCKET = "cms-media";
const FOLDERS = ["content", ""];

/** Every file in the website's media storage, newest first. */
export async function listMedia(): Promise<{ files: MediaFile[]; error: string | null }> {
  const storage = getSupabase().storage.from(BUCKET);
  const files: MediaFile[] = [];
  for (const folder of FOLDERS) {
    const { data, error } = await storage.list(folder, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
    if (error) return { files, error: error.message };
    for (const item of data ?? []) {
      if (!item.id) continue; // a folder
      const path = folder ? `${folder}/${item.name}` : item.name;
      const meta = (item.metadata ?? {}) as { size?: number; mimetype?: string };
      files.push({ name: item.name, path, url: storage.getPublicUrl(path).data.publicUrl, size: meta.size ?? 0, type: meta.mimetype ?? "", created: item.created_at ?? "", source: "upload" });
    }
  }
  files.sort((a, b) => b.created.localeCompare(a.created));
  // Then the pictures that came with the website (they cannot be deleted from here).
  try {
    const response = await fetch(`${BASE_PATH}/api/content/site-images`);
    const body = (await response.json()) as { files: Omit<MediaFile, "url" | "source">[] };
    for (const file of body.files) files.push({ ...file, url: file.path, source: "website" });
  } catch {
    // The uploads still show; the website's own pictures are a bonus.
  }
  return { files, error: null };
}

export async function deleteMedia(path: string) {
  const { error } = await getSupabase().storage.from(BUCKET).remove([path]);
  return error?.message ?? null;
}

export const formatSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

const PAGE_NAMES: Record<string, string> = { "/": "Homepage", _shared: "Shared on many pages" };

/** The grey line under a change's title, e.g. "Homepage section" or "Job opening, requirements & apply". */
export function describeActivity(item: Activity) {
  if (item.table_name === "page_sections") {
    const page = item.row_id?.split("#")[0] ?? "";
    return `${PAGE_NAMES[page] ?? page.replace(/^\//, "").replace(/-/g, " ")} section`.replace(/^./, (c) => c.toUpperCase());
  }
  return (
    {
      site_pages: "Website page",
      services: "Service page (content & SEO)",
      projects: "Portfolio project",
      case_studies: "Case study page",
      blogs: "Blog article",
      faqs: "Question and answer",
      testimonials: "Client review",
      client_logos: "Client logo",
      industries: "Industry we serve",
      careers: "Job opening, requirements & apply",
      menu_items: "Website menu link",
    }[item.table_name] ?? "Content"
  );
}
