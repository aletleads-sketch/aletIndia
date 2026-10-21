import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow, Photo } from "@/components/ui";
import { blogPosts, getBlogPost, readingMinutes, relatedPosts } from "@/lib/blogs";

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

  return (
    <article className="bg-[#f6f1e8] text-ink">
      <header className="bg-[#1c140c] text-[#f6f1e8]">
        <div className="mx-auto w-full max-w-3xl px-5 pt-36 pb-12 sm:px-8 lg:pt-40">
          <nav aria-label="Breadcrumb" className="text-xs font-bold tracking-[0.16em] text-white/60 uppercase">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="px-2 text-white/30">/</span>
            <Link href="/blogs" className="hover:text-white">
              Blogs
            </Link>
          </nav>
          <p className="mt-8 text-xs font-bold tracking-[0.22em] text-amber-200 uppercase">{post.tag}</p>
          <h1 className="mt-4 text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
            {post.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/70">{post.excerpt}</p>
          <p className="mt-8 text-sm font-semibold text-white/55">
            {post.author} · {post.date} · {readingMinutes(post)} min read
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <Photo
          src={post.image}
          alt=""
          priority
          className="-mt-2 h-72 rounded-[2rem] border-4 border-[#f6f1e8] shadow-xl sm:h-[28rem]"
          sizes="(max-width: 1024px) 100vw, 64rem"
        />
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-14 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,42rem)_16rem]">
        <div className="space-y-12">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{section.heading}</h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="text-[1.05rem] leading-8 text-ink/80">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.list ? (
                <ul className="mt-5 space-y-3">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-3 text-[1.02rem] leading-7 text-ink/80">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <div className="rounded-[1.8rem] bg-[#1c140c] px-7 py-8 text-[#f6f1e8] sm:px-10">
            <p className="text-xs font-bold tracking-[0.2em] text-amber-200 uppercase">Build it</p>
            <p className="mt-3 text-2xl font-extrabold tracking-tight">
              Want this thinking applied to your product?
            </p>
            <Link
              href="/contact-us"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-night"
            >
              Talk to ALET
              <Arrow />
            </Link>
          </div>

          <nav className="grid gap-4 border-t border-[#1c140c]/15 pt-8 sm:grid-cols-2">
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
