"use client";

import { SITE_URL } from "@/lib/seo";
import { mapLimit, SEO_LIMITS, siteHref } from "@/lib/seo-admin";
import type { SitePage } from "@/lib/seo-sitemap-shared";
import { BASE_PATH } from "@/lib/site-path";

export type Severity = "critical" | "warning" | "notice";

export const AUDIT_CHECKS = {
  page_error: { label: "Page does not open", severity: "critical", fix: "The page returns an error. Check the address or add a redirect." },
  broken_link: { label: "Broken links", severity: "critical", fix: "Links on the page lead to a missing page. Fix the link or add a redirect." },
  title_missing: { label: "Missing title", severity: "critical", fix: "Add a title in Meta Tags." },
  description_missing: { label: "Missing meta description", severity: "warning", fix: "Add a description in Meta Tags." },
  title_length: { label: "Title too short or too long", severity: "warning", fix: `Aim for ${SEO_LIMITS.title.min}–${SEO_LIMITS.title.max} characters in Meta Tags.` },
  description_length: { label: "Description too short or too long", severity: "warning", fix: `Aim for ${SEO_LIMITS.description.min}–${SEO_LIMITS.description.max} characters in Meta Tags.` },
  duplicate_title: { label: "Same title as another page", severity: "warning", fix: "Give each page its own title in Meta Tags." },
  duplicate_description: { label: "Same description as another page", severity: "warning", fix: "Give each page its own description in Meta Tags." },
  h1_missing: { label: "No main heading (H1)", severity: "warning", fix: "Each page needs one main heading. Developer fix." },
  h1_multiple: { label: "More than one main heading (H1)", severity: "notice", fix: "Keep one main heading per page. Developer fix." },
  image_alt: { label: "Images without alt text", severity: "warning", fix: "Describe each image for Google and screen readers. Developer fix." },
  canonical: { label: "Canonical points to another page", severity: "warning", fix: "The page tells Google another address is the main one. Developer fix." },
  noindex: { label: "Hidden from Google", severity: "notice", fix: "Marked \"Hide from Google\" in Meta Tags. Switch it off if the page should rank." },
  og_image: { label: "No share image", severity: "notice", fix: "Add a share image in Meta Tags so links look good on WhatsApp and LinkedIn." },
  thin_content: { label: "Little text on the page", severity: "notice", fix: "Pages with under 250 words rarely rank well. Add useful content." },
} as const satisfies Record<string, { label: string; severity: Severity; fix: string }>;

export type CheckId = keyof typeof AUDIT_CHECKS;
export type AuditIssue = { check: CheckId; path: string; detail: string };
export type AuditResult = { score: number; pages: number; critical: number; warnings: number; notices: number; issues: AuditIssue[] };

type PageFacts = {
  path: string;
  status: number;
  title: string;
  description: string;
  h1: number;
  imagesWithoutAlt: string[];
  canonicalPath: string | null;
  noindex: boolean;
  ogImage: boolean;
  words: number;
  links: string[];
};

const PENALTY: Record<Severity, number> = { critical: 25, warning: 8, notice: 2 };

/** A link on a page as a site path ("/contact-us"), or null when it points elsewhere (mailto:, other sites, #anchors). */
function linkPath(href: string): string | null {
  if (!href || href.startsWith("#") || /^(mailto|tel|javascript|whatsapp):/i.test(href)) return null;
  try {
    const url = new URL(href, window.location.origin);
    const site = new URL(SITE_URL);
    const sameHost = url.origin === window.location.origin || url.hostname.replace(/^www\./, "") === site.hostname.replace(/^www\./, "");
    if (!sameHost) return null;
    let path = url.pathname;
    if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) path = path.slice(BASE_PATH.length) || "/";
    if (/^\/(_next|api|admin)(\/|$)/.test(path)) return null;
    return path.length > 1 ? path.replace(/\/+$/, "") : path;
  } catch {
    return null;
  }
}

async function readPage(path: string): Promise<PageFacts> {
  const facts: PageFacts = { path, status: 0, title: "", description: "", h1: 0, imagesWithoutAlt: [], canonicalPath: null, noindex: false, ogImage: false, words: 0, links: [] };
  try {
    const response = await fetch(siteHref(path), { cache: "no-store" });
    facts.status = response.status;
    if (!response.ok) return facts;
    const doc = new DOMParser().parseFromString(await response.text(), "text/html");
    const meta = (selector: string) => doc.querySelector(selector)?.getAttribute("content")?.trim() ?? "";
    facts.title = doc.querySelector("title")?.textContent?.trim() ?? "";
    facts.description = meta('meta[name="description"]');
    facts.h1 = doc.querySelectorAll("h1").length;
    facts.imagesWithoutAlt = [...doc.querySelectorAll("img:not([alt])")].map((img) => img.getAttribute("src") ?? "image");
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href");
    facts.canonicalPath = canonical ? linkPath(canonical) : null;
    facts.noindex = /noindex/i.test(meta('meta[name="robots"]'));
    facts.ogImage = Boolean(meta('meta[property="og:image"]'));
    const main = doc.querySelector("main") ?? doc.body;
    main?.querySelectorAll("script,style,noscript,nav,header,footer").forEach((node) => node.remove());
    facts.words = (main?.textContent ?? "").split(/\s+/).filter((word) => /\w/.test(word)).length;
    facts.links = [...new Set([...doc.querySelectorAll("a[href]")].map((a) => linkPath(a.getAttribute("href") ?? "")).filter((link): link is string => Boolean(link)))];
  } catch {
    facts.status = facts.status || 0;
  }
  return facts;
}

