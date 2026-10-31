import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyScreens } from "@/components/case-study-demo";
import { CaseStudyFileNav } from "@/components/case-study-file-nav";
import { Wave } from "@/components/page-hero";
import { Arrow } from "@/components/ui";
import {
  demoCaseStudiesResolved,
  getCaseStudy,
  getNextDemoStudy,
} from "@/lib/case-study-data";
import { type CaseStudyContentBlock } from "@/lib/case-study-sections";

/** Intrinsic sizes for tech-stack diagrams (avoids stretch from a shared wrong ratio). */
const NARRATIVE_IMAGE_SIZE: Record<string, { width: number; height: number }> = {
  "/images/all-deliveries-tech-stack.png": { width: 2560, height: 1705 },
  "/images/guri-houses-tech-stack.png": { width: 2560, height: 1440 },
  "/images/tajika-tech-stack.png": { width: 2560, height: 1705 },
  "/images/quick-savaari-tech-stack.png": { width: 2560, height: 1440 },
};

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return demoCaseStudiesResolved.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  return caseStudy
    ? {
        title: `${caseStudy.client} case study — Alet India`,
        description: caseStudy.summary,
      }
    : {};
}

function NarrativeBlocks({ blocks }: { blocks: CaseStudyContentBlock[] }) {
  return (
    <div className="mt-5 space-y-4">
      {blocks.map((block, index) => {
        if (block.type === "p") {
          return (
            <p
              key={`p-${index}-${block.text.slice(0, 24)}`}
              className="text-[1.05rem] leading-8 text-[#10210a]/80"
            >
              {block.text}
            </p>
          );
        }
        if (block.type === "h3") {
          return (
            <h3
              key={`h3-${index}-${block.text}`}
              className="pt-2 text-xl font-extrabold tracking-tight text-[#10210a]"
            >
              {block.text}
            </h3>
          );
        }
        if (block.type === "image") {
          const size = NARRATIVE_IMAGE_SIZE[block.src] ?? { width: 2560, height: 1440 };
          return (
            <figure
              key={`img-${index}-${block.src}`}
              className="my-2 w-full max-w-full min-w-0 overflow-hidden rounded-[1.4rem] bg-white ring-1 ring-[#10210a]/10"
            >
              <Image
                src={block.src}
                alt={block.alt}
                width={size.width}
                height={size.height}
                sizes="(max-width: 1024px) 100vw, min(100vw, 72rem)"
                quality={100}
                className="h-auto w-full object-contain object-center"
                style={{ width: "100%", height: "auto" }}
                priority={index < 2}
              />
            </figure>
          );
        }
        return (
          <ul
            key={`ul-${index}`}
            className="list-disc space-y-2 pl-5 text-[1.05rem] leading-8 text-[#10210a]/80"
          >
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const next = getNextDemoStudy(slug);
  const sections = study.sections ?? [];

  return (
    <>
      <article className="overflow-x-clip bg-[#e7f0e4] text-[#10210a]">
        <header className="hero-mesh relative overflow-hidden text-white">
          <div className="dot-grid pointer-events-none absolute inset-0" />
          <div className="orb pointer-events-none absolute top-20 -right-24 h-96 w-96 rounded-full bg-brand/40 blur-3xl" />
          <div className="orb orb-b pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-2/30 blur-3xl" />
          <div className="relative mx-auto w-full max-w-[92rem] px-5 pt-36 pb-20 sm:px-8 lg:pt-40 xl:px-12">
            <nav
              aria-label="Breadcrumb"
              className="text-xs font-bold tracking-[0.16em] text-white/55 uppercase"
            >
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span className="px-2 text-white/30">/</span>
              <Link href="/case-studies" className="hover:text-white">
                Case Studies
              </Link>
            </nav>
            <p className="mt-8 text-xs font-bold tracking-[0.28em] text-brand-2 uppercase">
              {study.industry} · Case study
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl leading-[1.02] font-extrabold tracking-tight text-balance break-words sm:text-6xl">
              {study.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-pretty text-white/70">{study.summary}</p>
            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              {study.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur"
                >
                  <dt className="text-xs font-bold tracking-[0.16em] text-white/45 uppercase">
                    {fact.label}
                  </dt>
                  <dd className="mt-2 text-lg font-extrabold break-words">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Wave className="fill-[#e7f0e4]" />
        </header>

        <div className="mx-auto grid w-full max-w-[92rem] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:py-16 xl:px-12">
          <CaseStudyFileNav />

          <div className="min-w-0 max-w-full space-y-16">
            <section className="scroll-mt-32">
              <h2 className="text-3xl font-extrabold tracking-tight text-balance break-words text-[#1a3314]">
                Walk the screens
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-pretty text-[#10210a]/70">
                Tap a frame to bring that screen forward. These are the product views from the
                build.
              </p>
              <CaseStudyScreens screens={study.screens} />
            </section>

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-32">
                <h2 className="text-3xl font-extrabold tracking-tight text-balance break-words text-[#1a3314]">
                  {section.title}
                </h2>
                {section.subtitle ? (
                  <p className="mt-3 max-w-3xl text-lg font-semibold leading-8 text-pretty text-[#10210a]/85">
                    {section.subtitle}
                  </p>
                ) : null}
                <NarrativeBlocks blocks={section.blocks} />
              </section>
            ))}

            <section className="rounded-[2rem] bg-[#10210a] px-5 py-10 text-white sm:px-10 sm:py-12">
              <h2 className="text-3xl font-extrabold tracking-tight text-balance break-words sm:text-4xl">
                Have a similar business idea?
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                Let&apos;s turn your vision into a connected digital experience.
              </p>
              <Link
                href="/contact-us"
                className="mt-8 inline-flex max-w-full items-center gap-2 rounded-full bg-[#d6ff4a] px-6 py-3 text-sm font-extrabold whitespace-nowrap text-[#10210a] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                Start your project <Arrow />
              </Link>
            </section>
          </div>
        </div>

        {next ? (
          <section className="border-t border-[#10210a]/10">
            <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-4 px-5 py-12 sm:px-8 sm:flex-row sm:items-end sm:justify-between xl:px-12">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-[#3d6b12] uppercase">
                  Next file
                </p>
                <p className="mt-3 text-3xl font-extrabold tracking-tight">{next.client}</p>
                <p className="mt-3 max-w-xl text-base leading-7 text-[#10210a]/70">
                  {next.summary}
                </p>
              </div>
              <Link
                href={`/case-studies/${next.slug}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#10210a] px-7 py-3.5 text-sm font-extrabold text-[#d6ff4a] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                Read {next.client} <Arrow />
              </Link>
            </div>
          </section>
        ) : null}
      </article>
    </>
  );
}
