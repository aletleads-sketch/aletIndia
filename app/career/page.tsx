import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Arrow, Eyebrow } from "@/components/ui";
import { company } from "@/lib/content";
import { careers } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Career Opportunities — Alet India",
  description: `Open roles at ALET India in New Delhi. Share your resume at ${careers.email}.`,
};

const perks = [
  {
    title: "Real products",
    body: "Work on live apps and platforms used by clients in 20+ countries.",
  },
  {
    title: "Modern stack",
    body: "Build with Kotlin, Swift, React Native, Flutter, and modern web tools.",
  },
  {
    title: "Grow with us",
    body: `A close-knit team in New Delhi, building since ${company.established}.`,
  },
];

export default function CareerPage() {
  return (
    <>
      <PageHero
        crumb="Career"
        title="Build your career at"
        accent="ALET India"
        intro="Join a team of developers, designers, and marketers turning ideas into products people love."
        actions={false}
      >
        <div className="rise d3 mt-9 flex justify-center">
          <a
            href={`mailto:${careers.email}`}
            className="btn-sheen bg-brand-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_-8px_rgb(79_70_229_/_0.8)] transition hover:-translate-y-0.5"
          >
            Send your resume
            <Arrow />
          </a>
        </div>
      </PageHero>

      <section className="mx-auto w-full max-w-[92rem] px-5 py-14 sm:px-8 md:py-20 xl:px-12">
        <ul className="grid gap-5 md:grid-cols-3">
          {perks.map((perk, index) => (
            <li key={perk.title}>
              <Reveal delay={index * 90} className="h-full">
                <article className="gradient-border lift h-full rounded-3xl bg-white p-8 ring-1 ring-line shadow-[0_18px_50px_-35px_rgb(30_27_75_/_0.35)]">
                  <span className="bg-brand-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-base font-extrabold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mt-6 text-xl font-extrabold tracking-tight sm:text-[1.35rem]">
                    {perk.title}
                  </h2>
                  <p className="mt-3 text-[0.95rem] leading-7 font-medium text-ink/75">
                    {perk.body}
                  </p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-surface">
        <div className="mx-auto w-full max-w-[92rem] px-5 py-14 sm:px-8 md:py-20 xl:px-12">
          <Reveal>
            <Eyebrow>Open positions</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Current <span className="text-gradient-dark">openings</span>
            </h2>
          </Reveal>

          <ul className="mt-10 space-y-5">
            {careers.openings.map((job, index) => (
              <li key={job.title}>
                <Reveal delay={index * 70}>
                  {job.responsibilities && job.skills ? (
                    <article className="gradient-border relative overflow-hidden rounded-3xl bg-white p-8 sm:p-10 ring-1 ring-line shadow-[0_18px_50px_-35px_rgb(30_27_75_/_0.35)]">
                      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                            Hiring now
                          </p>
                          <h3 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                            {job.title}
                          </h3>
                          <p className="mt-2 text-[0.98rem] text-ink/75">{job.summary}</p>
                        </div>
                        <a
                          href={`mailto:${careers.email}?subject=${encodeURIComponent(`Application: ${job.title}`)}`}
                          className="btn-sheen bg-brand-gradient inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
                        >
                          Apply now
                          <Arrow />
                        </a>
                      </div>

                      <dl className="mt-7 grid gap-3 sm:grid-cols-3">
                        {[
                          ["Experience", job.experience],
                          ["Job type", job.type],
                          ["Location", job.location],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-2xl bg-surface px-5 py-4">
                            <dt className="text-xs font-bold tracking-[0.16em] text-brand uppercase">
                              {label}
                            </dt>
                            <dd className="mt-1 font-extrabold">{value}</dd>
                          </div>
                        ))}
                      </dl>

                      <div className="mt-8 grid gap-8 md:grid-cols-2">
                        <JobList title="Responsibilities" items={job.responsibilities} />
                        <JobList title="Technical skills" items={job.skills} />
                      </div>
                    </article>
                  ) : (
                    <article className="flex flex-col gap-3 rounded-3xl border border-line bg-white px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-xl font-extrabold tracking-tight">{job.title}</h3>
                        <p className="mt-1 text-sm text-muted">No new vacancies yet.</p>
                      </div>
                      <a
                        href={`mailto:${careers.email}?subject=${encodeURIComponent(`Resume: ${job.title}`)}`}
                        className="inline-flex items-center gap-2 text-sm font-extrabold text-brand"
                      >
                        Share your resume
                        <Arrow />
                      </a>
                    </article>
                  )}
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal className="mt-10 text-center text-sm text-muted">
            Don&apos;t see your role? Share your resume at{" "}
            <a href={`mailto:${careers.email}`} className="font-bold text-brand">
              {careers.email}
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function JobList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-extrabold tracking-wide text-ink uppercase">{title}</h4>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[0.95rem] leading-7 text-ink/75">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
