import type { Metadata } from "next";
import { HeroTitle, PhotoHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Arrow, Eyebrow, Photo } from "@/components/ui";
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

const life = [
  { src: "/images/pages/coworking.jpg", className: "h-72" },
  { src: "/images/pages/team-meeting.jpg", className: "h-96" },
  { src: "/images/pages/developer-woman.jpg", className: "h-80" },
  { src: "/images/pages/brainstorm.jpg", className: "h-64" },
  { src: "/images/pages/presentation.jpg", className: "h-72" },
  { src: "/images/pages/team-laptops.jpg", className: "h-64" },
];

const hiringSteps = [
  { title: "Send your resume", body: `Email ${careers.email} with your resume and the role you're interested in.` },
  { title: "Meet the team", body: "A technical conversation with our leads about your work, skills, and goals." },
  { title: "Join ALET", body: "Get your offer, meet your project team, and start building real products." },
];

export default function CareerPage() {
  return (
    <>
      <PhotoHero
        crumb="Career"
        image="/images/pages/women-coding.jpg"
        imageAlt="Developers working together at ALET India"
        align="center"
        className="min-h-[40rem] lg:min-h-[46rem]"
      >
        <HeroTitle title="Build your career at" accent="ALET India" />
        <p className="rise d2 mx-auto mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
          Join a team of developers, designers, and marketers turning ideas into products people
          love.
        </p>
        <div className="rise d3 mt-9 flex flex-wrap justify-center gap-3">
          <a
            href={`mailto:${careers.email}`}
            className="btn-sheen bg-brand-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_-8px_rgb(79_70_229_/_0.8)] transition hover:-translate-y-0.5"
          >
            Send your resume
            <Arrow />
          </a>
          <a
            href="#openings"
            className="glass inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
          >
            See openings
          </a>
        </div>
      </PhotoHero>

      <section className="mx-auto grid w-full max-w-[92rem] gap-5 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[1.1fr_0.9fr] xl:px-12">
        <Reveal className="group relative min-h-[26rem] overflow-hidden rounded-[2.5rem] text-white">
          <div className="zoom-img absolute inset-0">
            <Photo src="/images/pages/developers.jpg" className="h-full" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
            <Eyebrow light>Why ALET</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Grow by building <span className="text-gradient">real products</span>
            </h2>
          </div>
        </Reveal>
        <ul className="grid gap-5">
          {perks.map((perk, index) => (
            <li key={perk.title}>
              <Reveal delay={index * 90} className="h-full">
                <article className="lift flex h-full items-start gap-5 rounded-[2rem] bg-surface p-7 ring-1 ring-line">
                  <span className="bg-brand-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight">{perk.title}</h3>
                    <p className="mt-2 text-[0.95rem] leading-7 text-ink/75">{perk.body}</p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative overflow-hidden bg-night text-white">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 md:py-24 xl:px-12">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow light>Life at ALET</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Where ideas become <span className="text-gradient">products</span>
            </h2>
          </Reveal>
          <div className="masonry mt-12">
            {life.map((item, index) => (
              <Reveal key={item.src} delay={(index % 3) * 90}>
                <div className="group overflow-hidden rounded-[1.8rem]">
                  <div className="zoom-img">
                    <Photo src={item.src} className={item.className} sizes="(max-width: 1024px) 50vw, 33vw" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 md:py-24 xl:px-12">
        <Reveal className="max-w-2xl">
          <Eyebrow>Hiring process</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Three simple <span className="text-gradient-dark">steps</span>
          </h2>
        </Reveal>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {hiringSteps.map((step, index) => (
            <li key={step.title}>
              <Reveal delay={index * 90} className="relative h-full">
                <p className="text-gradient-dark text-8xl leading-none font-extrabold opacity-90">
                  {index + 1}
                </p>
                <h3 className="mt-4 text-2xl font-extrabold tracking-tight">{step.title}</h3>
                <p className="mt-3 max-w-sm text-[0.95rem] leading-7 text-ink/75">{step.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section id="openings" className="scroll-mt-24 bg-surface">
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
