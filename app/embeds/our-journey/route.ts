import { applyHtmlTexts } from "@/lib/html-texts";
import { loadFields } from "@/lib/site-content";
import { assetPath } from "@/lib/site-path";

/**
 * The "Our Journey" story shown in an iframe on About Us. The design lives in
 * public/alet-india-our-journey.html; its words come from the database
 * (page section /about-us#story_journey) when an admin has changed them.
 */
export async function GET(request: Request) {
  const source = await fetch(new URL(`${assetPath("/alet-india-our-journey.html")}?v=7`, request.url), {
    next: { revalidate: 3600 },
  });
  if (!source.ok) return new Response("Not found", { status: 404 });
  const { texts } = await loadFields("/about-us#story_journey");
  // Relative image paths in the design stay relative to the site root, not to /embeds/.
  const html = applyHtmlTexts(await source.text(), texts).replace(/<head([^>]*)>/i, `<head$1><base href="${assetPath("/")}">`);
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