/** Whether a site path opens (following redirects). Assets get a HEAD request; pages a normal GET. */
async function opens(path: string) {
  try {
    const response = await fetch(siteHref(path), { method: /\.[a-z0-9]{2,5}$/i.test(path) ? "HEAD" : "GET", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Reads every page the way Google does and lists what to fix.
 * `onProgress` reports (done, total, stage) so the screen can show where it is.
 */
export async function runAudit(pages: SitePage[], onProgress: (done: number, total: number, stage: "pages" | "links") => void): Promise<AuditResult> {
  let done = 0;
  const facts = await mapLimit(pages, 4, async (page) => {
    const result = await readPage(page.path);
    onProgress(++done, pages.length, "pages");
    return result;
  });

  const known = new Map(facts.map((page) => [page.path, page.status >= 200 && page.status < 400]));
  const toCheck = [...new Set(facts.flatMap((page) => page.links))].filter((link) => !known.has(link));
  done = 0;
  const linkOk = new Map(known);
  await mapLimit(toCheck, 4, async (link) => {
    linkOk.set(link, await opens(link));
    onProgress(++done, toCheck.length, "links");
  });

  const issues: AuditIssue[] = [];
  const add = (check: CheckId, path: string, detail: string) => issues.push({ check, path, detail });
  const byTitle = new Map<string, string[]>();
  const byDescription = new Map<string, string[]>();

  for (const page of facts) {
    if (page.status < 200 || page.status >= 400) {
      add("page_error", page.path, page.status ? `Returns error ${page.status}.` : "Could not be loaded.");
      continue;
    }
    const broken = page.links.filter((link) => linkOk.get(link) === false);
    if (broken.length) add("broken_link", page.path, `Links to ${broken.join(", ")}`);

    const t = page.title.length;
    if (!t) add("title_missing", page.path, "The page has no title.");
    else if (t < SEO_LIMITS.title.min || t > SEO_LIMITS.title.max) add("title_length", page.path, `${t} characters: "${page.title}"`);
    if (t) byTitle.set(page.title.toLowerCase(), [...(byTitle.get(page.title.toLowerCase()) ?? []), page.path]);

    const d = page.description.length;
    if (!d) add("description_missing", page.path, "The page has no meta description.");
    else if (d < SEO_LIMITS.description.min || d > SEO_LIMITS.description.max) add("description_length", page.path, `${d} characters`);
    if (d) byDescription.set(page.description.toLowerCase(), [...(byDescription.get(page.description.toLowerCase()) ?? []), page.path]);

    if (!page.h1) add("h1_missing", page.path, "No H1 heading found.");
    else if (page.h1 > 1) add("h1_multiple", page.path, `${page.h1} H1 headings.`);
    if (page.imagesWithoutAlt.length) add("image_alt", page.path, `${page.imagesWithoutAlt.length} image${page.imagesWithoutAlt.length === 1 ? "" : "s"} without alt text.`);
    if (page.canonicalPath && page.canonicalPath !== page.path) add("canonical", page.path, `Canonical is ${page.canonicalPath}`);
    if (page.noindex) add("noindex", page.path, "The page asks Google not to show it.");
    if (!page.ogImage) add("og_image", page.path, "No og:image set.");
    if (page.words < 250) add("thin_content", page.path, `About ${page.words} words.`);
  }
  for (const paths of byTitle.values()) if (paths.length > 1) for (const path of paths) add("duplicate_title", path, `Also used by ${paths.filter((p) => p !== path).join(", ")}`);
  for (const paths of byDescription.values()) if (paths.length > 1) for (const path of paths) add("duplicate_description", path, `Also used by ${paths.filter((p) => p !== path).join(", ")}`);

  const pagePenalty = new Map<string, number>();
  for (const issue of issues) pagePenalty.set(issue.path, (pagePenalty.get(issue.path) ?? 0) + PENALTY[AUDIT_CHECKS[issue.check].severity]);
  const score = facts.length ? Math.round(facts.reduce((sum, page) => sum + Math.max(0, 100 - (pagePenalty.get(page.path) ?? 0)), 0) / facts.length) : 0;
  const count = (severity: Severity) => issues.filter((issue) => AUDIT_CHECKS[issue.check].severity === severity).length;

  return { score, pages: facts.length, critical: count("critical"), warnings: count("warning"), notices: count("notice"), issues };
}
