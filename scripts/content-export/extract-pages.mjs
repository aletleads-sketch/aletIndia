// Reads every public page from the running dev server and records each section's
// text, links and images in page order. Output: scripts/content-export/out/pages.json
// Usage: node scripts/content-export/extract-pages.mjs [baseUrl]
import * as cheerio from "cheerio";
import { createJiti } from "jiti";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const BASE = (process.argv[2] || "http://localhost:3000/aletindia").replace(/\/$/, "");
const BASE_PATH = new URL(BASE).pathname.replace(/\/$/, "");
const jiti = createJiti(import.meta.url, { alias: { "@": root } });
const { sitePages } = await jiti.import(path.join(root, "lib/site-pages.ts"));

const BLOCK = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "summary", "blockquote", "figcaption", "dt", "dd", "td", "th", "label", "option", "button", "a", "text"]);
const SKIP = new Set(["script", "style", "noscript", "template", "link", "meta", "path", "defs", "lineargradient", "radialgradient", "stop", "clippath", "mask", "filter"]);
const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

/** Turns a next/image or base-path URL back into the public file path, e.g. /images/pages/office.jpg */
function sitePath(src) {
  if (!src) return "";
  let value = /^(https?:|data:|\/)/.test(src) ? src : `/${src.replace(/^\.\//, "")}`;
  if (value.includes("/_next/image")) {
    const url = new URL(value, "http://x");
    value = decodeURIComponent(url.searchParams.get("url") || "");
  }
  if (BASE_PATH && value.startsWith(BASE_PATH + "/")) value = value.slice(BASE_PATH.length);
  return originalImage(value.split("?")[0]);
}

/** /images/_opt/work/tajika-1-960.webp (an optimized copy) → /images/work/tajika-1.png (the original). */
const originals = new Map();
function originalImage(value) {
  const match = value.match(/^\/images\/_opt\/(.+)-\d+\.webp$/);
  if (!match) return value;
  if (originals.has(match[1])) return originals.get(match[1]);
  const dir = path.join(root, "public/images", path.dirname(match[1]));
  const base = path.basename(match[1]);
  const file = fs.existsSync(dir) ? fs.readdirSync(dir).find((name) => name.replace(/\.\w+$/, "") === base && !name.endsWith(".webp")) ?? fs.readdirSync(dir).find((name) => name.replace(/\.\w+$/, "") === base) : null;
  const result = file ? `/images/${path.dirname(match[1]) === "." ? "" : path.dirname(match[1]).replaceAll("\\", "/") + "/"}${file}` : value;
  originals.set(match[1], result);
  return result;
}

function linkHref(href) {
  if (!href) return "";
  if (href.startsWith(BASE_PATH + "/") || href === BASE_PATH) return href.slice(BASE_PATH.length) || "/";
  return href;
}

