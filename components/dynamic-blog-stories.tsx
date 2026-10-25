"use client";

import { type ReactNode, useEffect, useState } from "react";
import { getPublishedBlogs, type CmsBlog } from "@/lib/cms-client";

function bodyText(content: unknown) {
  if (typeof content === "string") return content;
  if (content && typeof content === "object" && "body" in content && typeof (content as { body?: unknown }).body === "string") return (content as { body: string }).body;
  return "";
}

export function DynamicBlogStories({ fallback }: { fallback: ReactNode }) {
  const [blogs, setBlogs] = useState<CmsBlog[] | null>(null);

  useEffect(() => { getPublishedBlogs().then(setBlogs).catch(() => setBlogs([])); }, []);
  if (!blogs?.length) return <>{fallback}</>;

  return (
    <section className="mx-auto w-full max-w-[92rem] px-5 py-12 sm:px-8 md:py-16 xl:px-12">
      <ol className="divide-y divide-[#1c140c]/15 border-y border-[#1c140c]/15">
        {blogs.map((blog, index) => <li key={blog.id} id={blog.slug} className="scroll-mt-28">
          <article className="group grid items-center gap-5 py-6 sm:grid-cols-[4rem_1fr_auto] sm:py-7">
            <span className="text-3xl font-extrabold tracking-tight text-[#1c140c]/25">{String(index + 1).padStart(2, "0")}</span>
            <div><p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">{blog.category || "ALET insight"} · 3 min</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-balance text-brand sm:text-3xl">{blog.title}</h2>{blog.excerpt ? <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60 sm:text-base">{blog.excerpt}</p> : null}{bodyText(blog.content) ? <details className="mt-4 text-sm leading-6 text-ink/70"><summary className="cursor-pointer font-bold text-brand">Read article</summary><p className="mt-3 max-w-2xl whitespace-pre-line">{bodyText(blog.content)}</p></details> : null}</div>
            {blog.cover_image_url ? <img src={blog.cover_image_url} alt="" className="hidden h-24 w-36 rounded-2xl object-cover sm:block" /> : <span className="hidden h-24 w-36 rounded-2xl bg-[#1c140c]/10 sm:block" />}
          </article>
        </li>)}
      </ol>
    </section>
  );
}
