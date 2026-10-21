import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Arrow, Photo } from "@/components/ui";
import { blogPosts, readingMinutes } from "@/lib/blogs";

export const metadata: Metadata = {
  title: "Journal — Alet India",
  description:
    "Articles from ALET India on app design, startup builds, cost, and choosing the right kind of mobile product.",
};

export default function BlogsPage() {
  const [featured, ...posts] = blogPosts;

  return (
    <div className="bg-[#f6f1e8] text-ink">
      <section className="relative overflow-hidden bg-[#1c140c] text-[#f6f1e8]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_50%_at_100%_0%,rgb(244_114_182_/_0.28),transparent_70%)]" />
        <div className="relative mx-auto w-full max-w-[92rem] px-5 pt-36 pb-16 sm:px-8 lg:pt-40 xl:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <Breadcrumb crumb="Blogs" className="rise" />
              <p className="rise d1 mt-8 text-xs font-bold tracking-[0.35em] text-amber-200 uppercase">
                The ALET journal
              </p>
              <h1 className="rise d1 mt-4 text-5xl leading-[0.95] font-extrabold tracking-tight text-balance sm:text-7xl">
                Notes from building products
              </h1>
            </div>
            <p className="rise d2 max-w-xs text-sm leading-6 text-white/60">
              {blogPosts.length} articles on design, startups, cost, and how to choose a build.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[92rem] px-5 py-12 sm:px-8 md:py-16 xl:px-12">
        <Reveal>
          <Link
            href={`/blogs/${featured.slug}`}
            className="group grid overflow-hidden rounded-[2rem] bg-[#1c140c] text-[#f6f1e8] lg:grid-cols-[1.15fr_0.85fr]"
          >
            <div className="relative min-h-[18rem] overflow-hidden lg:min-h-[32rem]">
              <div className="zoom-img absolute inset-0">
                <Photo
                  src={featured.image}
                  alt=""
                  priority
                  className="h-full"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </div>
            </div>
            <div className="flex flex-col justify-between p-8 sm:p-12">
              <div>
                <p className="text-xs font-bold tracking-[0.22em] text-amber-200 uppercase">
                  Featured · {featured.tag}
                </p>
                <h2 className="mt-5 text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl">
                  {featured.title}
                </h2>
                <p className="mt-5 text-base leading-7 text-white/70">{featured.excerpt}</p>
              </div>
              <p className="mt-8 flex items-center justify-between text-sm font-semibold text-white/60">
                <span>
                  {featured.date} · {readingMinutes(featured)} min
                </span>
                <span className="inline-flex items-center gap-2 font-extrabold text-amber-200">
                  Read
                  <span className="transition group-hover:translate-x-1.5">
                    <Arrow />
                  </span>
                </span>
              </p>
            </div>
          </Link>
        </Reveal>

        <ol className="mt-6 divide-y divide-[#1c140c]/15 border-y border-[#1c140c]/15">
          {posts.map((post, index) => (
            <li key={post.slug}>
              <Reveal>
                <Link
                  href={`/blogs/${post.slug}`}
                  className="group grid items-center gap-5 py-6 sm:grid-cols-[4rem_1fr_auto] sm:py-7"
                >
                  <span className="text-3xl font-extrabold tracking-tight text-[#1c140c]/25">
                    {String(index + 2).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="text-xs font-bold tracking-[0.18em] text-accent uppercase">
                      {post.tag} · {readingMinutes(post)} min
                    </span>
                    <span className="mt-2 block text-2xl font-extrabold tracking-tight text-balance transition group-hover:text-brand sm:text-3xl">
                      {post.title}
                    </span>
                    <span className="mt-2 hidden max-w-2xl text-sm leading-6 text-ink/60 sm:block">
                      {post.excerpt}
                    </span>
                  </span>
                  <Photo
                    src={post.image}
                    className="hidden h-24 w-36 rounded-2xl sm:block"
                    sizes="144px"
                  />
                </Link>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
