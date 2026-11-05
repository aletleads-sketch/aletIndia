// Saves the visible text and image list of every page, to compare before/after a change.
// Usage: node scripts/content-export/snapshot.mjs <name>   → out/snapshot-<name>.json
import * as cheerio from "cheerio";
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";
const root = path.resolve(import.meta.dirname, "../..");
const jiti = createJiti(import.meta.url, { alias: { "@": root } });
const { sitePages } = await jiti.import(path.join(root, "lib/site-pages.ts"));
const BASE = "http://localhost:3000/aletindia";
const result = {};
for (const { path: p } of [...sitePages(), { path: "/home1" }]) {
  if (p === "/home1") continue;
  const html = await (await fetch(BASE + p)).text();
  const $ = cheerio.load(html);
  $("script,style,noscript,template").remove();
  const texts = [];
  $("body *").addBack().contents().each((_, n) => { if (n.type === "text") { const t = n.data.replace(/\s+/g, " ").trim(); if (t) texts.push(t); } });
  const imgs = $("img").map((_, i) => `${$(i).attr("src")}|${$(i).attr("alt") ?? ""}`).get();
  const links = $("a").map((_, a) => $(a).attr("href")).get();
  result[p] = { title: $("title").text(), texts, imgs, links };
}
fs.writeFileSync(path.join(import.meta.dirname, `out/snapshot-${process.argv[2] || "now"}.json`), JSON.stringify(result, null, 1));
console.log("pages", Object.keys(result).length);
