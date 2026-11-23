// Checks that every piece of text and every image on every page is in the database rows.
// Usage: node scripts/content-export/verify.mjs [rows.json from DB or out/rows.json]
import * as cheerio from "cheerio";
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";
const root = path.resolve(import.meta.dirname, "../..");
const BASE = "http://localhost:3000/aletindia";
const jiti = createJiti(import.meta.url, { alias: { "@": root } });
const { sitePages } = await jiti.import(path.join(root, "lib/site-pages.ts"));
const rowsFile = process.argv[2] || path.join(import.meta.dirname, "out/rows.json");
const squash = (v) => String(v).replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, "").toLowerCase();
const haystack = squash(fs.readFileSync(rowsFile, "utf8").replace(/\\"/g, '"').replace(/\u2019/g, "’"));
const missing = new Map();
const note = (pagePath, item) => { if (!missing.has(item)) missing.set(item, new Set()); missing.get(item).add(pagePath); };
const imgPath = (src) => {
  let v = src || "";
  if (v.includes("/_next/image")) v = decodeURIComponent(new URL(v, "http://x").searchParams.get("url") || "");
  v = v.replace(/^\/aletindia/, "").split("?")[0];
  const m = v.match(/^\/images\/_opt\/(.+)-\d+\.webp$/);
  return m ? "/images/" + m[1] : v; // extension-free compare below
};
async function check(pagePath, html, scope) {
  const $ = cheerio.load(html);
  $("script,style,noscript,template").remove();
  $(scope).find("*").addBack().contents().each((_, node) => {
    if (node.type === "text") {
      const t = node.data.replace(/\s+/g, " ").trim();
      if (t.length > 1 && !/^[\d+.,·/|•–—:-]+$/.test(t) && !haystack.includes(squash(t))) note(pagePath, t);
    }
  });
  $(scope).find("img").each((_, img) => {
    const src = imgPath($(img).attr("src")).replace(/\.\w+$/, "");
    if (src && !haystack.includes(squash(src))) note(pagePath, "IMG " + src);
  });
  for (const frame of $(scope).find("iframe").toArray()) {
    const src = $(frame).attr("src") || "";
    if (src.startsWith("http")) continue;
    const inner = await (await fetch(new URL(src, BASE + "/").href)).text();
    await check(pagePath + " (embed)", inner, "body");
  }
}
for (const { path: p } of sitePages()) {
  const html = await (await fetch(BASE + p)).text();
  await check(p, html, "body");
}
for (const [item, where] of missing) console.log(`${item.slice(0, 110)}   ← ${[...where].slice(0, 3).join(", ")}${where.size > 3 ? ` +${where.size - 3}` : ""}`);
console.log("missing:", missing.size);
