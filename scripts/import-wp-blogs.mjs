/**
 * Fetch WordPress posts and write lib/blogs-data.ts + public/images/blogs/*
 * Usage: npm run import:blogs
 */
import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WP_API = "https://aletindia.com/wp-json/wp/v2/posts?per_page=100&_embed=1";
const OUT_DATA = path.join(ROOT, "lib", "blogs-data.ts");
const IMAGES_DIR = path.join(ROOT, "public", "images", "blogs");

const ENTITY_MAP = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#039;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&#8217;": "'",
  "&#8216;": "'",
  "&#8211;": "–",
  "&#8212;": "—",
  "&#8220;": "“",
  "&#8221;": "”",
  "&#8230;": "…",
  "&hellip;": "…",
};

function decodeEntities(input = "") {
  let text = String(input);
  text = text.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
  text = text.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));
  for (const [entity, value] of Object.entries(ENTITY_MAP)) {
    text = text.split(entity).join(value);
  }
  return text.replace(/\u00a0/g, " ").trim();
}

function stripTags(html = "") {
  return decodeEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
}

function truncateExcerpt(text, max = 160) {
  const cleaned = text.replace(/\[\s*…\s*\]/g, "").replace(/\[\s*\.\.\.\s*\]/g, "").trim();
  if (cleaned.length <= max) return cleaned;
  const slice = cleaned.slice(0, max + 1);
  const boundary = slice.lastIndexOf(" ");
  return `${(boundary > 80 ? slice.slice(0, boundary) : cleaned.slice(0, max)).trim()}…`;
}

function extFromUrl(url, fallback = ".jpg") {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase();
    if (ext && ext.length <= 5) return ext;
  } catch {
    /* ignore */
  }
  return fallback;
}

function safeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "image";
}

async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  await mkdir(path.dirname(dest), { recursive: true });
  const body = res.body;
  if (!body) throw new Error(`Empty body: ${url}`);
  await pipeline(Readable.fromWeb(body), createWriteStream(dest));
}

function rewriteHref(href, postSlugs) {
  if (!href) return href;
  try {
    const url = new URL(href, "https://aletindia.com/");
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "aletindia.com") return href;

    let pathname = url.pathname.replace(/\/+$/, "") || "/";
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 1 && postSlugs.has(segments[0])) {
      return `/blogs/${segments[0]}`;
    }
    if (segments[0] === "blogs" && segments[1] && postSlugs.has(segments[1])) {
      return `/blogs/${segments[1]}`;
    }
    return pathname === "/" ? "/" : pathname;
  } catch {
    return href;
  }
}

function cleanInlineHtml($, root, postSlugs) {
  const clone = $(root).clone();
  clone.find("script, style").remove();
  clone.find("*").each((_, el) => {
    const node = $(el);
    const tag = (el.tagName || "").toLowerCase();
    if (["strong", "em", "a"].includes(tag)) {
      for (const attr of Object.keys(el.attribs || {})) {
        if (tag === "a" && attr === "href") continue;
        node.removeAttr(attr);
      }
      if (tag === "a") {
        const href = rewriteHref(node.attr("href") || "", postSlugs);
        if (!href || href.startsWith("javascript:")) {
          node.replaceWith(node.html() || "");
        } else {
          node.attr("href", href);
        }
      }
      return;
    }
    if (tag === "b") {
      node.replaceWith(`<strong>${node.html() || ""}</strong>`);
      return;
    }
    if (tag === "i") {
      node.replaceWith(`<em>${node.html() || ""}</em>`);
      return;
    }
    // unwrap other tags, keep children
    node.replaceWith(node.html() || node.text());
  });
  return decodeEntities(clone.html() || "")
    .replace(/\s+/g, " ")
    .trim();
}

function isEmptyHtml(html) {
  return !stripTags(html).replace(/\s+/g, "");
}

