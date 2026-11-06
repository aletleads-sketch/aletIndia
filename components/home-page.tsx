import Image from "next/image";
import { AboutSolutionsJourney } from "@/components/about-solutions-journey";
import { JourneyTimeline } from "@/components/journey-timeline";
import Link from "next/link";
import { PortfolioSlider } from "@/components/portfolio-slider";
import { Reveal } from "@/components/reveal";
import {
  ContactSection,
  ProcessSection,
  StatsBar,
  TestimonialsSection,
} from "@/components/sections";
import { Arrow, Eyebrow } from "@/components/ui";
import { WordRotator } from "@/components/word-rotator";
import { loadFields, loadSectionLayout, loadSiteContent } from "@/lib/site-content";

/** The homepage's sections by their key in public.page_sections, in the code's order. */
const SECTIONS = {
  hero: Hero,
  stats_bar: StatsBar,
  client_logos: ClientMarquee,
  services: Services,
  journey_timeline: JourneyTimeline,
  solution_lifecycle: WhyAlet,
  work: Work,
  process: ProcessSection,
  industries: Industries,
  testimonials: TestimonialsSection,
  about: About,
  faqs: Faq,
  contact_form: ContactSection,
} as const;

/** The admin's Edit Homepage screen can reorder these sections and switch them off. */
export async function HomePage() {
  const keys = await loadSectionLayout("/", Object.keys(SECTIONS));
  return (
    <div id="top">
      {keys.map((key) => {
        const Section = SECTIONS[key as keyof typeof SECTIONS];
        return <Section key={key} />;
      })}
    </div>
  );
}

async function Hero() {
  const [{ hero, company }, copy] = await Promise.all([loadSiteContent(), loadFields("/#hero")]);
  return (
    <section className="hero-mesh relative overflow-hidden text-white">
      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="orb pointer-events-none absolute top-20 -right-24 h-96 w-96 rounded-full bg-brand/40 blur-3xl" />
      <div className="orb orb-b pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-2/30 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-[92rem] items-center gap-12 px-5 pt-32 pb-28 sm:px-8 xl:px-12 lg:grid-cols-[1.05fr_0.95fr] lg:pt-36 lg:pb-32">
        <div>
          <p className="rise glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-white/90">
            <span className="pulse-dot" aria-hidden="true" />
            {hero.lead} {hero.leadAccent} · {copy.since} {company.established}
          </p>
          <h1 className="rise d1 mt-7 text-5xl leading-[1.04] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {copy.titleBefore} <span className="text-gradient">{copy.titleAccent}</span> {copy.titleAfter}
            <span className="mt-4 block text-lg leading-snug font-semibold tracking-normal text-white/75 sm:text-xl">
              {copy.subtitle}
            </span>
          </h1>
          <p className="rise d2 mt-6 text-2xl font-semibold text-white/90 sm:text-3xl">
            {copy.weBuild} <WordRotator words={hero.rotating} />
          </p>
          <p className="rise d3 mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
            {copy.text}
          </p>
          <div className="rise d4 mt-9 flex flex-wrap gap-3">
            <a
              href={copy.primaryButton.href}
              className="btn-sheen bg-brand-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_-8px_rgb(79_70_229_/_0.8)] transition hover:-translate-y-0.5"
            >
              {copy.primaryButton.label}
              <Arrow />
            </a>
            <a
              href={copy.secondaryButton.href}
              className="glass inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              {copy.secondaryButton.label}
            </a>
          </div>
          <div className="rise d5 mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {copy.people.map(
                ({ src }) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={48}
                    height={48}
                    className="h-11 w-11 rounded-full border-2 border-night bg-white object-cover"
                  />
                ),
              )}
            </div>
            <p className="text-sm text-white/70">
              <span className="font-bold text-white">{copy.trustBold}</span> {copy.trustText}
            </p>
          </div>
        </div>

        <div className="rise d2 relative mx-auto w-full max-w-xl">
          <div
            className="spin-slow pointer-events-none absolute -inset-10 rounded-full border border-dashed border-white/15"
            aria-hidden="true"
          />
          <div className="relative rotate-[-3deg] rounded-[2rem] bg-white p-5 shadow-[0_40px_80px_-20px_rgb(0_0_0_/_0.6)] sm:p-7">
            <div className="mb-4 flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <Image
              src={copy.image.src}
              alt={copy.image.alt}
              width={1280}
              height={720}
              priority
              className="h-auto w-full"
            />
          </div>

          <Image
            src={copy.phoneLeft.src}
            alt={copy.phoneLeft.alt}
            width={280}
            height={560}
            className="float absolute -bottom-24 -left-6 w-24 drop-shadow-[0_25px_35px_rgb(0_0_0_/_0.55)] sm:-left-16 sm:w-24"
            style={{ ["--tilt" as string]: "-6deg" }}
          />
          <Image
            src={copy.phoneRight.src}
            alt={copy.phoneRight.alt}
            width={1024}
            height={1536}
            className="float float-b absolute -right-2 -bottom-24 w-24 drop-shadow-[0_25px_35px_rgb(0_0_0_/_0.55)] sm:-right-10 sm:w-24"
            style={{ ["--tilt" as string]: "6deg" }}
          />

          <div className="float float-c absolute -top-8 right-6 z-10 flex items-center gap-3 rounded-2xl border border-white/15 bg-night-2/95 px-4 py-3 shadow-[0_20px_40px_-10px_rgb(0_0_0_/_0.6)] backdrop-blur sm:-right-6">
            <span className="bg-brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="m5 12.5 4.5 4.5L19 7.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>
              <span className="block text-lg leading-none font-extrabold">{copy.badge1Value}</span>
              <span className="text-xs text-white/70">{copy.badge1Label}</span>
            </span>
          </div>

          <div className="float float-b absolute -bottom-14 left-[30%] z-10 hidden items-center gap-3 rounded-2xl border border-white/15 bg-night-2/95 px-4 py-3 shadow-[0_20px_40px_-10px_rgb(0_0_0_/_0.6)] backdrop-blur sm:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7L12 3Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span>
              <span className="block text-sm leading-none font-bold">{copy.badge2Title}</span>
              <span className="text-xs text-white/70">{copy.badge2Label}</span>
            </span>
          </div>
        </div>
      </div>

      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-16 w-full fill-white"
      >
        <path d="M0 80V40C240 0 480 0 720 30s480 50 720 10v40H0Z" />
      </svg>
    </section>
  );
}

