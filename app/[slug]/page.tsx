import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PermanentClientRedirect } from "@/components/permanent-client-redirect";
import blogSlugs from "@/lib/blog-slugs.json";
import { getBlogPost } from "@/lib/blogs";
import { assetPath } from "@/lib/site-path";

const slugSet = new Set(blogSlugs as string[]);

export function generateStaticParams() {
  return (blogSlugs as string[]).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!slugSet.has(slug)) return { title: "Not found — Alet India" };
  const post = getBlogPost(slug);
  return {
    title: post ? `${post.title} — Alet India` : "Article — Alet India",
    description: post?.excerpt,
    robots: { index: false, follow: true },
    alternates: { canonical: `/blogs/${slug}` },
  };
}

/**
 * Legacy WordPress URLs lived at /:slug. Static export cannot use next.config redirects,
 * so these pages emit a permanent meta + JS redirect to /blogs/:slug (basePath-aware via assetPath).
 */
export default async function LegacyBlogSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slugSet.has(slug)) notFound();

  const href = assetPath(`/blogs/${slug}`);

  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-2xl flex-col justify-center px-5 py-24 text-ink">
      <PermanentClientRedirect href={href} />
      <p className="text-sm font-semibold tracking-wide text-muted uppercase">Moved permanently</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">This article has a new URL</h1>
      <p className="mt-4 text-base leading-7 text-muted">
        Continue to{" "}
        <Link href={`/blogs/${slug}`} className="font-bold text-brand underline underline-offset-2">
          /blogs/{slug}
        </Link>
        .
      </p>
    </main>
  );
}
