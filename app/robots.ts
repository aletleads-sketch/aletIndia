import type { MetadataRoute } from "next";
import { NOINDEX, pageUrl } from "@/lib/seo";

export const dynamic = "force-static";

// Design samples are not blocked here: they carry noindex, which crawlers must be able to read.
// Crawlers only read robots.txt at a domain's root. Under /aletindia the WordPress
// root robots.txt applies instead, so add the Sitemap line there too.
export default function robots(): MetadataRoute.Robots {
  if (NOINDEX) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: pageUrl("/sitemap.xml"),
  };
}
