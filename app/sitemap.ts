import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blogs";
import { demoCaseStudiesResolved } from "@/lib/case-study-data";
import { services } from "@/lib/content";
import { pageUrl } from "@/lib/seo";

export const dynamic = "force-static";

type Entry = MetadataRoute.Sitemap[number];

const page = (path: string, priority: number, changeFrequency: Entry["changeFrequency"] = "monthly"): Entry => ({
  url: pageUrl(path),
  lastModified: new Date(),
  changeFrequency,
  priority,
});

// Public pages only. Design samples (/home1–3), legacy blog redirects and /admin stay out.
export default function sitemap(): MetadataRoute.Sitemap {
  const latestBlog = blogPosts[0]?.date;

  return [
    page("/", 1, "weekly"),
    page("/services", 0.9),
    ...services.map((service) => page(`/${service.slug}`, 0.9)),
    page("/portfolio", 0.8),
    page("/case-studies", 0.8),
    ...demoCaseStudiesResolved.map((study) => page(`/case-studies/${study.slug}`, 0.7)),
    page("/about-us", 0.7),
    page("/contact-us", 0.7),
    page("/career", 0.5),
    {
      ...page("/blogs", 0.7, "weekly"),
      lastModified: latestBlog ? new Date(`${latestBlog}T12:00:00Z`) : new Date(),
    },
    ...blogPosts.map((post) => ({
      url: pageUrl(`/blogs/${post.slug}`),
      lastModified: new Date(`${post.date}T12:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    page("/privacy-policy", 0.2, "yearly"),
    page("/terms-conditions", 0.2, "yearly"),
    page("/refund-policy", 0.2, "yearly"),
  ];
}
