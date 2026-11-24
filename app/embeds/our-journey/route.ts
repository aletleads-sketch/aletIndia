import { readFile } from "node:fs/promises";
import path from "node:path";
import { applyHtmlTexts } from "@/lib/html-texts";
import { loadFields } from "@/lib/site-content";
import { assetPath } from "@/lib/site-path";

const DESIGN_FILE = "alet-india-our-journey.html";

/**
 * Reads the design from the deployment's own files. Fetching it over HTTP from the
 * site's public domain failed on aletindia.com (the request goes back out through
 * Cloudflare), which left the section blank; the fetch is kept only as a fallback.
 */
async function loadDesign(request: Request) {
  try {
    return await readFile(path.join(process.cwd(), "public", DESIGN_FILE), "utf8");
  } catch {
    // Not bundled with this deployment: fall back to fetching the public file.
  }
  try {
    const source = await fetch(new URL(`${assetPath(`/${DESIGN_FILE}`)}?v=7`, request.url), { next: { revalidate: 3600 } });
    return source.ok ? await source.text() : null;
  } catch {
    return null;
  }
}

/**
 * The "Our Journey" story shown in an iframe on About Us. The design lives in
 * public/alet-india-our-journey.html; its words come from the database
 * (page section /about-us#story_journey) when an admin has changed them.
 */
export async function GET(request: Request) {
  const design = await loadDesign(request);
  if (!design) return new Response("Not found", { status: 404 });
  const { texts } = await loadFields("/about-us#story_journey");
  // Relative image paths in the design stay relative to the site root, not to /embeds/.
  const html = applyHtmlTexts(design, texts).replace(/<head([^>]*)>/i, `<head$1><base href="${assetPath("/")}">`);
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
