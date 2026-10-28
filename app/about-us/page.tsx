import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AboutJourney } from "@/components/about-journey";
import { AboutSolutionsJourney } from "@/components/about-solutions-journey";
import { AboutStoryJourney } from "@/components/about-story-journey";
import { HeroActions, HeroTitle, PhotoHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { YearsSinceFounding } from "@/components/count-up";
import { StatsBar, TestimonialsSection } from "@/components/sections";
import { Arrow, Eyebrow, Photo } from "@/components/ui";
import { achievements, clients, company } from "@/lib/content";
import { aboutApproach } from "@/lib/pages";

export const metadata: Metadata = {
  title: "About Us — Alet India",
  description:
    "ALET India Softwares is an India-based software development and digital solutions company building practical technology since 2017.",
};

const companyIntroduction = [
  "Every great digital experience begins with an idea. At Alet India Softwares, we turn those ideas into technology that helps businesses move forward.",
  "Established in 2017, Alet India Softwares is an India-based software development and digital solutions company committed to helping businesses innovate, adapt, and grow.",
  "From custom mobile applications and web platforms to intuitive digital experiences and application modernization, we combine technology, creativity, and business understanding to deliver solutions built around real-world challenges.",
  "Our philosophy is simple: Build with purpose. Improve continuously. Innovate for the future.",
];

const whoWeAre = [
  "We believe technology is most powerful when it solves a meaningful problem.",
  "Behind every application is a business objective. Behind every interface is a human experience. And behind every successful digital product is a combination of thoughtful planning, strong engineering, and continuous improvement.",
  "At Alet India Softwares, we bring these elements together to create digital experiences that are practical, scalable, and designed around the people who use them.",
  "We work with entrepreneurs, startups, and businesses looking to launch new products, improve existing systems, or take their digital capabilities to the next level.",
  "Our focus is not simply on what we build, but on why it matters to your business.",
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

      <section className="mx-auto w-full max-w-[92rem] px-5 py-14 sm:px-8 md:py-[4.5rem] xl:px-12">
        <div className="grid gap-10 rounded-[2.5rem] bg-surface p-7 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:p-14">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-brand sm:text-4xl">
              Building digital possibilities since 2017
            </h2>
            <p className="mt-4 text-xs font-extrabold tracking-tight text-balance">
              Ideas deserve more than a <span className="text-gradient-dark">good beginning.</span>
            </p>
          </Reveal>
          <Reveal delay={120} className="space-y-5 text-base leading-8 text-muted">
            {companyIntroduction.map((paragraph, index) => <p key={paragraph} className={index === 0 ? "text-lg text-ink/80" : ""}>{paragraph}</p>)}
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[92rem] items-center gap-14 px-5 py-14 sm:px-8 md:pt-[4.5rem] md:pb-12 lg:grid-cols-2 xl:px-12">
        <Reveal from="left" className="relative">
          <div className="grid grid-cols-2 gap-4">
            <Photo src="/images/pages/office.jpg" className="h-64 rounded-[2rem] sm:h-80" />
            <Photo src="/images/pages/team-meeting.jpg" className="mt-12 h-64 rounded-[2rem] sm:h-80" />
            <Photo src="/images/pages/coworking.jpg" className="col-span-2 h-48 rounded-[2rem] sm:h-56" />
          </div>
          <div className="bg-brand-gradient absolute top-1/2 left-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[6px] border-white text-white shadow-2xl">
            <span className="text-4xl font-extrabold">
              <YearsSinceFounding />
            </span>
            <span className="text-[0.65rem] font-bold tracking-widest uppercase">Years</span>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Eyebrow>Who we are</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Engineers at heart. <span className="text-gradient-dark">Problem-solvers by nature.</span>
          </h2>
          <div className="mt-6 space-y-4 text-base leading-8 text-muted">
            {whoWeAre.map((paragraph, index) => <p key={paragraph} className={index === 0 ? "text-lg text-ink/80" : ""}>{paragraph}</p>)}
          </div>
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

      <section className="bg-surface px-5 pt-12 sm:px-8 md:pt-16 xl:px-12">
        <div className="mx-auto w-full max-w-[92rem]">
          <Reveal className="max-w-2xl">
            <Eyebrow>Our story</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              A journey that began with <span className="text-gradient-dark">a vision.</span>
            </h2>
          </Reveal>
        </div>
      </section>

      <AboutJourney />
      <AboutStoryJourney />

      <section className="bg-surface">
        <div className="mx-auto w-full max-w-[92rem] px-5 pt-6 pb-14 sm:px-8 md:pt-8 md:pb-16 xl:px-12">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-extrabold tracking-tight text-balance sm:text-6xl">
                What makes us different
              </h2>
              <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] uppercase text-brand">
                <span className="h-0.5 w-6 rounded-full bg-brand" aria-hidden="true" />
                Beyond development. <span className="text-gradient-dark">Beyond delivery.</span>
              </p>
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
        <div className="relative mx-auto grid w-full max-w-[92rem] items-start gap-10 px-5 py-12 sm:px-8 md:py-14 lg:grid-cols-[1.2fr_0.8fr] xl:px-12">
          <Reveal>
            <Eyebrow light>Our mission</Eyebrow>
            <h2 className="mt-5 max-w-3xl text-4xl leading-[1.12] font-extrabold tracking-tight text-balance sm:text-5xl">
              Turn every idea into a product that is{" "}
              <span className="text-gradient italic">fast, beautiful, and built to last.</span>
            </h2>
          </Reveal>
          <Reveal delay={120} className="max-w-md space-y-6 lg:pt-1">
            <p className="text-sm leading-7 text-white/75">
              Stay competitive &amp; let Dramatics Digital transform your business application
              requirements. ALET India&apos;s award-winning software development service, offers
              custom Mobile &amp; Web apps development services for entrepreneurs &amp; small
              businesses. From design to development to testing and support, we provide end-to-end
              software development services to help in building apps with trusted frameworks.
            </p>
            <Link
              href="/contact-us"
              className="btn-sheen bg-brand-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
            >
              Start a project
              <Arrow />
            </Link>
          </Reveal>
        </div>
      </section>

      <AboutSolutionsJourney />

      <section className="px-5 pt-2 sm:px-8">
        <Reveal className="mx-auto max-w-[92rem] rounded-[2.5rem] bg-surface px-6 pt-7 pb-10 sm:px-12 sm:pt-8 sm:pb-12">
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

      <div className="py-14 md:py-[4.5rem]">
        <TestimonialsSection />
      </div>
    </>
  );
}
