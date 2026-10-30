import type { Metadata } from "next";
import Image from "next/image";
import { AboutDifference } from "@/components/about-difference";
import { AboutJourney } from "@/components/about-journey";
import { AboutSolutionsJourney } from "@/components/about-solutions-journey";
import { AboutStoryJourney } from "@/components/about-story-journey";
import { HeroActions, HeroTitle, PhotoHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { YearsSinceFounding } from "@/components/count-up";
import { StatsBar, TestimonialsSection } from "@/components/sections";
import { Eyebrow, Photo } from "@/components/ui";
import { achievements, clients, company } from "@/lib/content";

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

      <section className="mx-auto w-full max-w-[92rem] px-5 pt-14 pb-6 sm:px-8 md:pt-[4.5rem] md:pb-8 xl:px-12">
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

      <section className="mx-auto grid w-full max-w-[92rem] items-start gap-14 px-5 pt-4 pb-14 sm:px-8 md:pt-6 md:pb-12 lg:grid-cols-2 xl:px-12">
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
          <Reveal>
            <Eyebrow>Our story</Eyebrow>
            <h2 className="mt-4 text-[clamp(1.35rem,4.6vw,3rem)] font-extrabold tracking-tight whitespace-nowrap">
              A journey that began with <span className="text-gradient-dark">a vision.</span>
            </h2>
          </Reveal>
        </div>
      </section>

      <AboutJourney />
      <AboutStoryJourney />
      <AboutDifference />
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
