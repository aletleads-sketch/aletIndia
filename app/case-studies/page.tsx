import type { Metadata } from "next";
import Link from "next/link";
import { CaseStudyExplorer } from "@/components/case-study-explorer";
import { Breadcrumb } from "@/components/page-hero";
import { caseStudies } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Case Studies — Alet India",
  description:
    "Demo case studies of products ALET India designed and built, including Tajika, All Deliveries, Guri Houses, and Quick Savaari.",
};

export default function CaseStudiesPage() {
  return (
    <div className="font-space bg-[#07140c] text-white">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_100%_0%,rgb(214_255_74_/_0.18),transparent_60%)]" />
        <div className="relative mx-auto w-full max-w-[92rem] px-5 pt-36 pb-10 sm:px-8 lg:pt-40 xl:px-12">
          <Breadcrumb crumb="Case Studies" className="rise" />
          <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold tracking-[0.32em] text-[#d6ff4a] uppercase">
                Demo files · {caseStudies.length} studies
              </p>
              <h1 className="font-syne mt-4 text-5xl leading-[0.95] font-extrabold tracking-tight text-balance sm:text-7xl">
                How a product actually got made
              </h1>
            </div>
            <p className="max-w-sm text-sm leading-6 text-white/65">
              Pick an industry, then open a file. These are working demos of real ALET products,
              written as the story of the build rather than a results report.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[92rem] px-5 pb-20 sm:px-8 xl:px-12">
        <CaseStudyExplorer />
        <p className="mt-10 text-sm text-white/50">
          Want something in this shape for your own product?{" "}
          <Link href="/contact-us" className="font-bold text-[#d6ff4a] hover:underline">
            Start a conversation
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
