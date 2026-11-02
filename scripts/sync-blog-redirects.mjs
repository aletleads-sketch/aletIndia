/**
 * Writes lib/blog-slugs.json and vercel.static.json redirects.
 * Respects NEXT_PUBLIC_BASE_PATH (default /aletindia; empty string for Vercel root deploy).
 *
 * Note: next.config `redirects()` is not supported with `output: "export"`.
 * Runtime redirects for static hosting are in vercel.static.json (copied to out/vercel.json).
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLUGS_PATH = path.join(ROOT, "lib", "blog-slugs.json");
const DATA_PATH = path.join(ROOT, "lib", "blogs-data.ts");
const VERCEL_STATIC = path.join(ROOT, "vercel.static.json");

function withBase(basePath, routePath) {
  const normalized = routePath.startsWith("/") ? routePath : `/${routePath}`;
  if (!basePath) return normalized;
  if (normalized === basePath || normalized.startsWith(`${basePath}/`)) return normalized;
  return `${basePath}${normalized}`;
}

export function buildRedirects(slugs, basePath = "") {
  const redirects = [];

  for (const slug of slugs) {
    const from = withBase(basePath, `/${slug}`);
    const to = withBase(basePath, `/blogs/${slug}`);
    redirects.push(
      { source: from, destination: to, permanent: true },
      { source: `${from}/`, destination: to, permanent: true },
    );
  }

  const blogs = withBase(basePath, "/blogs");
  redirects.push(
    { source: withBase(basePath, "/blogs/page/:n"), destination: blogs, permanent: true },
    { source: withBase(basePath, "/blogs/page/:n/"), destination: blogs, permanent: true },
  );

  return redirects;
}

export async function readSlugs() {
  try {
    const raw = await readFile(SLUGS_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    /* fall through */
  }

  const data = await readFile(DATA_PATH, "utf8");
  return [...data.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
}

export async function syncBlogRedirects(basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/aletindia") {
  const slugs = await readSlugs();
  await writeFile(SLUGS_PATH, `${JSON.stringify(slugs, null, 2)}\n`, "utf8");

  const redirects = buildRedirects(slugs, basePath);
  const vercelConfig = {
    cleanUrls: true,
    trailingSlash: false,
    redirects,
  };

  await writeFile(VERCEL_STATIC, `${JSON.stringify(vercelConfig, null, 2)}\n`, "utf8");
  console.log(
    `Synced ${slugs.length} blog slugs + ${redirects.length} redirects (basePath=${JSON.stringify(basePath)})`,
  );
  return { slugs, redirects };
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  syncBlogRedirects().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
