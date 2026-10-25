import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const outputRoot = resolve(process.argv[2] ?? "out");

async function filesIn(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry);
    const info = await stat(path);
    if (info.isDirectory()) files.push(...(await filesIn(path)));
    else if (entry.endsWith(".html")) files.push(path);
  }
  return files;
}

let updated = 0;
for (const pagePath of await filesIn(outputRoot)) {
  const html = await readFile(pagePath, "utf8");
  if (html.includes("data-alet-inline-css")) continue;
  const matches = [...html.matchAll(/<link rel="stylesheet" href="([^\"]+\.css)"[^>]*>/g)];
  if (!matches.length) continue;

  let rewritten = html;
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const match = matches[index];
    const cssPath = join(outputRoot, match[1].replace(/^\//, ""));
    const css = await readFile(cssPath, "utf8");
    const replacement = `<style data-alet-inline-css="${index}">${css}</style>`;
    rewritten = `${rewritten.slice(0, match.index)}${replacement}${rewritten.slice(match.index + match[0].length)}`;
  }

  await writeFile(pagePath, rewritten);
  updated += 1;
}

console.log(`Inlined all stylesheets into ${updated} static pages.`);
