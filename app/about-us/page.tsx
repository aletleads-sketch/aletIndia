import type { Metadata } from "next";
import Image from "next/image";
import { CoreSolutionsList } from "@/components/core-solutions";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ProcessSection, StatsBar, TestimonialsSection } from "@/components/sections";
import { Eyebrow } from "@/components/ui";
import { about, achievements, company } from "@/lib/content";
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
      <PageHero
        crumb="About Us"
        title="Technology partner for"
        accent="your business"
        intro={`Established in ${company.established}, ALET India builds mobile apps, web platforms, designs, and digital growth for businesses in more than 20 countries.`}
        image="/images/mobile-dev.jpg"
        imageAlt="Mobile app designed by ALET India"
      />

      <StatsBar />

      <section className="mx-auto w-full max-w-[92rem] px-5 py-14 sm:px-8 md:py-20 xl:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <Eyebrow>Who we are</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              You can be <span className="text-gradient-dark">bigger</span> with ALET INDIA
            </h2>
            <p className="mt-5 text-sm font-semibold tracking-wide text-accent uppercase">
              Take first step towards your success.
            </p>
            <ul className="mt-8 flex flex-wrap items-center gap-6">
              {achievements.map((item) => (
                <li key={item.src}>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={220}
                    height={220}
                    className="h-24 w-auto object-contain transition duration-300 hover:scale-105"
                  />
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120} className="space-y-5">
            <p className="text-lg leading-8 text-ink/80">{lead}</p>
            <p className="text-base leading-8 text-muted">{rest}</p>
            {about.paragraphs.slice(1).map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="text-base leading-8 text-muted">
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-surface">
        <div className="dot-grid-light pointer-events-none absolute top-0 right-0 h-72 w-72 opacity-70" />
        <div className="relative mx-auto w-full max-w-[92rem] px-5 py-14 sm:px-8 md:py-20 xl:px-12">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Our Approach</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Built around <span className="text-gradient-dark">your goals</span>
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              We constantly upgrade ourselves on the latest technology so every product we
              ship is in sync with your business idea.
            </p>
          </Reveal>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {aboutApproach.map((item, index) => (
              <li key={item.title}>
                <Reveal delay={index * 90} className="h-full">
                  <article className="gradient-border lift h-full rounded-3xl bg-white p-8 ring-1 ring-line shadow-[0_18px_50px_-35px_rgb(30_27_75_/_0.35)]">
                    <span className="bg-brand-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-base font-extrabold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-6 text-xl font-extrabold tracking-tight text-ink sm:text-[1.35rem]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[0.95rem] leading-7 font-medium text-ink/75">
                      {item.body}
                    </p>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[92rem] items-center gap-10 px-5 py-14 sm:px-8 md:py-20 xl:grid-cols-2 xl:px-12">
        <Reveal from="left">
          <Eyebrow>ALET&apos;s Core Solution</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            From first idea to the <span className="text-gradient-dark">next upgrade</span>
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">
            A continuous cycle — we build, refine, and raise the bar so your product keeps
            winning.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <CoreSolutionsList />
        </Reveal>
      </section>

      <ProcessSection />

      <div className="py-14 md:py-20">
        <TestimonialsSection />
      </div>
    </>
  );
}
