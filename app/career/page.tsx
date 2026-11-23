import type { Metadata } from "next";
import Link from "next/link";
import { JobBoard } from "@/components/job-board";
import { Breadcrumb, Wave } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Arrow, Eyebrow, Photo } from "@/components/ui";
import { loadFields, loadSiteContent } from "@/lib/site-content";
import { canonical } from "@/lib/seo";
import { withSeoOverrides } from "@/lib/seo-overrides";
import { JsonLd } from "@/components/json-ld";
import { loadSchemaSettings } from "@/lib/seo-schema";
import { isDate, jobPostingSchema, organizationSchema, type JobPostingData, type OrganizationData } from "@/lib/seo-schema-shared";

export async function generateMetadata(): Promise<Metadata> {
  const { careers } = await loadSiteContent();
  return withSeoOverrides("/career", {
    alternates: canonical("/career"),
    title: "Careers — Alet India",
    description: `Open roles at ALET India in New Delhi. Share your resume at ${careers.email}.`,
  });
}


export default async function CareerPage() {
  const [schema, { careers }, hero, why, list, noMatch] = await Promise.all([
    loadSchemaSettings(),
    loadSiteContent(),
    loadFields("/career#hero"),
    loadFields("/career#why_join"),
    loadFields("/career#openings"),
    loadFields("/career#no_match"),
  ]);
  const jobBoardCopy = await loadFields("/career#job_board");
  const openings = careers.openings;  const perks = why.perks.map((perk) => ({ title: String(perk.title ?? ""), body: String(perk.body ?? ""), image: String(perk.image ?? "") }));
const jobData = schema.job_posting.data as JobPostingData;
  // Google rejects job postings without a posting date, so they stay off until the admin sets one.
  const jobSchemas =
    schema.job_posting.enabled && isDate(jobData.datePosted)
      ? openings.map((job) => jobPostingSchema(job, jobData, organizationSchema(schema.organization.data as OrganizationData).name))
      : [];

  return (
    <>
      <JsonLd items={jobSchemas} />
      <section className="relative overflow-hidden bg-[#140c08] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_90%_0%,rgb(249_115_22_/_0.45),transparent_70%)]" />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid w-full max-w-[92rem] items-end gap-12 px-5 pt-36 pb-24 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:pt-40 xl:px-12">
          <div>
            <Breadcrumb crumb={hero.crumb} className="rise" />
            <p className="rise d1 mt-8 text-7xl leading-none font-extrabold tracking-tight text-amber-300 sm:text-8xl">
              {String(openings.length).padStart(2, "0")}
            </p>
            <h1 className="rise d1 mt-3 max-w-xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
              {hero.title}
            </h1>
            <p className="rise d2 mt-5 max-w-lg text-base leading-7 text-white/70">
              {hero.textBefore} {careers.email}.
            </p>
            <a
              href="#openings"
              className="rise d3 btn-sheen mt-8 inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-bold text-night transition hover:-translate-y-0.5"
            >
              {hero.button}
              <Arrow />
            </a>
          </div>
          <ul className="rise d2 space-y-3 pb-2">
            {openings.slice(0, 4).map((job, index) => (
              <li key={job.id}>
                <a
                  href="#openings"
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur transition hover:bg-white/10"
                >
                  <span>
                    <span className="block text-xs font-bold tracking-[0.16em] text-amber-300 uppercase">
                      {job.department}
                    </span>
                    <span className="mt-1 block text-lg font-extrabold">{job.title}</span>
                  </span>
                  <span className="text-sm font-bold text-white/50">0{index + 1}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <Wave className="fill-[#fff7ed]" />
      </section>

      <section className="bg-[#fff7ed]">
        <div className="mx-auto w-full max-w-[92rem] px-5 py-12 sm:px-8 md:py-14 xl:px-12">
          <Reveal>
            <Eyebrow>{why.eyebrow}</Eyebrow>
            <h2 className="mt-4 max-w-xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              {why.title}
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((perk, index) => (
              <li key={perk.title}>
                <Reveal delay={index * 70} className="h-full">
                  <article className="group relative h-72 overflow-hidden rounded-[1.6rem]">
                    <div className="zoom-img absolute inset-0">
                      <Photo src={perk.image} className="h-full" sizes="25vw" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#140c08] via-[#140c08]/55 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <h3 className="text-xl font-extrabold">{perk.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/75">{perk.body}</p>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="openings" className="scroll-mt-28 bg-[#fff7ed]">
        <div className="mx-auto w-full max-w-[92rem] px-5 pb-12 sm:px-8 md:pb-16 xl:px-12">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>{list.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                {list.title}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted">
              {list.textBefore} {careers.email}.
            </p>
          </Reveal>
          <JobBoard copy={jobBoardCopy} />
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 md:py-14">
        <Reveal className="mx-auto grid max-w-[92rem] items-center gap-8 overflow-hidden rounded-[2.5rem] bg-night text-white lg:grid-cols-[1.1fr_0.9fr]">
          <div className="px-8 py-12 sm:px-12">
            <Eyebrow light>{noMatch.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance">
              {noMatch.title}
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-white/70">
              {noMatch.text}
            </p>
            <a
              href={`mailto:${careers.email}`}
              className="btn-sheen mt-8 inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-night"
            >
              {careers.email}
              <Arrow />
            </a>
          </div>
          <Photo src={noMatch.image.src} alt={noMatch.image.alt} className="h-64 lg:h-full lg:min-h-[18rem]" />
        </Reveal>
        <p className="mx-auto mt-8 max-w-[92rem] text-sm text-muted">
          {noMatch.footnote}{" "}
          <Link href={noMatch.footnoteLink.href} className="font-bold text-brand">
            {noMatch.footnoteLink.label}
          </Link>
          .
        </p>
      </section>
    </>
  );
}
