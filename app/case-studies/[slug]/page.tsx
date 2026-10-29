import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApproachSteps, ScreenSwitcher } from "@/components/case-study-panels";
import { Arrow } from "@/components/ui";
import { caseStudies, getCaseStudy } from "@/lib/case-studies";

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return { title: "Case study — Alet India" };
  return {
    title: `${study.client} case study — Alet India`,
    description: study.summary,
  };
}

export const instant = false;

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const index = caseStudies.findIndex((item) => item.slug === study.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <article className="font-space bg-[#e7f0e4] text-[#10210a]">
      <header className="bg-[#07140c] text-white">
        <div className="mx-auto w-full max-w-[92rem] px-5 pt-36 pb-16 sm:px-8 lg:pt-40 xl:px-12">
          <nav aria-label="Breadcrumb" className="text-xs font-bold tracking-[0.16em] text-white/55 uppercase">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="px-2 text-white/30">/</span>
            <Link href="/case-studies" className="hover:text-white">
              Case Studies
            </Link>
          </nav>
          <p className="mt-8 text-xs font-bold tracking-[0.28em] text-[#d6ff4a] uppercase">
            {study.industry} · Demo study
          </p>
          <h1 className="font-syne mt-4 max-w-4xl text-4xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-6xl">
            {study.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">{study.summary}</p>
          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {study.facts.map((fact) => (
              <div key={fact.label} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <dt className="text-xs font-bold tracking-[0.16em] text-white/45 uppercase">{fact.label}</dt>
                <dd className="mt-2 text-lg font-extrabold">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[92rem] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-16 xl:px-12">
        <nav aria-label="On this page" className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-xs font-bold tracking-[0.18em] text-[#3d6b12] uppercase">In this file</p>
          <ul className="mt-4 space-y-2 text-sm font-bold">
            {[
              ["screens", "Screens"],
              ["challenge", "The brief"],
              ["approach", "How we worked"],
              ["built", "What shipped"],
              ["outcome", "Where it landed"],
            ].map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="block rounded-full px-3 py-2 hover:bg-[#10210a] hover:text-[#d6ff4a]">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-16">
          <section id="screens" className="scroll-mt-32">
            <h2 className="font-syne text-3xl font-extrabold tracking-tight">Walk the screens</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#10210a]/70">
              Tap a frame to bring that screen forward. These are the product views from the build.
            </p>
            <div className="mt-6">
              <ScreenSwitcher study={study} />
            </div>
          </section>

          <section id="challenge" className="scroll-mt-32">
            <h2 className="font-syne text-3xl font-extrabold tracking-tight">The brief</h2>
            <div className="mt-5 space-y-4">
              {study.challenge.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-[1.05rem] leading-8 text-[#10210a]/80">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section id="approach" className="scroll-mt-32">
            <h2 className="font-syne text-3xl font-extrabold tracking-tight">How we worked</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#10210a]/70">
              Choose a step. Each one is a decision we made while shaping {study.client}.
            </p>
            <ApproachSteps steps={study.approach} />
          </section>

          <section id="built" className="scroll-mt-32">
            <h2 className="font-syne text-3xl font-extrabold tracking-tight">What shipped</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {study.built.map((item, itemIndex) => (
                <li key={item} className="rounded-[1.4rem] bg-white p-5 ring-1 ring-[#10210a]/10">
                  <span className="font-syne text-2xl font-extrabold text-[#3d6b12]">
                    {String(itemIndex + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-3 text-sm leading-6 font-semibold">{item}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="outcome" className="scroll-mt-32 rounded-[2rem] bg-[#10210a] p-8 text-white sm:p-10">
            <h2 className="font-syne text-3xl font-extrabold tracking-tight">Where it landed</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">{study.outcome}</p>
            <Link
              href="/contact-us"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#d6ff4a] px-5 py-3 text-sm font-extrabold text-[#10210a]"
            >
              Plan a build like this
              <Arrow />
            </Link>
          </section>
        </div>
      </div>

      <section className="border-t border-[#10210a]/10">
        <div className="mx-auto flex w-full max-w-[92rem] flex-wrap items-center justify-between gap-6 px-5 py-10 sm:px-8 xl:px-12">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-[#3d6b12] uppercase">Next file</p>
            <p className="font-syne mt-2 text-2xl font-extrabold">{next.client}</p>
            <p className="mt-1 max-w-md text-sm text-[#10210a]/70">{next.summary}</p>
          </div>
          <Link
            href={`/case-studies/${next.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#10210a] px-5 py-3 text-sm font-extrabold text-[#d6ff4a]"
          >
            Read {next.client}
            <Arrow />
          </Link>
        </div>
      </section>
    </article>
  );
}
