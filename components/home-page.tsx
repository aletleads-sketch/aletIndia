import Image from "next/image";
import { CoreSolutionsList } from "@/components/core-solutions";
import Link from "next/link";
import { PortfolioSlider } from "@/components/portfolio-slider";
import { Reveal } from "@/components/reveal";
import {
  ContactSection,
  ProcessSection,
  ServiceCard,
  StatsBar,
  TestimonialsSection,
  yearsOfExperience,
} from "@/components/sections";
import { Arrow, Eyebrow } from "@/components/ui";
import { WordRotator } from "@/components/word-rotator";
import { about, achievements, clients, company, faqs, hero, industries, services } from "@/lib/content";

export function HomePage() {
  return (
    <div id="top">
      <Hero />
      <StatsBar />
      <ClientMarquee />
      <Services />
      <WhyAlet />
      <Work />
      <ProcessSection />
      <Industries />
      <TestimonialsSection />
      <About />
      <Faq />
      <ContactSection />
    </div>
  );
}

function Hero() {
  return (
    <section className="hero-mesh relative overflow-hidden text-white">
      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="orb pointer-events-none absolute top-20 -right-24 h-96 w-96 rounded-full bg-brand/40 blur-3xl" />
      <div className="orb orb-b pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-2/30 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-[92rem] items-center gap-12 px-5 pt-32 pb-28 sm:px-8 xl:px-12 lg:grid-cols-[1.05fr_0.95fr] lg:pt-36 lg:pb-32">
        <div>
          <p className="rise glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-white/90">
            <span className="pulse-dot" aria-hidden="true" />
            {hero.lead} {hero.leadAccent} · Since {company.established}
          </p>
          <h1 className="rise d1 mt-7 text-5xl leading-[1.04] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Your Trusted <span className="text-gradient">Technology</span> Partner
          </h1>
          <p className="rise d2 mt-6 text-2xl font-semibold text-white/90 sm:text-3xl">
            We build <WordRotator words={hero.rotating} />
          </p>
          <p className="rise d3 mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
            {hero.paragraphs[0]}
          </p>
          <div className="rise d4 mt-9 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="btn-sheen bg-brand-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_-8px_rgb(79_70_229_/_0.8)] transition hover:-translate-y-0.5"
            >
              Get a Free Consultation
              <Arrow />
            </a>
            <a
              href="#work"
              className="glass inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              View Our Work
            </a>
          </div>
          <div className="rise d5 mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {["/images/people/rk.jpg", "/images/people/aadi.jpg", "/images/people/mayank.png"].map(
                (src) => (
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
              <span className="font-bold text-white">500+ clients</span> across 20+
              countries trust ALET India
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
              src="/images/hero-technologies.jpg"
              alt="AI, cloud, web, mobile and modern technology services"
              width={1280}
              height={720}
              priority
              className="h-auto w-full"
            />
          </div>

          <Image
            src="/images/work/tajika-1.png"
            alt="Tajika mobile app"
            width={280}
            height={560}
            className="float absolute -bottom-24 -left-6 w-24 drop-shadow-[0_25px_35px_rgb(0_0_0_/_0.55)] sm:-left-16 sm:w-28"
            style={{ ["--tilt" as string]: "-6deg" }}
          />
          <Image
            src="/images/work/app-1.png"
            alt="Cricket FabtasyBuzz mobile app"
            width={280}
            height={560}
            className="float float-b absolute -right-4 -bottom-28 w-24 drop-shadow-[0_25px_35px_rgb(0_0_0_/_0.55)] sm:-right-14 sm:w-28"
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
              <span className="block text-lg leading-none font-extrabold">1,000+</span>
              <span className="text-xs text-white/70">Projects delivered</span>
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
              <span className="block text-sm leading-none font-bold">Clutch</span>
              <span className="text-xs text-white/70">Clients say we deliver</span>
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

function ClientMarquee() {
  return (
    <section className="py-10 sm:py-12" aria-label="Our clients">
      <p className="text-center text-xs font-bold tracking-[0.22em] text-muted uppercase">
        Driving technology for our clients
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

function Services() {
  return (
    <section id="services" className="relative scroll-mt-24 overflow-hidden bg-surface">
      <div className="dot-grid-light pointer-events-none absolute top-0 right-0 h-72 w-72 opacity-70" />
      <div className="relative mx-auto w-full max-w-[92rem] px-5 py-14 sm:px-8 md:py-20 xl:px-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Our Services</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Building digital products that{" "}
            <span className="text-gradient-dark">grow your business</span>
          </h2>
          <p className="mt-4 text-base leading-7 text-muted">{hero.paragraphs[1]}</p>
        </Reveal>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <li key={service.id} id={service.id} className="scroll-mt-28">
              <Reveal delay={(index % 3) * 90} className="h-full">
                <ServiceCard service={service} />
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
    <section
      id="solutions"
      className="relative overflow-hidden scroll-mt-24 bg-surface"
    >
      <div
        className="pointer-events-none absolute -top-24 left-0 h-72 w-72 rounded-full bg-brand/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 -bottom-28 h-80 w-80 rounded-full bg-brand-2/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-[92rem] items-center gap-10 px-5 py-14 sm:px-8 md:py-20 xl:grid-cols-2 xl:px-12">
        <Reveal className="relative mx-auto w-full max-w-xl xl:mx-0" from="left">
          <div className="solution-stage relative">
            <div
              className="bg-brand-gradient absolute -inset-3 rotate-[3deg] rounded-[2.5rem] opacity-95"
              aria-hidden="true"
            />
            <div
              className="solution-orb orb absolute -top-8 -left-6 h-28 w-28 rounded-full bg-brand-2/50 blur-2xl"
              aria-hidden="true"
            />
            <div
              className="solution-orb orb-b absolute -right-4 top-16 h-24 w-24 rounded-full bg-violet/45 blur-2xl"
              aria-hidden="true"
            />

            <div className="group relative overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-30px_rgb(30_27_75_/_0.55)]">
              <Image
                src="/images/mobile-dev.jpg"
                alt="Mobile shopping application designed by ALET India"
                width={1200}
                height={900}
                className="zoom-img h-[26rem] w-full object-cover sm:h-[28rem]"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-night/25 via-transparent to-brand/20"
                aria-hidden="true"
              />
              <div
                className="solution-scan pointer-events-none absolute inset-x-0 h-24 opacity-40"
                aria-hidden="true"
              />
            </div>

            <div className="float absolute -left-3 top-8 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-[0_18px_40px_-18px_rgb(30_27_75_/_0.45)] backdrop-blur sm:-left-6">
              <p className="text-[0.65rem] font-bold tracking-[0.16em] text-muted uppercase">
                Idea → Build
              </p>
              <p className="mt-1 text-sm font-extrabold text-ink">Ship faster</p>
            </div>

            <div className="float float-b absolute -right-3 -bottom-6 rounded-2xl bg-white p-5 shadow-[0_25px_50px_-15px_rgb(30_27_75_/_0.4)] sm:-right-6 sm:-bottom-8">
              <p className="text-gradient-dark text-3xl font-extrabold">
                {yearsOfExperience}+ years
              </p>
              <p className="mt-1 text-sm text-muted">
                Building since {company.established}
              </p>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal from="right">
            <Eyebrow>ALET&apos;s Core Solution</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              From first idea to the{" "}
              <span className="text-gradient-dark">next upgrade</span>
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted">
              A continuous cycle — we build, refine, and raise the bar so your product
              keeps winning.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <CoreSolutionsList />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="work" className="scroll-mt-24 overflow-hidden bg-surface py-14 md:py-20">
      <div className="mx-auto w-full max-w-[92rem] px-5 sm:px-8 xl:px-12">
        <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Portfolio</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl">
              Products we&apos;ve <span className="text-gradient-dark">brought to life</span>
            </h2>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <p className="max-w-xs text-sm text-muted sm:text-right sm:text-base">
              Real apps for real clients — drag or scroll to explore.
            </p>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-brand"
            >
              View all projects
              <Arrow />
            </Link>
          </div>
        </Reveal>
      </div>
      <PortfolioSlider />
    </section>
  );
}

function Industries() {
  return (
    <section className="mx-auto w-full max-w-[92rem] px-5 py-14 sm:px-8 md:py-20 xl:px-12">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <Eyebrow>Industries</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Your industry doesn&apos;t matter. <span className="text-gradient-dark">We make it real.</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-muted">
            We have built apps for almost every category of the App Store, from travel
            and pharma to fantasy sports and on-demand delivery.
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

function About() {
  return (
    <section id="about" className="mx-auto w-full max-w-[92rem] scroll-mt-24 px-5 py-14 sm:px-8 md:py-20 xl:px-12">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <Eyebrow>{about.title}</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            You can be <span className="text-gradient-dark">bigger</span> with ALET INDIA
          </h2>
          <p className="mt-5 text-sm font-semibold tracking-wide text-accent uppercase">
            Take first step towards your success.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <p className="text-lg leading-8 text-ink/80">
            {about.paragraphs[0].split(". ").slice(0, 2).join(". ")}.
          </p>
          <details className="group mt-6">
            <summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-brand">
              Read our full story
              <span className="faq-icon text-lg leading-none transition duration-300">+</span>
            </summary>
            <div className="mt-6 space-y-5">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-base leading-8 text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </details>
          <Link
            href="/about-us"
            className="mt-6 flex w-fit items-center gap-2 text-sm font-extrabold text-brand"
          >
            More about ALET India
            <Arrow />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="bg-surface">
      <div className="mx-auto grid w-full max-w-[92rem] gap-8 px-5 py-14 sm:px-8 md:py-20 xl:px-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <Eyebrow>FAQs</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Questions, <span className="text-gradient-dark">answered</span>
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-muted">
            Still curious? Write to{" "}
            <a href={`mailto:${company.email}`} className="font-semibold text-brand">
              {company.email}
            </a>
            .
          </p>
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
