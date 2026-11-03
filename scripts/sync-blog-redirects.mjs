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

/** Slugs of the old WordPress posts, whose root URLs (/:slug) redirect to /blogs/:slug. */
export async function readSlugs() {
  const parsed = JSON.parse(await readFile(SLUGS_PATH, "utf8"));
  if (!Array.isArray(parsed) || !parsed.length) throw new Error(`${SLUGS_PATH} has no blog slugs`);
  return parsed;
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