async function parseContent(html, slug, postSlugs) {
  const $ = cheerio.load(`<div id="root">${html || ""}</div>`, {
    decodeEntities: false,
  });
  const root = $("#root");

  root.find("script, style").remove();
  root.find("*").each((_, el) => {
    const node = $(el);
    for (const attr of Object.keys(el.attribs || {})) {
      if (attr === "href" || attr === "src" || attr === "alt") continue;
      if (/^(class|style|id|data-|aria-|role|width|height|sizes|srcset|loading)/i.test(attr)) {
        node.removeAttr(attr);
      }
    }
  });

  // unwrap bare span/div that only wrap text/inline
  root.find("span, div").each((_, el) => {
    const node = $(el);
    if (node.closest("p, li, h2, h3, h4, figure, ul, ol").length) {
      // keep nested structure for now; cleaned in inline pass
      return;
    }
  });

  root.find("p").each((_, el) => {
    const node = $(el);
    if (isEmptyHtml(node.html() || "")) node.remove();
  });

  const sections = [];
  let current = { heading: "", blocks: [] };

  const pushSection = () => {
    if (current.blocks.length > 0) sections.push(current);
    current = { heading: "", blocks: [] };
  };

  const postImageDir = path.join(IMAGES_DIR, slug);
  let imageCounter = 0;

  async function handleImg(src, alt) {
    if (!src) return null;
    let absolute = src;
    try {
      absolute = new URL(src, "https://aletindia.com/").href;
    } catch {
      return null;
    }
    imageCounter += 1;
    const ext = extFromUrl(absolute);
    const base = safeFilename(path.basename(new URL(absolute).pathname, path.extname(new URL(absolute).pathname)) || `img-${imageCounter}`);
    const filename = `${base}${ext}`;
    const dest = path.join(postImageDir, filename);
    try {
      await downloadFile(absolute, dest);
    } catch (err) {
      console.warn(`  skip image ${absolute}: ${err.message}`);
      return null;
    }
    return {
      type: "img",
      src: `/images/blogs/${slug}/${filename}`,
      alt: decodeEntities(alt || ""),
    };
  }

  const children = root.children().toArray();
  // Also walk if content is flat text / mixed — use contents
  const nodes = root.contents().toArray().filter((n) => n.type === "tag" || (n.type === "text" && String(n.data || "").trim()));

  for (const node of nodes.length ? nodes : children) {
    if (node.type === "text") {
      const text = decodeEntities(String(node.data || "")).trim();
      if (text) current.blocks.push({ type: "p", html: text });
      continue;
    }

    const el = $(node);
    const tag = (node.tagName || "").toLowerCase();

    if (tag === "h2") {
      pushSection();
      current = { heading: decodeEntities(el.text()), blocks: [] };
      continue;
    }

    if (tag === "h3" || tag === "h4") {
      const text = decodeEntities(el.text()).trim();
      if (text) current.blocks.push({ type: "h3", text });
      continue;
    }

    if (tag === "p") {
      // paragraph may contain only an image
      const onlyImg = el.find("img").first();
      if (onlyImg.length && isEmptyHtml(el.clone().find("img").remove().end().html() || "")) {
        const block = await handleImg(onlyImg.attr("src"), onlyImg.attr("alt") || "");
        if (block) current.blocks.push(block);
        continue;
      }
      const html = cleanInlineHtml($, el, postSlugs);
      if (html && !isEmptyHtml(html)) {
        // WP often stores "• a• b" in one <p>; expand into a real list when clear.
        if (html.includes("•")) {
          const first = html.indexOf("•");
          const prefix = html.slice(0, first).trim();
          const items = html
            .slice(first)
            .split(/\s*•\s*/)
            .map((part) => part.trim())
            .filter(Boolean);
          if (items.length >= 2) {
            if (prefix) current.blocks.push({ type: "p", html: prefix });
            current.blocks.push({ type: "ul", items });
            continue;
          }
        }
        current.blocks.push({ type: "p", html });
      }
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      const items = [];
      el.children("li").each((_, li) => {
        const html = cleanInlineHtml($, $(li), postSlugs);
        if (html && !isEmptyHtml(html)) items.push(html);
      });
      if (items.length) current.blocks.push({ type: tag, items });
      continue;
    }

    if (tag === "figure") {
      const img = el.find("img").first();
      const block = await handleImg(img.attr("src"), img.attr("alt") || el.find("figcaption").text() || "");
      if (block) current.blocks.push(block);
      continue;
    }

    if (tag === "img") {
      const block = await handleImg(el.attr("src"), el.attr("alt") || "");
      if (block) current.blocks.push(block);
      continue;
    }

    if (tag === "blockquote") {
      const html = cleanInlineHtml($, el, postSlugs);
      if (html && !isEmptyHtml(html)) current.blocks.push({ type: "p", html: `<em>${html}</em>` });
      continue;
    }

    // generic block wrappers: recurse children
    if (["div", "section", "article"].includes(tag)) {
      const innerHtml = el.html() || "";
      if (!innerHtml.trim()) continue;
      const nested = await parseContent(innerHtml, slug, postSlugs);
      for (const section of nested) {
        if (!section.heading && current.blocks.length === 0 && sections.length === 0) {
          current.blocks.push(...section.blocks);
        } else if (!section.heading) {
          current.blocks.push(...section.blocks);
        } else {
          pushSection();
          current = { heading: section.heading, blocks: [...section.blocks] };
        }
      }
      continue;
    }
  }

  pushSection();
  return sections.filter((section) => section.blocks.length > 0);
}

