import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { CountUp } from "@/components/count-up";
import { InquireForm } from "@/components/inquire-form";
import { Reveal } from "@/components/reveal";
import { TestimonialSlider } from "@/components/testimonial-slider";
import { Arrow, Eyebrow } from "@/components/ui";
import { company, ideology, process as processSteps, services, stats } from "@/lib/content";

export const yearsOfExperience = 2026 - company.established;

type Service = (typeof services)[number];

export function StatsBar() {
  const items = [
    { label: "Years of Experience", value: yearsOfExperience },
    ...stats.map((stat) => ({
      label:
        stat.label === "Clients"
          ? "Happy Clients"
          : stat.label === "Projects"
            ? "Projects Delivered"
            : "Countries Served",
      value: stat.value,
    })),
  ];

  return (
    <section className="relative z-10 -mt-20 px-5 sm:px-8">
      <Reveal className="mx-auto grid max-w-[92rem] grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line shadow-[0_30px_70px_-25px_rgb(30_27_75_/_0.35)] lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="bg-white px-6 py-6 text-center sm:py-8">
            <p className="text-gradient-dark text-4xl font-extrabold tracking-tight sm:text-5xl">
              <CountUp value={item.value} />+
            </p>
            <p className="mt-2 text-sm font-medium text-muted">{item.label}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="gradient-border lift group relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-3xl bg-white">
      {service.image ? (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <Image
            src={service.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="scale-105 object-cover blur-[1px] transition duration-700 group-hover:scale-110 group-hover:blur-[0.5px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/65 via-white/72 to-white/82" />
        </div>
      ) : null}
      <div className="relative flex h-full flex-col p-8">
        <h3 className="text-xl font-extrabold tracking-tight text-ink sm:text-[1.35rem]">
          {service.title}
        </h3>
        <p className="mt-3 flex-1 text-[0.95rem] leading-7 font-medium text-ink/80">
          {service.description}
        </p>
        {"channels" in service && service.channels ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {service.channels.map((channel) => (
              <li
                key={channel}
                className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand shadow-sm ring-1 ring-line"
              >
                {channel}
              </li>
            ))}
          </ul>
        ) : null}
        <Link
          href={`/${service.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-brand after:absolute after:inset-0"
        >
          Explore Now
          <span className="transition duration-300 group-hover:translate-x-1.5">
            <Arrow />
          </span>
        </Link>
      </div>
    </article>
  );
}

export function ProcessSection({
  title = "Requirements to",
  accent = "delivery",
  showIdeology = true,
}: {
  title?: string;
  accent?: string;
  showIdeology?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-night text-white">
      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="orb pointer-events-none absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-violet/25 blur-3xl" />
      <div className="relative mx-auto w-full max-w-[92rem] px-5 py-14 sm:px-8 md:py-20 xl:px-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow light>Our Innovative Ideology</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {title} <span className="text-gradient">{accent}</span>
          </h2>
          <p className="mt-4 text-base text-white/65">
            That makes us top performer in the industry
          </p>
        </Reveal>

        <div className="relative mt-10">
          <div
            className="absolute top-7 right-[10%] left-[10%] hidden h-0.5 origin-left scale-x-100 bg-gradient-to-r from-brand via-brand-2 to-violet lg:block"
            aria-hidden="true"
          />
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {processSteps.map((step, index) => (
              <li key={step.title}>
                <Reveal delay={index * 80} className="group relative text-center">
                  <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-night-2 text-lg font-extrabold transition duration-500 group-hover:scale-110 group-hover:border-brand-2 group-hover:bg-brand-2 group-hover:text-night">
                    0{index + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-white/60">
                    {step.description}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        {showIdeology ? (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ideology.map((item, index) => (
              <li key={item}>
                <Reveal
                  delay={index * 80}
                  className="glass flex h-full items-center gap-4 rounded-2xl px-5 py-5"
                >
                  <span className="bg-brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold">
                    {index + 1}
                  </span>
                  <span className="font-semibold">{item}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="px-5 sm:px-8">
      <div className="hero-mesh relative mx-auto max-w-[92rem] overflow-hidden rounded-[2rem] px-5 py-7 [overflow-anchor:none] sm:px-10 sm:py-8 lg:px-12">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="relative">
          <Eyebrow light>Words of appreciation from our clients</Eyebrow>
          <div className="mt-5">
            <TestimonialSlider />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactSection({
  title = "Let's build something",
  accent = "remarkable",
  defaultService,
}: {
  title?: string;
  accent?: string;
  defaultService?: string;
}) {
  return (
    <section id="contact" className="scroll-mt-24 px-5 py-14 sm:px-8 md:py-20 xl:px-12">
      <div className="relative mx-auto grid max-w-[92rem] gap-8 overflow-hidden rounded-[2.5rem] bg-night px-6 py-12 text-white sm:px-14 sm:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <div className="orb pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-brand/40 blur-3xl" />
        <div className="orb orb-b pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-brand-2/30 blur-3xl" />
        <Reveal className="relative flex h-full min-h-0 flex-col">
          <div className="shrink-0">
            <Eyebrow light>Contact us</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {title} <span className="text-gradient">{accent}</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/70">
              Tell us about your project, budget, and timeline. We&apos;ll review your inquiry
              and get back with next steps.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="glass rounded-2xl px-5 py-4">
                <p className="text-xs font-bold tracking-[0.16em] text-brand-2 uppercase">
                  Avg. response
                </p>
                <p className="mt-2 text-2xl font-extrabold">Under 24 hrs</p>
              </div>
              <div className="glass rounded-2xl px-5 py-4">
                <p className="text-xs font-bold tracking-[0.16em] text-brand-2 uppercase">
                  Free consult
                </p>
                <p className="mt-2 text-2xl font-extrabold">No obligation</p>
              </div>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-white/75">
              {[
                "Mobile, web, UI/UX & marketing under one roof",
                "Dedicated project manager from day one",
                "Transparent timelines and milestone updates",
              ].map((point) => (
                <li key={point} className="flex gap-3">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-2"
                    aria-hidden="true"
                  />
                  {point}
                </li>
              ))}
            </ul>

            <dl className="mt-8 space-y-4">
              <ContactRow label="Phone">
                <a href={company.phoneHref} className="hover:text-brand-2">
                  {company.phone}
                </a>
              </ContactRow>
              <ContactRow label="Email">
                <a href={`mailto:${company.email}`} className="hover:text-brand-2">
                  {company.email}
                </a>
              </ContactRow>
              <ContactRow label="Address">{company.address}</ContactRow>
            </dl>

            <a
              href={company.phoneHref}
              className="btn-sheen bg-brand-gradient mt-8 inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              Call {company.phone}
            </a>
          </div>
          <div className="relative mt-8 min-h-[14rem] flex-1 overflow-hidden rounded-[2rem] border border-white/10 lg:min-h-0">
            <Image
              src="/images/pages/contact-us-office.jpg"
              alt="ALET India contact team and office details"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </Reveal>
        <Reveal delay={120} className="relative h-full">
          <InquireForm defaultService={defaultService} />
        </Reveal>
      </div>
    </section>
  );
}

function ContactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="glass flex flex-col gap-1 rounded-2xl px-5 py-4">
      <dt className="text-xs font-bold tracking-[0.16em] text-brand-2 uppercase">{label}</dt>
      <dd className="text-sm leading-6 text-white/90">{children}</dd>
    </div>
  );
}
