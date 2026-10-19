import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Arrow } from "@/components/ui";
import { blogPosts } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Blogs on Technology & Business — Alet India",
  description:
    "Insights from ALET India on app development, UI/UX trends, cross-platform apps, costs, and growing your business with technology.",
};

export default function BlogsPage() {
  const [featured, ...posts] = blogPosts;

  return (
    <>
      <PageHero
        crumb="Blogs"
        title="Insights on"
        accent="technology & business"
        intro="Guides, trends, and lessons from building apps and digital products for startups and growing businesses."
        actions={false}
      />

      <section className="mx-auto w-full max-w-[92rem] px-5 py-14 sm:px-8 md:py-20 xl:px-12">
        <Reveal>
          <a
            href={featured.href}
            target="_blank"
            rel="noreferrer"
            className="gradient-border lift group grid overflow-hidden rounded-[2rem] bg-white lg:grid-cols-[1.1fr_0.9fr] ring-1 ring-line shadow-[0_18px_50px_-35px_rgb(30_27_75_/_0.35)]"
          >
            <div className="relative h-64 overflow-hidden sm:h-80 lg:h-full lg:min-h-[22rem]">
              <Image
                src={featured.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12">
              <PostMeta tag={featured.tag} date={featured.date} />
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-ink/75">{featured.excerpt}</p>
              <ReadMore />
            </div>
          </a>
        </Reveal>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <li key={post.href}>
              <Reveal delay={(index % 3) * 90} className="h-full">
                <a
                  href={post.href}
                  target="_blank"
                  rel="noreferrer"
                  className="gradient-border lift group flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-line shadow-[0_18px_50px_-35px_rgb(30_27_75_/_0.35)]"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <PostMeta tag={post.tag} date={post.date} />
                    <h3 className="mt-3 text-xl leading-snug font-extrabold tracking-tight">
                      {post.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[0.95rem] leading-7 text-ink/70">
                      {post.excerpt}
                    </p>
                    <ReadMore />
                  </div>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function PostMeta({ tag, date }: { tag: string; date: string }) {
  return (
    <p className="flex items-center gap-3 text-xs font-bold tracking-[0.14em] uppercase">
      <span className="rounded-full bg-surface px-3 py-1 text-brand ring-1 ring-line">{tag}</span>
      <span className="text-muted">{date}</span>
    </p>
  );
}

function ReadMore() {
  return (
    <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-brand">
      Read article
      <span className="transition duration-300 group-hover:translate-x-1.5">
        <Arrow />
      </span>
    </span>
  );
}
