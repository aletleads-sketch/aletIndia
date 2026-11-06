"use client";

import { blankBlock, CUSTOM_PAGE_TYPE, type BlockKind } from "@/lib/custom-pages";
import { getSupabase } from "@/lib/supabase-browser";

/** Admin reads and writes for pages made in the admin (see lib/custom-pages.ts). */

export type CustomPageInfo = { path: string; name: string; status: string; updated_at: string };
export type EditableBlock = { key: string; kind: BlockKind; hidden: boolean; fields: Record<string, unknown> };

const newKey = () => `b-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const newBlock = (kind: BlockKind, pageName?: string): EditableBlock => ({ key: newKey(), kind, hidden: false, fields: blankBlock(kind, pageName) as Record<string, unknown> });

export async function listCustomPages() {
  const { data, error } = await getSupabase().from("site_pages").select("path,name,status,updated_at").eq("page_type", CUSTOM_PAGE_TYPE).order("sort_order");
  return { pages: (data as CustomPageInfo[] | null) ?? [], error: error?.message ?? null };
}

/** Makes a draft page at /slug with a hero, a text block and the contact form. */
export async function createCustomPage(name: string, slug: string) {
  const supabase = getSupabase();
  const path = `/${slug}`;
  const { data: taken } = await supabase.from("site_pages").select("path").eq("path", path).maybeSingle();
  if (taken) return "A page with this address already exists.";
  const { error } = await supabase.from("site_pages").insert({ path, name, page_type: CUSTOM_PAGE_TYPE, status: "draft", sort_order: 900 });
  if (error) return error.message;
  const blocks = [newBlock("hero", name), newBlock("text"), newBlock("contact")];
  return saveBlocks(path, blocks);
}

export async function loadCustomPageForEdit(path: string) {
  const supabase = getSupabase();
  const [page, rows] = await Promise.all([
    supabase.from("site_pages").select("path,name,status,updated_at").eq("path", path).eq("page_type", CUSTOM_PAGE_TYPE).maybeSingle(),
    supabase.from("page_sections").select("section_key,hidden,sort_order,content").eq("page_path", path).order("sort_order"),
  ]);
  const blocks = ((rows.data as { section_key: string; hidden: boolean; content: { kind?: BlockKind; fields?: Record<string, unknown> } }[] | null) ?? [])
    .filter((row) => row.content?.kind)
    .map((row) => ({ key: row.section_key, kind: row.content.kind as BlockKind, hidden: row.hidden, fields: row.content.fields ?? {} }));
  return { page: (page.data as CustomPageInfo | null) ?? null, blocks, error: page.error?.message ?? rows.error?.message ?? null };
}

/** Writes the blocks in the order given and removes blocks that were taken out. */
export async function saveBlocks(path: string, blocks: EditableBlock[]) {
  const supabase = getSupabase();
  const rows = blocks.map((block, index) => ({
    page_path: path,
    section_key: block.key,
    label: blockTitle(block),
    sort_order: (index + 1) * 10,
    hidden: block.hidden,
    status: "published",
    collections: [],
    content: { kind: block.kind, fields: block.fields },
  }));
  if (rows.length) {
    const { error } = await supabase.from("page_sections").upsert(rows, { onConflict: "page_path,section_key" });
    if (error) return error.message;
  }
  const keep = blocks.map((block) => block.key);
  const { data: existing } = await supabase.from("page_sections").select("section_key").eq("page_path", path);
  const gone = ((existing as { section_key: string }[] | null) ?? []).map((row) => row.section_key).filter((key) => !keep.includes(key));
  if (gone.length) {
    const { error } = await supabase.from("page_sections").delete().eq("page_path", path).in("section_key", gone);
    if (error) return error.message;
  }
  return null;
}

export async function saveCustomPageInfo(path: string, values: { name: string; status: string }) {
  const { error } = await getSupabase().from("site_pages").update(values).eq("path", path);
  return error?.message ?? null;
}

export async function deleteCustomPage(path: string) {
  const supabase = getSupabase();
  const sections = await supabase.from("page_sections").delete().eq("page_path", path);
  if (sections.error) return sections.error.message;
  const { error } = await supabase.from("site_pages").delete().eq("path", path).eq("page_type", CUSTOM_PAGE_TYPE);
  return error?.message ?? null;
}

/** The name of a block in the admin list: its kind and, when it has one, its heading. */
export function blockTitle(block: EditableBlock) {
  const heading = String(block.fields.heading ?? block.fields.title ?? "").trim();
  const label = { hero: "Hero Banner", text: "Text", image_text: "Picture and Text", cards: "Cards", cta: "Call to Action", contact: "Contact Form" }[block.kind];
  return heading ? `${label}: ${heading}` : label;
}
