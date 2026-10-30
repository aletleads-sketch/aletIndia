import { CaseStudiesBrowser } from "@/components/case-studies-browser";
import { Breadcrumb } from "@/components/page-hero";
import { caseStudyIndexEntries } from "@/lib/case-study-data";

export function CaseStudiesIndex() {
  return (
    <section className="hero-mesh relative overflow-hidden text-white">
      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="orb pointer-events-none absolute top-20 -right-24 h-96 w-96 rounded-full bg-brand/40 blur-3xl" />
      <div className="orb orb-b pointer-events-none absolute top-[40%] -left-24 h-80 w-80 rounded-full bg-brand-2/30 blur-3xl" />
      <div className="orb pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-brand/25 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[92rem] px-5 pt-36 pb-10 sm:px-8 lg:pt-40 xl:px-12">
        <Breadcrumb crumb="Case Studies" className="rise" />
        <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-3xl">
            <p className="rise d1 text-xs font-bold tracking-[0.32em] text-brand-2 uppercase">
              Demo files · {caseStudyIndexEntries.length} studies
            </p>
            <h1 className="rise d1 mt-4 text-5xl leading-[0.95] font-extrabold tracking-tight text-balance sm:text-7xl">
              How a product{" "}
              <span className="text-gradient">actually got made</span>
            </h1>
          </div>
          <p className="rise d2 max-w-sm text-sm leading-6 text-white/65 sm:text-base">
            Pick an industry, then open a file. These are working demos of real ALET products,
            written as the story of the build rather than a results report.
          </p>
        </div>
      </div>

      <CaseStudiesBrowser embedded />
    </section>
  );
}
