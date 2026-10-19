import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumb, HeroTitle, Wave } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Arrow, Eyebrow, Photo } from "@/components/ui";
import { blogPosts } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Blogs on Technology & Business — Alet India",
  description:
    "Insights from ALET India on app development, UI/UX trends, cross-platform apps, costs, and growing your business with technology.",
};

type Post = (typeof blogPosts)[number];

export default function BlogsPage() {
  const [featured, second, third, ...rest] = blogPosts;
  const topics = [...new Set(blogPosts.map((post) => post.tag))];

  return (
    <>
      <section className="hero-mesh relative overflow-hidden text-white">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid w-full max-w-[92rem] items-center gap-12 px-5 pt-36 pb-28 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:pt-40 xl:px-12">
          <div>
            <Breadcrumb crumb="Blogs" className="rise" />
            <HeroTitle title="Insights on" accent="technology & business" />
            <p className="rise d2 mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
              Guides, trends, and lessons from building apps and digital products for startups
              and growing businesses.
            </p>
            <ul className="rise d3 mt-8 flex flex-wrap gap-2">
              {topics.map((topic) => (
                <li key={topic} className="glass rounded-full px-4 py-2 text-xs font-bold">
                  {topic}
                  <span className="ml-2 text-white/50">
                    {blogPosts.filter((post) => post.tag === topic).length}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href={featured.href}
            target="_blank"
            rel="noreferrer"
            className="rise d2 group relative block h-[26rem] overflow-hidden rounded-[2.5rem] border border-white/10 sm:h-[30rem]"
          >
            <div className="zoom-img absolute inset-0">
              <Image src={featured.image} alt="" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent" />
            <span className="bg-brand-gradient absolute top-6 left-6 rounded-full px-4 py-1.5 text-xs font-extrabold tracking-wide uppercase">
              Latest article
            </span>
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
              <PostMeta post={featured} light />
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-balance sm:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-6 text-white/75">{featured.excerpt}</p>
              <ReadMore light />
            </div>
          </a>
        </div>
        <Wave />
      </section>

      <section className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 md:py-24 xl:px-12">
        <Reveal>
          <Eyebrow>Editor&apos;s picks</Eyebrow>
        </Reveal>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {[second, third].map((post, index) => (
            <Reveal key={post.href} delay={index * 100}>
              <a
                href={post.href}
                target="_blank"
                rel="noreferrer"
                className="lift group grid h-full overflow-hidden rounded-[2rem] bg-white ring-1 ring-line sm:grid-cols-[0.9fr_1.1fr]"
              >
                <div className="relative h-56 overflow-hidden sm:h-full sm:min-h-[18rem]">
                  <div className="zoom-img absolute inset-0">
                    <Photo src={post.image} className="h-full" sizes="(max-width: 1024px) 100vw, 25vw" />
                  </div>
                </div>
                <div className="flex flex-col p-7 sm:p-8">
                  <PostMeta post={post} />
                  <h3 className="mt-4 text-2xl leading-snug font-extrabold tracking-tight">{post.title}</h3>
                  <p className="mt-3 flex-1 text-[0.95rem] leading-7 text-ink/70">{post.excerpt}</p>
                  <ReadMore />
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 md:py-24 xl:px-12">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              More <span className="text-gradient-dark">reads</span>
            </h2>
            <p className="text-sm font-semibold text-muted">{rest.length} articles</p>
          </Reveal>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, index) => (
              <li
                key={post.href}
                className={
                  index === 0
                    ? "sm:col-span-2 lg:col-span-1 lg:row-span-2"
                    : index === rest.length - 1
                      ? "lg:col-span-2"
                      : ""
                }
              >
                <Reveal delay={(index % 3) * 80} className="h-full">
                  <a
                    href={post.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`group relative flex h-full items-end overflow-hidden rounded-[2rem] text-white ${
                      index === 0 ? "min-h-[24rem] lg:min-h-[36rem]" : "min-h-[17rem]"
                    }`}
                  >
                    <div className="zoom-img absolute inset-0">
                      <Photo src={post.image} className="h-full" sizes="(max-width: 640px) 100vw, 33vw" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/5" />
                    <div className="relative p-7">
                      <PostMeta post={post} light />
                      <h3
                        className={`mt-3 leading-snug font-extrabold tracking-tight ${
                          index === 0 ? "text-2xl sm:text-3xl" : "text-xl"
                        }`}
                      >
                        {post.title}
                      </h3>
                      {index === 0 ? (
                        <p className="mt-3 text-sm leading-6 text-white/75">{post.excerpt}</p>
                      ) : null}
                      <ReadMore light />
                    </div>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:py-24">
        <Reveal className="relative mx-auto max-w-[92rem] overflow-hidden rounded-[2.5rem] text-white">
          <Image src="/images/pages/writing.jpg" alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-brand/50" />
          <div className="relative flex flex-col gap-8 px-8 py-14 sm:px-14 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <Eyebrow light>Have an idea?</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Turn what you read into <span className="text-gradient">your next product</span>
              </h2>
            </div>
            <Link
              href="/contact-us"
              className="btn-sheen bg-brand-gradient inline-flex w-fit items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold"
            >
              Talk to our team
              <Arrow />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function PostMeta({ post, light = false }: { post: Post; light?: boolean }) {
  return (
    <p className="flex items-center gap-3 text-xs font-bold tracking-[0.14em] uppercase">
      <span
        className={`rounded-full px-3 py-1 ${
          light ? "bg-white/15 text-white backdrop-blur" : "bg-surface text-brand ring-1 ring-line"
        }`}
      >
        {post.tag}
      </span>
      <span className={light ? "text-white/70" : "text-muted"}>{post.date}</span>
    </p>
  );
}

function ReadMore({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`mt-5 inline-flex items-center gap-2 text-sm font-extrabold ${light ? "text-white" : "text-brand"}`}
    >
      Read article
      <span className="transition duration-300 group-hover:translate-x-1.5">
        <Arrow />
      </span>
    </span>
  );
}
