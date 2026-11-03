import { parseBlogBody } from "@/lib/blog-content";
import type { BlogBlock, BlogPost } from "@/lib/blog-types";
import { getPublishedBlogs, type CmsBlog } from "@/lib/cms-client";

export type { BlogBlock, BlogPost, BlogSection } from "@/lib/blog-types";

const FALLBACK_IMAGE = "/images/pages/blog-laptop.jpg";

function articleBody(content: unknown) {
  if (typeof content === "string") return content;
  if (content && typeof content === "object" && "body" in content) return String((content as { body: unknown }).body ?? "");
  return "";
}

/** `YYYY-MM-DD` in India time, so a post published late evening keeps its local date. */
function localDate(value: string | null) {
  return new Date(value ?? Date.now()).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function toPost(row: CmsBlog): BlogPost {
  const categories = (row.category ?? "").split(",").map((name) => name.trim()).filter(Boolean);
  return {
    slug: row.slug,
    date: localDate(row.published_at),
    title: row.title,
    excerpt: row.excerpt ?? "",
    image: row.cover_image_url || FALLBACK_IMAGE,
    imageAlt: row.cover_image_alt || row.title,
    tag: categories[0] ?? "Software Development",
    categories,
    author: "Alet India Softwares",
    sections: parseBlogBody(articleBody(row.content)),
  };
}

let posts: Promise<BlogPost[]> | null = null;

/**
 * Published posts from the CMS (Supabase `blogs`), newest first. Read once per production
 * build, so a CMS change shows on the live site after the next build and deploy;
 * `next dev` reads fresh on every request.
 */
export function getBlogPosts() {
  const load = () =>
    getPublishedBlogs().then((rows) => rows.map(toPost).sort((a, b) => b.date.localeCompare(a.date)));
  if (process.env.NODE_ENV !== "production") return load();
  posts ??= load();
  return posts;
}

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

export async function getBlogPost(slug: string) {
  return (await getBlogPosts()).find((post) => post.slug === slug);
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

export async function relatedPosts(slug: string) {
  const blogPosts = await getBlogPosts();
  const current = blogPosts.find((post) => post.slug === slug);
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
