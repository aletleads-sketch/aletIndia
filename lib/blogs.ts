import type { BlogBlock, BlogPost } from "@/lib/blog-types";
import { blogPosts as importedPosts } from "@/lib/blogs-data";

export type { BlogBlock, BlogPost, BlogSection } from "@/lib/blog-types";

export const blogPosts: BlogPost[] = [...importedPosts].sort((a, b) =>
  b.date.localeCompare(a.date),
);

function blockPlainText(block: BlogBlock): string {
  switch (block.type) {
    case "p":
      return block.html.replace(/<[^>]+>/g, " ");
    case "h3":
      return block.text;
    case "ul":
    case "ol":
      return block.items.map((item) => item.replace(/<[^>]+>/g, " ")).join(" ");
    case "img":
      return block.alt;
    default:
      return "";
  }
}

export function readingMinutes(post: BlogPost) {
  const words = post.sections
    .flatMap((section) => [section.heading, ...section.blocks.map(blockPlainText)])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(3, Math.round(words / 180));
}

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

/** Display helper — data stays ISO (`YYYY-MM-DD`). */
export function formatBlogDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function relatedPosts(slug: string) {
  const current = getBlogPost(slug);
  if (!current) return blogPosts.slice(0, 3);

  const shared = blogPosts
    .filter(
      (post) =>
        post.slug !== slug &&
        post.categories.some((category) => current.categories.includes(category)),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  if (shared.length >= 3) return shared.slice(0, 3);

  const rest = blogPosts
    .filter((post) => post.slug !== slug && !shared.some((item) => item.slug === post.slug))
    .sort((a, b) => b.date.localeCompare(a.date));

  return [...shared, ...rest].slice(0, 3);
}
