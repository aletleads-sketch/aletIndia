import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/site-path";
import blogSlugs from "./lib/blog-slugs.json";

/**
 * Build permanent redirects for legacy WordPress root URLs.
 * Exported for reuse / inspection. Not attached to `nextConfig.redirects`
 * because `output: "export"` rejects next.config redirects (export-no-custom-routes).
 * Runtime redirects are written to `vercel.static.json` via `scripts/sync-blog-redirects.mjs`
 * and legacy static pages under `app/[slug]` + `app/blogs/page/[n]`.
 */
export function buildBlogRedirects(basePath: string = BASE_PATH) {
  const prefix = basePath || "";
  const withBase = (routePath: string) => {
    if (!prefix) return routePath;
    if (routePath === prefix || routePath.startsWith(`${prefix}/`)) return routePath;
    return `${prefix}${routePath}`;
  };

  const redirects = (blogSlugs as string[]).flatMap((slug) => {
    const from = withBase(`/${slug}`);
    const to = withBase(`/blogs/${slug}`);
    return [
      { source: from, destination: to, permanent: true as const },
      { source: `${from}/`, destination: to, permanent: true as const },
    ];
  });

  const blogs = withBase("/blogs");
  redirects.push(
    { source: withBase("/blogs/page/:n"), destination: blogs, permanent: true },
    { source: withBase("/blogs/page/:n/"), destination: blogs, permanent: true },
  );

  return redirects;
}

const nextConfig: NextConfig = {
  // Export a portable static site for the existing hosting deployment.
  output: "export",
  basePath: BASE_PATH,
  trailingSlash: false,
  experimental: {
    // The desktop build environment cannot reliably spawn the default worker pool.
    cpus: 1,
    workerThreads: false,
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 100,
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
  // Static export cannot use next.config redirects. See buildBlogRedirects() + vercel.static.json.
};

export default nextConfig;
