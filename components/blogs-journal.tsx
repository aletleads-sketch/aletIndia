"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Arrow, Photo } from "@/components/ui";
import type { BlogPost } from "@/lib/blog-types";
import { formatBlogDate, readingMinutes } from "@/lib/blogs";

export const BLOG_FILTER_CATEGORIES = [
  "All",
  "Mobile Application Development",
  "Software Development",
  "Web Application",
  "Augmented Reality",
  "Online Ticketing System",
] as const;

const PAGE_SIZE = 9;

type BlogsJournalProps = {
  posts: BlogPost[];
};

export function BlogsJournal({ posts }: BlogsJournalProps) {
  const sorted = useMemo(
    () => [...posts].sort((a, b) => b.date.localeCompare(a.date)),
    [posts],
  );
  const [category, setCategory] = useState<(typeof BLOG_FILTER_CATEGORIES)[number]>("All");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (category === "All") return sorted;
    return sorted.filter(
      (post) => post.categories.includes(category) || post.tag === category,
    );
  }, [sorted, category]);

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const shown = rest.slice(0, Math.max(0, visible - 1));
  const canLoadMore = shown.length < rest.length;

  const selectCategory = (next: (typeof BLOG_FILTER_CATEGORIES)[number]) => {
    setCategory(next);
    setVisible(PAGE_SIZE);
  };

  return (
    <section className="mx-auto w-full max-w-[92rem] px-5 py-12 sm:px-8 md:py-16 xl:px-12">
      <div className="flex flex-wrap gap-2">
        {BLOG_FILTER_CATEGORIES.map((item) => {
          const active = category === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => selectCategory(item)}
              className={`rounded-full px-4 py-2 text-xs font-bold tracking-wide transition ${
                active
                  ? "bg-night text-white"
                  : "bg-white text-ink/70 ring-1 ring-night/10 hover:text-ink"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {featured ? (
        <Reveal className="mt-8">
          <Link
            href={`/blogs/${featured.slug}`}
            className="group grid overflow-hidden rounded-[2rem] bg-night text-white lg:grid-cols-[1.15fr_0.85fr]"
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
                <p className="text-xs font-bold tracking-[0.22em] text-brand-2 uppercase">
                  Featured · {featured.tag}
                </p>
                <h2 className="mt-5 text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl">
                  {featured.title}
                </h2>
                <p className="mt-5 text-base leading-7 text-white/70">{featured.excerpt}</p>
              </div>
              <p className="mt-8 flex items-center justify-between text-sm font-semibold text-white/60">
                <span>
                  {formatBlogDate(featured.date)} · {readingMinutes(featured)} min
                </span>
                <span className="inline-flex items-center gap-2 font-extrabold text-brand-2">
                  Read
                  <span className="transition group-hover:translate-x-1.5">
                    <Arrow />
                  </span>
                </span>
              </p>
            </div>
          </Link>
        </Reveal>
      ) : (
        <p className="mt-10 text-base text-muted">No articles in this category yet.</p>
      )}

      {shown.length > 0 ? (
        <ol className="mt-6 divide-y divide-night/15 border-y border-night/15">
          {shown.map((post, index) => (
            <li key={post.slug}>
              <Reveal>
                <Link
                  href={`/blogs/${post.slug}`}
                  className="group grid items-center gap-5 py-6 sm:grid-cols-[4rem_1fr_auto] sm:py-7"
                >
                  <span className="text-3xl font-extrabold tracking-tight text-night/25">
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
      ) : null}

      {canLoadMore ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((count) => count + PAGE_SIZE)}
            className="btn-sheen bg-brand-gradient inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgb(79_70_229_/_0.8)] transition hover:-translate-y-0.5"
          >
            Load more
            <Arrow />
          </button>
        </div>
      ) : null}
    </section>
  );
}
