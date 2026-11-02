import type { Metadata } from "next";
import { BlogsJournal } from "@/components/blogs-journal";
import { Breadcrumb } from "@/components/page-hero";
import { blogPosts } from "@/lib/blogs";

export const metadata: Metadata = {
  title: "Journal — Alet India",
  description:
    "Articles from ALET India on app design, startup builds, cost, and choosing the right kind of mobile product.",
};

export default function BlogsPage() {
  return (
    <div className="bg-[#f6f1e8] text-ink">
      <section className="hero-mesh relative overflow-hidden text-white">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="orb pointer-events-none absolute top-20 -right-24 h-96 w-96 rounded-full bg-brand/40 blur-3xl" />
        <div className="orb orb-b pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-2/30 blur-3xl" />
        <div className="relative mx-auto w-full max-w-[92rem] px-5 pt-36 pb-16 sm:px-8 lg:pt-40 xl:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <Breadcrumb crumb="Blogs" className="rise" />
              <p className="rise d1 mt-8 text-xs font-bold tracking-[0.35em] text-brand-2 uppercase">
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

      <BlogsJournal posts={blogPosts} />
    </div>
  );
}
