import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CoreSolutionsList } from "@/components/core-solutions";
import { HeroActions, HeroTitle, PhotoHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { StatsBar, TestimonialsSection, yearsOfExperience } from "@/components/sections";
import { Arrow, Eyebrow, Photo } from "@/components/ui";
import { about, achievements, clients, company } from "@/lib/content";
import { aboutApproach } from "@/lib/pages";

export const metadata: Metadata = {
  title: "About Us — Alet India",
  description:
    "Alet India is a New Delhi technology partner for mobile apps, web applications, design, and digital marketing, serving clients in 20+ countries since 2017.",
};

export default function AboutPage() {
  const [story] = about.paragraphs;
  const sentences = story.split(". ");
  const lead = `${sentences.slice(0, 2).join(". ")}.`;
  const rest = sentences.slice(2).join(". ");

  return (
    <>
      <PhotoHero
        crumb="About Us"
        image="/images/pages/team-table.jpg"
        imageAlt="ALET India team collaborating around a table"
        align="bottom"
        className="min-h-[42rem] lg:min-h-[48rem]"
      >
        <HeroTitle title="Technology partner for" accent="your business" />
        <p className="rise d2 mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
          Established in {company.established}, ALET India builds mobile apps, web platforms,
          designs, and digital growth for businesses in more than 20 countries.
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
            You can be <span className="text-gradient-dark">bigger</span> with ALET INDIA
          </h2>
          <p className="mt-6 text-lg leading-8 text-ink/80">{lead}</p>
          <p className="mt-4 text-base leading-8 text-muted">{rest}</p>
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

      <section className="bg-surface">
        <div className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 md:py-24 xl:px-12">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow>Our Approach</Eyebrow>
              <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
                Built around <span className="text-gradient-dark">your goals</span>
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-muted">
              We constantly upgrade ourselves on the latest technology so every product we ship
              is in sync with your business idea.
            </p>
          </Reveal>
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {aboutApproach.map((item, index) => (
              <li key={item.title}>
                <Reveal delay={index * 90} className="h-full">
                  <article className="lift group h-full overflow-hidden rounded-[2rem] bg-white ring-1 ring-line">
                    <div className="relative h-56 overflow-hidden">
                      <div className="zoom-img absolute inset-0">
                        <Photo src={item.image} className="h-full" sizes="33vw" />
                      </div>
                      <span className="bg-brand-gradient absolute top-5 left-5 flex h-12 w-12 items-center justify-center rounded-2xl text-base font-extrabold text-white shadow-lg">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-extrabold tracking-tight sm:text-[1.35rem]">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-[0.95rem] leading-7 font-medium text-ink/75">
                        {item.body}
                      </p>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
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
              Turn every idea into a product that is{" "}
              <span className="text-gradient">fast, beautiful, and built to last.</span>
            </p>
          </Reveal>
          <Reveal delay={120} className="space-y-4">
            {about.paragraphs.slice(1).map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="line-clamp-6 text-sm leading-7 text-white/75">
                {paragraph}
              </p>
            ))}
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

      <section className="mx-auto grid w-full max-w-[92rem] items-center gap-10 px-5 py-16 sm:px-8 md:py-24 xl:grid-cols-2 xl:px-12">
        <Reveal from="left">
          <Eyebrow>ALET&apos;s Core Solution</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            From first idea to the <span className="text-gradient-dark">next upgrade</span>
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">
            A continuous cycle — we build, refine, and raise the bar so your product keeps
            winning.
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
