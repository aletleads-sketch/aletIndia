import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogSections } from "@/components/blog-blocks";
import { Arrow, Photo } from "@/components/ui";
import {
  blogPosts,
  formatBlogDate,
  getBlogPost,
  readingMinutes,
  relatedPosts,
} from "@/lib/blogs";
import { assetPath } from "@/lib/site-path";
import { breadcrumbJsonLd, canonical, jsonLd, ORGANIZATION_ID, pageUrl } from "@/lib/seo";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Article — Alet India" };

  return {
    title: `${post.title} — Alet India`,
    description: post.excerpt,
    alternates: canonical(`/blogs/${post.slug}`),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: pageUrl(`/blogs/${post.slug}`),
      images: [{ url: pageUrl(post.image) }],
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const index = blogPosts.findIndex((item) => item.slug === post.slug);
  const previous = blogPosts[index - 1];
  const next = blogPosts[index + 1];
  const related = relatedPosts(post.slug);
  const minutes = readingMinutes(post);
  const cover = assetPath(post.image);
  const url = pageUrl(`/blogs/${post.slug}`);
  const structured = [
    {
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.date,
      description: post.excerpt,
      image: pageUrl(post.image),
      author: { "@type": "Organization", name: post.author },
      publisher: { "@id": ORGANIZATION_ID },
      mainEntityOfPage: url,
    },
    breadcrumbJsonLd([
      { name: "Blogs", path: "/blogs" },
      { name: post.title, path: `/blogs/${post.slug}` },
    ]),
  ];

  return (
    <article className="bg-[#f6f1e8] text-ink">
      {structured.map((data) => (
        <script key={data["@type"]} type="application/ld+json" dangerouslySetInnerHTML={jsonLd(data)} />
      ))}

      <header className="hero-mesh relative overflow-hidden text-white">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="orb pointer-events-none absolute top-20 -right-24 h-96 w-96 rounded-full bg-brand/40 blur-3xl" />
        <div className="orb orb-b pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-2/30 blur-3xl" />
        <div className="relative mx-auto w-full max-w-3xl px-5 pt-28 pb-10 sm:px-8 sm:pt-36 sm:pb-12 lg:pt-40 lg:pb-14">
          <nav aria-label="Breadcrumb" className="text-xs font-bold tracking-[0.16em] text-white/60 uppercase">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="px-2 text-white/30">/</span>
            <Link href="/blogs" className="hover:text-white">
              Blogs
            </Link>
          </nav>

          <ul className="mt-6 flex flex-wrap gap-2 sm:mt-8">
            {(post.categories.length > 0 ? post.categories : [post.tag]).map((category) => (
              <li
                key={category}
                className="rounded-full bg-white/10 px-3.5 py-1.5 text-[0.7rem] font-bold tracking-[0.14em] text-brand-2 uppercase ring-1 ring-white/15"
              >
                {category}
              </li>
            ))}
          </ul>

          <h1 className="mt-4 text-3xl leading-[1.1] font-extrabold tracking-tight text-balance sm:mt-5 sm:text-6xl">
            {post.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-white/70 sm:mt-6 sm:text-lg sm:leading-8">
            {post.excerpt}
          </p>
          <p className="mt-6 text-sm font-semibold text-white/55 sm:mt-8">
            {post.author} · {formatBlogDate(post.date)} · {minutes} min read
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-8 sm:pt-8">
        <Photo
          src={post.image}
          alt={post.imageAlt ?? ""}
          priority
          className="h-48 rounded-[1.4rem] border-4 border-white shadow-xl sm:h-72 sm:rounded-[2rem] lg:h-[28rem]"
          sizes="(max-width: 1024px) 100vw, 64rem"
        />
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-14 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,42rem)_16rem]">
        <div className="space-y-12">
          <BlogSections sections={post.sections} />

          <div className="rounded-[1.8rem] bg-night px-7 py-8 text-white sm:px-10">
            <p className="text-xs font-bold tracking-[0.2em] text-brand-2 uppercase">Build it</p>
            <p className="mt-3 text-2xl font-extrabold tracking-tight">
              Want this thinking applied to your product?
            </p>
            <Link
              href="/contact-us"
              className="btn-sheen bg-brand-gradient mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgb(79_70_229_/_0.8)] transition hover:-translate-y-0.5"
            >
              Talk to ALET
              <Arrow />
            </Link>
          </div>

          <nav className="grid gap-4 border-t border-night/15 pt-8 sm:grid-cols-2">
            {previous ? (
              <Link href={`/blogs/${previous.slug}`} className="group">
                <span className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Previous</span>
                <span className="mt-2 block font-extrabold tracking-tight group-hover:text-brand">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/blogs/${next.slug}`} className="group sm:text-right">
                <span className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Next</span>
                <span className="mt-2 block font-extrabold tracking-tight group-hover:text-brand">
                  {next.title}
                </span>
              </Link>
            ) : null}
          </nav>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">More from the journal</p>
          <ul className="mt-4 space-y-4">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`/blogs/${item.slug}`} className="group block">
                  <Photo src={item.image} className="h-28 rounded-2xl" sizes="16rem" />
                  <span className="mt-3 block text-sm leading-5 font-extrabold tracking-tight group-hover:text-brand">
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/blogs" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-brand">
            All articles
            <Arrow />
          </Link>
        </aside>
      </div>
    </article>
  );
}
