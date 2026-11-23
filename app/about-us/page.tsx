import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AboutDifference } from "@/components/about-difference";
import { AboutJourney } from "@/components/about-journey";
import { AboutSolutionsJourney } from "@/components/about-solutions-journey";
import { AboutStoryJourney } from "@/components/about-story-journey";
import { HeroActions, HeroTitle, PhotoHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { YearsSinceFounding } from "@/components/count-up";
import { StatsBar, TestimonialsSection } from "@/components/sections";
import { Arrow, Eyebrow, Photo } from "@/components/ui";
import { loadFields, loadSiteContent } from "@/lib/site-content";
import { canonical } from "@/lib/seo";
import { withSeoOverrides } from "@/lib/seo-overrides";

const baseMetadata: Metadata = {
  alternates: canonical("/about-us"),
  title: "About Us — Alet India",
  description:
    "ALET India Softwares is an India-based software development and digital solutions company building practical technology since 2017.",
};

export function generateMetadata() {
  return withSeoOverrides("/about-us", baseMetadata);
}

export default async function AboutPage() {
  const [{ achievements, clients }, hero, intro, who, story, mission, logos] = await Promise.all([
    loadSiteContent(),
    loadFields("/about-us#hero"),
    loadFields("/about-us#intro"),
    loadFields("/about-us#who_we_are"),
    loadFields("/about-us#our_story"),
    loadFields("/about-us#our_mission"),
    loadFields("/about-us#client_logos"),
  ]);
  const [photo1, photo2, photo3] = [0, 1, 2].map((index) => who.photos[index] ?? who.photos[0]);
  return (
    <>
      <PhotoHero
        crumb={hero.crumb}
        image={hero.image.src}
        imageAlt={hero.image.alt}
        align="bottom"
        className="min-h-[42rem] lg:min-h-[48rem]"
      >
        <HeroTitle title={hero.title} accent={hero.accent} />
        <p className="rise d2 mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{hero.text}</p>
        <HeroActions />
      </PhotoHero>

      <StatsBar />

      <section className="mx-auto w-full max-w-[92rem] px-5 pt-8 pb-6 sm:px-8 md:pt-6 md:pb-8 xl:px-12">
        <div className="grid gap-10 rounded-[2.5rem] bg-surface p-7 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:p-14">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-brand sm:text-4xl">
              {intro.heading}
            </h2>
            <p className="mt-4 text-xs font-extrabold tracking-tight text-balance">
              {intro.tagline} <span className="text-gradient-dark">{intro.taglineAccent}</span>
            </p>
          </Reveal>
          <Reveal delay={120} className="space-y-5 text-base leading-8 text-muted">
            {intro.paragraphs.map((paragraph, index) => <p key={paragraph} className={index === 0 ? "text-lg text-ink/80" : ""}>{paragraph}</p>)}
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[92rem] items-start gap-14 px-5 pt-4 pb-10 sm:px-8 md:pt-6 md:pb-8 lg:grid-cols-2 xl:px-12">
        <Reveal from="left" className="relative">
          <div className="grid grid-cols-2 gap-4">
            <Photo src={photo1.src} alt={photo1.alt} className="h-64 rounded-[2rem] sm:h-80" />
            <Photo src={photo2.src} alt={photo2.alt} className="mt-12 h-64 rounded-[2rem] sm:h-80" />
            <Photo src={photo3.src} alt={photo3.alt} className="col-span-2 h-48 rounded-[2rem] sm:h-56" />
          </div>
          <div className="bg-brand-gradient absolute top-1/2 left-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[6px] border-white text-white shadow-2xl">
            <span className="text-4xl font-extrabold">
              <YearsSinceFounding />
            </span>
            <span className="text-[0.65rem] font-bold tracking-widest uppercase">{who.yearsLabel}</span>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Eyebrow>{who.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {who.title} <span className="text-gradient-dark">{who.accent}</span>
          </h2>
          <div className="mt-6 space-y-4 text-base leading-8 text-muted">
            {who.paragraphs.map((paragraph, index) => <p key={paragraph} className={index === 0 ? "text-lg text-ink/80" : ""}>{paragraph}</p>)}
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

      <section className="bg-surface px-5 pt-10 sm:px-8 md:pt-12 xl:px-12">
        <div className="mx-auto w-full max-w-[92rem]">
          <Reveal>
            <Eyebrow>{story.eyebrow}</Eyebrow>
            <h2 className="mt-4 max-w-full text-[clamp(1.35rem,4.6vw,3rem)] font-extrabold tracking-tight text-balance">
              {story.title} <span className="text-gradient-dark">{story.accent}</span>
            </h2>
          </Reveal>
        </div>
      </section>

      <AboutJourney />
      <AboutStoryJourney />
      <AboutDifference />

      <section className="relative mt-6 overflow-hidden text-white md:mt-8">
        <Image
          src={mission.image.src}
          alt={mission.image.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-brand/60" />
        <div className="relative mx-auto grid w-full max-w-[92rem] items-start gap-10 px-5 py-10 sm:px-8 md:py-12 lg:grid-cols-[1.2fr_0.8fr] xl:px-12">
          <Reveal>
            <Eyebrow light>{mission.eyebrow}</Eyebrow>
            <h2 className="mt-5 max-w-3xl text-4xl leading-[1.12] font-extrabold tracking-tight text-balance sm:text-5xl">
              {mission.title}{" "}
              <span className="text-gradient">{mission.accent}</span>
            </h2>
          </Reveal>
          <Reveal delay={120} className="max-w-md space-y-6 lg:pt-1">
            <p className="text-sm leading-7 text-white/75">{mission.text}</p>
            <Link
              href={mission.button.href}
              className="btn-sheen bg-brand-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
            >
              {mission.button.label}
              <Arrow />
            </Link>
          </Reveal>
        </div>
      </section>

      <AboutSolutionsJourney />

      <section className="px-5 pt-2 sm:px-8">
        <Reveal className="mx-auto max-w-[92rem] rounded-[2.5rem] bg-surface px-6 pt-7 pb-10 sm:px-12 sm:pt-8 sm:pb-12">
          <p className="text-center text-xs font-bold tracking-[0.22em] text-muted uppercase">
            {logos.heading}
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

      <div className="pt-10 pb-10 md:pt-10 md:pb-14">
        <TestimonialsSection />
      </div>
    </>
  );
}
