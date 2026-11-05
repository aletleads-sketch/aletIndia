import { blogPosts } from "@/lib/blogs";
import { demoCaseStudiesResolved } from "@/lib/case-study-data";
import { services } from "@/lib/content";
import type { ChangeFrequency, SitePage, SitePageKind } from "@/lib/seo-sitemap-shared";

const page = (path: string, priority: number, changeFrequency: ChangeFrequency = "monthly", kind: SitePageKind = "Page"): SitePage => ({
  path,
  kind,
  priority,
  changeFrequency,
});

/**
 * Every public page, in sitemap order, with its built-in priority.
 * Design samples (/home1–3), legacy blog redirects and /admin stay out.
 */
export function sitePages(): SitePage[] {
  return [
    page("/", 1, "weekly"),
    page("/services", 0.9),
    ...services.map((service) => page(`/${service.slug}`, 0.9, "monthly", "Service")),
    page("/portfolio", 0.8),
    page("/case-studies", 0.8),
    ...demoCaseStudiesResolved.map((study) => page(`/case-studies/${study.slug}`, 0.7, "monthly", "Case study")),
    page("/about-us", 0.7),
    page("/contact-us", 0.7),
    page("/career", 0.5),
    { ...page("/blogs", 0.7, "weekly"), lastModified: blogPosts[0]?.date },
    ...blogPosts.map((post) => ({ ...page(`/blogs/${post.slug}`, 0.6, "monthly", "Blog"), lastModified: post.date })),
    page("/privacy-policy", 0.2, "yearly"),
    page("/terms-conditions", 0.2, "yearly"),
    page("/refund-policy", 0.2, "yearly"),
  ];
}