async function ClientMarquee() {
  const [{ clients }, copy] = await Promise.all([loadSiteContent(), loadFields("/#client_logos")]);
  return (
    <section className="py-10 sm:py-12" aria-label="Our clients">
      <p className="text-center text-xs font-bold tracking-[0.22em] text-muted uppercase">
        {copy.heading}
      </p>
      <div className="marquee mx-auto mt-6 max-w-[92rem]">
        <ul className="marquee-track items-center gap-6 pr-6">
          {[...clients, ...clients].map((client, index) => (
            <li
              key={`${client.logo}-${index}`}
              className="flex h-20 w-44 shrink-0 items-center justify-center rounded-2xl border border-line bg-white px-5 grayscale transition duration-300 hover:grayscale-0"
            >
              <Image
                src={client.logo}
                alt={index < clients.length ? client.name : ""}
                width={154}
                height={88}
                className="max-h-[3.3rem] w-auto object-contain"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function Services() {
  const [{ services }, copy] = await Promise.all([loadSiteContent(), loadFields("/#services")]);
  return (
    <section id="services" className="relative scroll-mt-24 overflow-hidden bg-surface">
      <div className="dot-grid-light pointer-events-none absolute top-0 right-0 h-72 w-72 opacity-70" />
      <div className="relative mx-auto w-full max-w-[92rem] px-5 py-10 sm:px-8 md:py-14 xl:px-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {copy.title}{" "}
            <span className="text-gradient-dark">{copy.accent}</span>
          </h2>
          <p className="mt-4 text-base leading-7 text-muted">{copy.text}</p>
        </Reveal>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <li key={service.id} id={service.id} className="scroll-mt-28">
              <Reveal delay={(index % 3) * 90} className="h-full">
                <Link
                  href={`/${service.slug}`}
                  className="group relative flex h-72 items-end overflow-hidden rounded-[1.75rem] text-white sm:h-80"
                >
                  <Image
                    src={service.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/15" />
                  <div className="relative p-7">
                    <h3 className="text-2xl font-extrabold tracking-tight">{service.title}</h3>
                    <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
                      {copy.explore}
                      <span className="transition duration-300 group-hover:translate-x-1.5">
                        <Arrow />
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function WhyAlet() {
  return (
    <div id="solutions" className="scroll-mt-24">
      <AboutSolutionsJourney />
    </div>
  );
}

async function Work() {
  const copy = await loadFields("/#work");
  return (
    <section id="work" className="scroll-mt-24 overflow-hidden bg-surface py-10 md:py-14">
      <div className="mx-auto w-full max-w-[92rem] px-5 sm:px-8 xl:px-12">
        <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl">
              {copy.title} <span className="text-gradient-dark">{copy.accent}</span>
            </h2>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <p className="max-w-xs text-sm text-muted sm:text-right sm:text-base">
              {copy.text}
            </p>
            <Link
              href={copy.link.href}
              className="inline-flex items-center gap-2 text-sm font-extrabold text-brand"
            >
              {copy.link.label}
              <Arrow />
            </Link>
          </div>
        </Reveal>
      </div>
      <PortfolioSlider />
    </section>
  );
}

async function Industries() {
  const [{ achievements, industries }, copy] = await Promise.all([loadSiteContent(), loadFields("/#industries")]);
  return (
    <section className="mx-auto w-full max-w-[92rem] px-5 py-10 sm:px-8 md:py-14 xl:px-12">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {copy.title} <span className="text-gradient-dark">{copy.accent}</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-muted">
            {copy.text}
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

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {industries.map((industry, index) => (
            <li key={industry.name}>
              <Reveal delay={(index % 4) * 70} className="h-full">
                <div className="gradient-border lift group relative flex h-full min-h-32 flex-col justify-between overflow-hidden rounded-2xl bg-white p-5">
                  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <Image
                      src={industry.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="scale-105 object-cover blur-[1px] transition duration-700 group-hover:scale-110 group-hover:blur-[0.5px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/65 via-white/72 to-white/82" />
                  </div>
                  <span className="relative text-xs font-extrabold text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="relative mt-6 text-[0.95rem] leading-snug font-extrabold text-ink">
                    {industry.name}
                  </span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function About() {
  const [{ about }, copy] = await Promise.all([loadSiteContent(), loadFields("/#about")]);
  return (
    <section id="about" className="mx-auto w-full max-w-[92rem] scroll-mt-24 px-5 py-10 sm:px-8 md:py-14 xl:px-12">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {copy.titleBefore} <span className="text-gradient-dark">{copy.titleAccent}</span> {copy.titleAfter}
          </h2>
          <p className="mt-5 text-sm font-semibold tracking-wide text-accent uppercase">
            {copy.tagline}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <p className="text-lg leading-8 text-ink/80">
            {copy.intro}
          </p>
          <details className="group mt-6">
            <summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-brand">
              {copy.readMore}
              <span className="faq-icon text-lg leading-none transition duration-300">+</span>
            </summary>
            <div className="mt-6 space-y-5">
              {about.story.map((block) => {
                if (block.type === "title") {
                  return (
                    <p key={block.text} className="text-lg leading-8 font-extrabold tracking-tight text-ink">
                      {block.text}
                    </p>
                  );
                }
                if (block.type === "h3") {
                  return (
                    <h3 key={block.text} className="pt-2 text-xl font-extrabold tracking-tight text-ink">
                      {block.text}
                    </h3>
                  );
                }
                if (block.type === "closing") {
                  return (
                    <p key={block.text} className="pt-1 text-base leading-8 font-extrabold text-ink">
                      {block.text}
                    </p>
                  );
                }
                return (
                  <p key={block.text.slice(0, 48)} className="text-base leading-8 text-muted">
                    {block.text}
                  </p>
                );
              })}
            </div>
          </details>
          <Link
            href={copy.link.href}
            className="mt-6 flex w-fit items-center gap-2 text-sm font-extrabold text-brand"
          >
            {copy.link.label}
            <Arrow />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

async function Faq() {
  const [{ company, faqs }, copy] = await Promise.all([loadSiteContent(), loadFields("/#faqs")]);
  return (
    <section className="bg-surface">
      <div className="mx-auto grid w-full max-w-[92rem] items-stretch gap-8 px-5 py-10 sm:px-8 md:py-14 xl:px-12 lg:grid-cols-2 lg:gap-10">
        <Reveal className="flex h-full flex-col">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {copy.title} <span className="text-gradient-dark">{copy.accent}</span>
          </h2>
          <p className="mt-5 text-base leading-7 text-muted">
            {copy.stillCurious}{" "}
            <a href={`mailto:${company.email}`} className="font-semibold text-brand">
              {company.email}
            </a>
            .
          </p>
          <div className="relative mt-8 min-h-64 w-full flex-1 overflow-hidden rounded-2xl max-lg:aspect-[4/5] lg:min-h-0">
            <Image
              src={copy.image.src}
              alt={copy.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover object-center"
            />
          </div>
        </Reveal>
        <ul className="space-y-3">
          {faqs.map((faq, index) => (
            <li key={faq.question}>
              <Reveal delay={index * 60}>
                <details className="group rounded-2xl border border-line bg-white px-6 py-5 transition open:shadow-[0_20px_50px_-30px_rgb(30_27_75_/_0.4)]">
                  <summary className="flex cursor-pointer items-center justify-between gap-6 text-base font-bold">
                    {faq.question}
                    <span className="faq-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-lg text-brand transition duration-300 group-open:bg-brand group-open:text-white">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-muted">{faq.answer}</p>
                </details>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