function backgroundImages($el) {
  const style = $el.attr("style") || "";
  return [...style.matchAll(/url\((['"]?)(.*?)\1\)/g)].map((match) => sitePath(match[2]));
}

/** Ordered blocks for one section element. */
function blocksFor($, element) {
  const blocks = [];
  const walk = (node, inside) => {
    if (node.type === "text") {
      const text = clean(node.data);
      if (text && !inside) blocks.push({ type: "text", text });
      return;
    }
    if (node.type !== "tag" && node.type !== "script" && node.type !== "style") return;
    const tag = node.tagName.toLowerCase();
    if (SKIP.has(tag)) return;
    const $node = $(node);
    for (const src of backgroundImages($node)) blocks.push({ type: "img", src, alt: "", background: true });
    if (tag === "img") {
      blocks.push({ type: "img", src: sitePath($node.attr("src")), alt: clean($node.attr("alt")) });
      return;
    }
    if (tag === "iframe") {
      const src = $node.attr("src") || "";
      blocks.push({ type: "embed", src: /^https?:/.test(src) ? src : sitePath(src), title: clean($node.attr("title")), external: /^https?:/.test(src) });
      return;
    }
    if (tag === "input" || tag === "textarea") {
      const placeholder = clean($node.attr("placeholder"));
      if (placeholder) blocks.push({ type: "placeholder", name: $node.attr("name") || "", text: placeholder });
      return;
    }
    if (tag === "a" && !inside) {
      const label = clean($node.text()) || clean($node.attr("aria-label"));
      const href = linkHref($node.attr("href"));
      const hasBlockChild = $node.find("h1,h2,h3,h4,h5,h6,p,li").length > 0;
      if (!hasBlockChild) {
        $node.find("img").each((_, img) => blocks.push({ type: "img", src: sitePath($(img).attr("src")), alt: clean($(img).attr("alt")) }));
        if (label || href) blocks.push({ type: "link", text: label, href });
        return;
      }
      blocks.push({ type: "link", text: "", href });
    }
    const nestedBlock = $node.find([...BLOCK].join(",")).length > 0;
    if (BLOCK.has(tag) && tag !== "a" && !nestedBlock && !inside) {
      const text = clean($node.text());
      $node.find("img").each((_, img) => blocks.push({ type: "img", src: sitePath($(img).attr("src")), alt: clean($(img).attr("alt")) }));
      if (text) {
        const block = { type: tag, text };
        const accent = $node.find("[class*='gradient'],[class*='accent']").map((_, el) => clean($(el).text())).get().filter(Boolean);
        if (/^h[1-6]$/.test(tag) && accent.length) block.accent = accent.join(" ");
        if (tag === "p" && /tracking-\[0\.22em\]/.test($node.attr("class") || "")) block.role = "eyebrow";
        if (tag === "option") block.value = $node.attr("value") ?? text;
        blocks.push(block);
      }
      return;
    }
    for (const child of node.children || []) walk(child, inside);
  };
  walk(element, false);
  // Sliders render their slides twice for a seamless loop; keep one copy.
  for (let start = 0; start < blocks.length; start++) {
    for (let size = Math.floor((blocks.length - start) / 2); size >= 3; size--) {
      const first = JSON.stringify(blocks.slice(start, start + size));
      if (first === JSON.stringify(blocks.slice(start + size, start + size * 2))) {
        blocks.splice(start + size, size);
        break;
      }
    }
  }
  // Merge consecutive bare text fragments (e.g. a number and its "+").
  const merged = [];
  for (const block of blocks) {
    const last = merged[merged.length - 1];
    if (block.type === "text" && last?.type === "text") last.text = clean(`${last.text} ${block.text}`);
    else merged.push(block);
  }
  return merged;
}

const slug = (value) => clean(value).toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40);

function describe(blocks, element, $) {
  const heading = blocks.find((block) => /^h[1-3]$/.test(block.type));
  const eyebrow = blocks.find((block) => block.role === "eyebrow");
  const id = $(element).attr("id") || $(element).find("[id]").first().attr("id");
  const aria = $(element).attr("aria-label");
  const label = clean(eyebrow?.text || heading?.text || aria || id || "section");
  return { key: slug(id || eyebrow?.text || heading?.text || aria || "section"), label };
}

async function fetchHtml(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} → ${response.status}`);
  return response.text();
}

async function embedBlocks(src) {
  const html = await fetchHtml(`${BASE}${src.startsWith("/") ? src : "/" + src}`);
  const $ = cheerio.load(html);
  return blocksFor($, $("body")[0]);
}

async function extractPage(pagePath) {
  const html = await fetchHtml(`${BASE}${pagePath === "/" ? "/" : pagePath}`);
  const $ = cheerio.load(html);
  const sections = [];
  const used = new Map();
  // Wrapper divs (e.g. <div id="top">) are opened up so each real <section> is its own row.
  const topLevel = (element) => {
    const children = $(element).children().toArray();
    const wraps = element.tagName !== "section" && children.some((child) => child.tagName === "section");
    return wraps ? children.flatMap(topLevel) : [element];
  };
  for (const element of $("main").children().toArray().flatMap(topLevel)) {
    let blocks = blocksFor($, element);
    for (let index = 0; index < blocks.length; index++) {
      if (blocks[index].type === "embed" && !blocks[index].external) {
        const inner = await embedBlocks(blocks[index].src);
        blocks[index].blocks = inner;
      }
    }
    if (!blocks.length) continue;
    const { key, label } = describe(blocks, element, $);
    const count = (used.get(key) || 0) + 1;
    used.set(key, count);
    sections.push({ key: count > 1 ? `${key}_${count}` : key, label, blocks });
  }
  const title = clean($("title").text());
  return { path: pagePath, title, sections, header: $("header").first(), footer: $("footer").first(), $ };
}

const pages = [];
let header = null;
let footer = null;
for (const { path: pagePath, kind } of sitePages()) {
  const page = await extractPage(pagePath);
  if (!header) {
    header = blocksFor(page.$, page.header[0]);
    footer = blocksFor(page.$, page.footer[0]);
  }
  pages.push({ path: pagePath, kind, title: page.title, sections: page.sections });
  process.stdout.write(`${pagePath} (${page.sections.length} sections)\n`);
}

fs.mkdirSync(path.join(import.meta.dirname, "out"), { recursive: true });
fs.writeFileSync(path.join(import.meta.dirname, "out/pages.json"), JSON.stringify({ header, footer, pages }, null, 2));
console.log("done", pages.length);
