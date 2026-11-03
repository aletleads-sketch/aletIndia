import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blogs";
import { BASE_PATH } from "@/lib/site-path";

export const dynamic = "force-static";

const SITE = "https://aletindia.com";

function absoluteUrl(routePath: string) {
  const normalized = routePath.startsWith("/") ? routePath : `/${routePath}`;
  const withBase =
    !BASE_PATH || normalized === BASE_PATH || normalized.startsWith(`${BASE_PATH}/`)
      ? normalized
      : `${BASE_PATH}${normalized}`;
  return `${SITE}${withBase}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const latestBlog = blogPosts[0]?.date;

  return [
    {
      url: absoluteUrl("/blogs"),
      lastModified: latestBlog ? new Date(`${latestBlog}T12:00:00Z`) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogPosts.map((post) => ({
      url: absoluteUrl(`/blogs/${post.slug}`),
      lastModified: new Date(`${post.date}T12:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
