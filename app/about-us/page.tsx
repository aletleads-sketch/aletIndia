import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CoreSolutionsList } from "@/components/core-solutions";
import { HeroActions, HeroTitle, PhotoHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { StatsBar, TestimonialsSection, yearsOfExperience } from "@/components/sections";
import { Arrow, Eyebrow, Photo } from "@/components/ui";
import { achievements, clients, company } from "@/lib/content";
import { aboutApproach } from "@/lib/pages";

export const metadata: Metadata = {
  title: "About Us — Alet India",
  description:
    "ALET India Softwares is an India-based software development and digital solutions company building practical technology since 2017.",
};

const journey = [
  {
    stage: "2017",
    title: "Where It All Began",
    body: "ALET India started with a vision to make dependable, high-quality technology solutions accessible to businesses of different sizes.",
  },
  {
    stage: "Growth",
    title: "Growing Beyond Boundaries",
    body: "We expanded from individual development projects into mobile, web, user experience, and digital services for diverse markets.",
  },
  {
    stage: "Evolution",
    title: "Evolving With Technology",
    body: "Our focus grew from building new products to enhancing platforms, modernising technology, and supporting the full product lifecycle.",
  },
  {
    stage: "Today",
    title: "Building for Tomorrow",
    body: "We continue to bring clarity to complex ideas and create digital solutions with lasting value as a technology partner, not only a vendor.",
  },
];

const differentiators = [
  ["We Think Business First", "We begin by understanding the challenge, the opportunity, and the outcome you want to achieve."],
  ["We Build for Change", "We approach software development with scalability, maintainability, and future enhancements in mind."],
  ["We Value Transparency", "We believe clear communication and collaborative decision-making create stronger project outcomes."],
  ["We Focus on the Full Journey", "Our thinking extends beyond launch to continuous enhancement, modernization, and support."],
  ["We Grow Through Partnerships", "We value long-term relationships and aim to become a dependable extension of our clients' technology journey."],
] as const;

export default function AboutPage() {
  return (
    <>
      <PhotoHero
        crumb="About Us"
        image="/images/pages/team-table.jpg"
        imageAlt="ALET India team collaborating around a table"
        align="bottom"
        className="min-h-[42rem] lg:min-h-[48rem]"
      >
        <HeroTitle title="Rooted in experience." accent="Driven by what’s next." />
        <p className="rise d2 mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
          Building digital possibilities since {company.established}. We turn ideas into technology
          that helps businesses innovate, adapt, and move forward.
        </p>
        <HeroActions />
      </PhotoHero>

      <StatsBar />

      <section className="mx-auto grid w-full max-w-[92rem] items-center gap-14 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-2 xl:px-12">
        <Reveal from="left" className="relative">
          <div className="grid grid-cols-2 gap-4">
            <Photo src="/images/pages/office.jpg" className="h-64 rounded-[2rem] sm:h-80" />
            <Photo src="/images/pages/team-meeting.jpg" className="mt-12 h-64 rounded-[2rem] sm:h-80" />
            <Photo src="/images/pages/coworking.jpg" className="col-span-2 h-48 rounded-[2rem] sm:h-56" />
          </div>
          <div className="bg-brand-gradient absolute top-1/2 left-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[6px] border-white text-white shadow-2xl">
            <span className="text-4xl font-extrabold">{yearsOfExperience}+</span>
            <span className="text-[0.65rem] font-bold tracking-widest uppercase">Years</span>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Eyebrow>Who we are</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Engineers at heart. <span className="text-gradient-dark">Problem-solvers by nature.</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-ink/80">
            Established in {company.established}, ALET India Softwares is an India-based software
            development and digital solutions company committed to helping businesses innovate,
            adapt, and grow.
          </p>
          <p className="mt-4 text-base leading-8 text-muted">
            From custom mobile applications and web platforms to intuitive digital experiences and
            application modernisation, we combine technology, creativity, and business understanding
            to solve real-world challenges. Behind every application is a business objective, and
            behind every interface is a human experience.
          </p>
          <ul className="mt-8 flex flex-wrap items-center gap-6">
            {achievements.map((item) => (
              <li key={item.src}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={220}
                  height={220}
                  className="h-20 w-auto object-contain transition duration-300 hover:scale-105"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="bg-surface px-5 py-16 sm:px-8 md:py-24 xl:px-12">
        <div className="mx-auto w-full max-w-[92rem]">
          <Reveal className="max-w-2xl">
            <Eyebrow>Our story</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              A journey shaped by ideas, <span className="text-gradient-dark">technology, and progress.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted">
              Our philosophy is simple: build with purpose, improve continuously, and innovate for the future.
            </p>
          </Reveal>
          <div className="relative mt-12">
            <div className="journey-rail absolute top-6 right-[12.5%] left-[12.5%] hidden h-[3px] rounded-full md:block" aria-hidden="true" />
            <ol className="grid gap-5 md:grid-cols-4">
              {journey.map((item, index) => (
                <li key={item.stage} className="relative md:pt-12">
                  <span className={`journey-node d${index + 1} absolute top-3 left-1/2 z-10 hidden h-6 w-6 -translate-x-1/2 rounded-full border-[5px] border-white bg-brand shadow-[0_0_0_6px_rgb(79_70_229_/_0.16)] md:block`} aria-hidden="true" />
                  <Reveal delay={index * 90} className="group relative h-full">
                    <article className="journey-card h-full rounded-[1.75rem] border border-line bg-white p-6 shadow-[0_20px_50px_-38px_rgb(30_27_75_/_0.45)] transition duration-300 hover:-translate-y-2 hover:border-brand/30 hover:shadow-[0_30px_65px_-36px_rgb(79_70_229_/_0.55)]">
                      <span className="relative z-10 inline-flex min-w-20 items-center justify-center rounded-full bg-brand-gradient px-4 py-2 text-sm font-extrabold text-white shadow-[0_10px_24px_-12px_rgb(79_70_229_/_0.8)]">{item.stage}</span>
                      <h3 className="mt-7 text-xl font-extrabold tracking-tight">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted">{item.body}</p>
                    </article>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-7 text-sm leading-6 text-muted">Only our founding year is dated; the later stages represent the evolution of our work and ambitions over time.</p>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 md:py-24 xl:px-12">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow>What makes us different</Eyebrow>
              <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
                Beyond development. <span className="text-gradient-dark">Beyond delivery.</span>
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-muted">
              Our focus is not simply on what we build, but on why it matters to your business.
            </p>
          </Reveal>
          <ul className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {differentiators.map(([title, body], index) => {
              const image = aboutApproach[index % aboutApproach.length].image;
              return (
              <li key={title}>
                <Reveal delay={index * 90} className="h-full">
                  <article className="lift group h-full overflow-hidden rounded-[2rem] bg-white ring-1 ring-line">
                    <div className="relative h-56 overflow-hidden">
                      <div className="zoom-img absolute inset-0">
                        <Photo src={image} className="h-full" sizes="33vw" />
                      </div>
                      <span className="bg-brand-gradient absolute top-5 left-5 flex h-12 w-12 items-center justify-center rounded-2xl text-base font-extrabold text-white shadow-lg">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-extrabold tracking-tight sm:text-[1.35rem]">{title}</h3>
                      <p className="mt-3 text-[0.95rem] leading-7 font-medium text-ink/75">
                        {body}
                      </p>
                    </div>
                  </article>
                </Reveal>
              </li>
            )})}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden text-white">
        <Image
          src="/images/pages/presentation.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-brand/60" />
        <div className="relative mx-auto grid w-full max-w-[92rem] gap-10 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[1.3fr_0.7fr] lg:items-end xl:px-12">
          <Reveal>
            <Eyebrow light>Our mission</Eyebrow>
            <p className="mt-6 text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl">
              The next chapter starts with <span className="text-gradient">you.</span>
            </p>
          </Reveal>
          <Reveal delay={120} className="space-y-4">
            <p className="text-sm leading-7 text-white/75">Since 2017, our journey has been shaped by ideas, technology, and the ambition to create something better. Whether you&apos;re launching a new product, enhancing an existing platform, or exploring your next technology opportunity, we&apos;re ready to build alongside you.</p>
            <Link
              href="/contact-us"
              className="btn-sheen bg-brand-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
            >
              Start a conversation
              <Arrow />
            </Link>
            <Link href="/portfolio" className="ml-4 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-brand-2">Explore our work <Arrow /></Link>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[92rem] items-center gap-10 px-5 py-16 sm:px-8 md:py-24 xl:grid-cols-2 xl:px-12">
        <Reveal from="left">
          <Eyebrow>ALET&apos;s Core Solution</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Building digital possibilities <span className="text-gradient-dark">since 2017.</span>
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">
            We work with entrepreneurs, startups, and businesses looking to launch new products,
            improve existing systems, or take their digital capabilities to the next level.
          </p>
          <Photo src="/images/pages/developers.jpg" className="mt-8 hidden h-72 rounded-[2rem] xl:block" />
        </Reveal>
        <Reveal delay={120}>
          <CoreSolutionsList />
        </Reveal>
      </section>

      <section className="px-5 sm:px-8">
        <Reveal className="mx-auto max-w-[92rem] rounded-[2.5rem] bg-surface px-6 py-12 sm:px-12">
          <p className="text-center text-xs font-bold tracking-[0.22em] text-muted uppercase">
            Trusted by growing businesses
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {clients.map((client) => (
              <li
                key={client.name}
                className="lift flex h-24 items-center justify-center rounded-2xl bg-white px-6 ring-1 ring-line"
              >
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={160}
                  height={80}
                  className="max-h-12 w-auto object-contain"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <div className="py-16 md:py-24">
        <TestimonialsSection />
      </div>
    </>
  );
}
