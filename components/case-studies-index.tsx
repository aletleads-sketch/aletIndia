import Image from "next/image";
import Link from "next/link";
import { Breadcrumb, Wave } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ContactSection } from "@/components/sections";
import { Arrow, Eyebrow } from "@/components/ui";
import { caseStudyDetails } from "@/lib/case-study-data";

function StudyVisual({ study }: { study: (typeof caseStudyDetails)[number] }) {
  const landscape = "landscape" in study.study && study.study.landscape;

  return (
    <div className={`relative flex h-64 items-center justify-center overflow-hidden bg-gradient-to-br ${study.study.color} p-5 sm:h-72`}>
      {landscape ? (
        <div className="w-full overflow-hidden rounded-2xl border-[7px] border-[#151925] bg-[#151925] p-1.5 shadow-[0_22px_40px_-18px_rgb(0_0_0_/_0.75)]">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-800">
            <Image src={study.study.screens[0]} alt="" fill sizes="(max-width: 768px) 100vw, 42rem" className="object-cover" />
          </div>
        </div>
      ) : (
        <div className="flex h-full items-end justify-center gap-3">
          {study.study.screens.slice(0, 3).map((src, index) => (
            <Image
              key={src}
              src={src}
              alt=""
              width={280}
              height={560}
              sizes="(max-width: 768px) 36vw, 13rem"
              className={`h-[88%] w-auto max-w-[42%] object-contain drop-shadow-[0_18px_24px_rgb(0_0_0_/_0.35)] ${index === 1 ? "hidden sm:block" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CaseStudiesIndex() {
  return (
    <>
      <section className="hero-mesh relative overflow-hidden text-white">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="orb pointer-events-none absolute top-16 -right-20 h-96 w-96 rounded-full bg-brand/35 blur-3xl" />
        <div className="relative mx-auto w-full max-w-[92rem] px-5 pt-36 pb-28 sm:px-8 lg:pt-40 xl:px-12">
          <Breadcrumb crumb="Case Studies" className="rise" />
          <div className="mt-7 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="rise d1 text-xs font-bold tracking-[0.26em] text-brand-2 uppercase">ALET in action</p>
              <h1 className="rise d1 mt-4 max-w-4xl text-5xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                The stories behind products that <span className="text-gradient">move businesses forward.</span>
              </h1>
            </div>
            <p className="rise d2 max-w-xl text-base leading-8 text-white/72 sm:text-lg lg:pb-2">
              Explore the product thinking, experience design, and engineering decisions behind real work created for ambitious teams.
            </p>
          </div>
        </div>
        <Wave />
      </section>

      <section className="px-5 py-16 sm:px-8 md:py-24 xl:px-12">
        <div className="mx-auto w-full max-w-[92rem]">
          <Reveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <Eyebrow>Selected work</Eyebrow>
              <h2 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">Choose a story to <span className="text-gradient-dark">explore in detail.</span></h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-muted">Each case study takes you from the original challenge through the experience we shaped and the outcome it made possible.</p>
          </Reveal>

          <div className="mt-12 grid gap-7 lg:grid-cols-2 xl:grid-cols-3">
            {caseStudyDetails.map((caseStudy, index) => (
              <Reveal key={caseStudy.slug} delay={Math.min(index * 65, 260)} className="h-full">
                <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_20px_60px_-35px_rgb(30_27_75_/_0.42)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_-35px_rgb(30_27_75_/_0.55)]">
                  <StudyVisual study={caseStudy} />
                  <div className="flex flex-1 flex-col p-7 sm:p-8">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white p-1.5">
                        <Image src={caseStudy.study.logo} alt="" width={60} height={60} className="max-h-7 w-auto object-contain" />
                      </span>
                      <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">{caseStudy.kicker}</p>
                    </div>
                    <h3 className="mt-5 text-3xl font-extrabold tracking-tight">{caseStudy.study.name}</h3>
                    <p className="mt-4 text-sm leading-7 text-muted">{caseStudy.study.summary}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {caseStudy.study.tags.map((tag) => <li key={tag} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink/75">{tag}</li>)}
                    </ul>
                    <Link href={`/case-studies/${caseStudy.slug}`} className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-brand transition group-hover:gap-3">
                      Read case study <Arrow />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ContactSection title="Have a project with a" accent="story to tell?" />
    </>
  );
}