function serialize(value, indent = 0) {
  const pad = "  ".repeat(indent);
  const next = "  ".repeat(indent + 1);
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((item) => `${next}${serialize(item, indent + 1)}`);
    return `[\n${items.join(",\n")}\n${pad}]`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return "{}";
    const fields = keys.map((key) => `${next}${key}: ${serialize(value[key], indent + 1)}`);
    return `{\n${fields.join(",\n")}\n${pad}}`;
  }
  return "undefined";
}

async function main() {
  console.log("Fetching WordPress posts…");
  const res = await fetch(WP_API, {
    headers: { Accept: "application/json", "User-Agent": "aletindia-blog-import/1.0" },
  });
  if (!res.ok) throw new Error(`WP API ${res.status}`);
  const posts = await res.json();
  console.log(`Got ${posts.length} posts`);

  const postSlugs = new Set(posts.map((p) => p.slug));
  await mkdir(IMAGES_DIR, { recursive: true });

  const mapped = [];

  for (const post of posts) {
    const slug = post.slug;
    console.log(`· ${slug}`);

    const title = decodeEntities(stripTags(post.title?.rendered || ""));
    const date = String(post.date || "").slice(0, 10);
    const excerpt = truncateExcerpt(stripTags(post.excerpt?.rendered || ""));

    const terms = post._embedded?.["wp:term"]?.[0] || [];
    const categories = terms
      .map((c) => decodeEntities(c.name || ""))
      .filter((name) => name && name.toLowerCase() !== "uncategorized");
    const tag = categories[0] || "Software Development";
    const author = post._embedded?.author?.[0]?.name || "Alet India Softwares";

    let image = "/images/pages/blog-laptop.jpg";
    let media = post._embedded?.["wp:featuredmedia"]?.[0];
    if (!media?.source_url && post.featured_media) {
      try {
        const mediaRes = await fetch(
          `https://aletindia.com/wp-json/wp/v2/media/${post.featured_media}`,
          { headers: { Accept: "application/json", "User-Agent": "aletindia-blog-import/1.0" } },
        );
        if (mediaRes.ok) media = await mediaRes.json();
      } catch (err) {
        console.warn(`  media lookup failed: ${err.message}`);
      }
    }
    const featuredUrl = media?.source_url;
    if (featuredUrl) {
      const ext = extFromUrl(featuredUrl);
      const dest = path.join(IMAGES_DIR, `${slug}${ext}`);
      try {
        await downloadFile(featuredUrl, dest);
        image = `/images/blogs/${slug}${ext}`;
      } catch (err) {
        console.warn(`  featured image failed: ${err.message}`);
      }
    }

    const sections = await parseContent(post.content?.rendered || "", slug, postSlugs);

    if (image === "/images/pages/blog-laptop.jpg") {
      const firstImg = sections
        .flatMap((section) => section.blocks)
        .find((block) => block.type === "img");
      if (firstImg?.src) image = firstImg.src;
    }

    mapped.push({
      slug,
      date,
      title,
      excerpt,
      image,
      tag,
      categories,
      author,
      sections,
    });
  }

  mapped.sort((a, b) => b.date.localeCompare(a.date));

  const file = `import type { BlogPost } from "./blog-types";

/** Generated by \`npm run import:blogs\`. Do not edit by hand. */
export const blogPosts: BlogPost[] = ${serialize(mapped)};
`;

  await writeFile(OUT_DATA, file, "utf8");
  console.log(`Wrote ${mapped.length} posts → lib/blogs-data.ts`);

  const slugsPath = path.join(ROOT, "lib", "blog-slugs.json");
  await writeFile(slugsPath, `${JSON.stringify(mapped.map((post) => post.slug), null, 2)}\n`, "utf8");
  console.log(`Wrote ${mapped.length} slugs → lib/blog-slugs.json`);

  const { syncBlogRedirects } = await import("./sync-blog-redirects.mjs");
  await syncBlogRedirects(process.env.NEXT_PUBLIC_BASE_PATH ?? "/aletindia");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
