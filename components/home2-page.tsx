import Image from "next/image";
import { CountUp } from "@/components/count-up";
import { InquireForm } from "@/components/inquire-form";
import { Reveal } from "@/components/reveal";
import {
  about,
  achievements,
  caseStudies,
  clients,
  company,
  coreSolutions,
  industries,
  process,
  services,
  stats,
  testimonials,
} from "@/lib/content";

/** Sample 2 — Soft studio: mist, deep teal + coral, wide cinematic layout */
export function Home2Page() {
  return (
    <div id="top" className="font-space bg-[#f0f5f4] text-[#0a2e2a]">
      <section className="relative min-h-[100svh] overflow-hidden">
        <div
          className="glow-breathe pointer-events-none absolute -top-20 -left-20 h-[30rem] w-[30rem] rounded-full bg-teal-400/25 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="glow-breathe pointer-events-none absolute top-40 -right-16 h-[26rem] w-[26rem] rounded-full bg-[#ff6b4a]/20 blur-3xl"
          style={{ animationDelay: "-2.5s" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgb(13 78 74 / 0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />

        <div className="shell relative grid items-center gap-14 pt-36 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:pt-40 lg:pb-32 xl:gap-20">
          <div>
            <p className="rise inline-flex items-center gap-2.5 rounded-full border border-teal-900/10 bg-white/80 px-4 py-2 text-xs font-bold tracking-[0.2em] text-teal-800 uppercase shadow-sm backdrop-blur">
              <span className="pulse-dot !bg-[#ff6b4a]" aria-hidden="true" />
              {company.tagline}
            </p>
            <h1 className="slide-x d1 mt-8 text-[clamp(2.9rem,6.5vw,5.75rem)] leading-[0.95] font-bold tracking-tight text-balance">
              Transform how your business{" "}
              <span className="relative inline-block text-teal-700">
                operates
                <span
                  className="absolute inset-x-0 bottom-2 -z-10 h-3 origin-left scale-x-100 bg-[#ff6b4a]/35"
                  aria-hidden="true"
                />
              </span>
            </h1>
            <p className="rise d2 mt-7 max-w-xl text-lg leading-8 text-teal-900/65 sm:text-xl">
              We empower companies to stay ahead — modernizing technology, reimagining
              processes, and transforming experiences through mobile, web, and design.
            </p>
            <div className="rise d3 mt-10 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="btn-sheen inline-flex rounded-full bg-teal-800 px-8 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_-12px_rgb(15_118_110_/_0.55)] transition hover:-translate-y-1 hover:bg-teal-700"
              >
                Book a Call
              </a>
              <a
                href="#work"
                className="inline-flex rounded-full border border-teal-900/10 bg-white/90 px-8 py-3.5 text-sm font-bold text-teal-900 shadow-sm transition hover:-translate-y-1"
              >
                Our Work
              </a>
            </div>
            <dl className="rise d4 mt-14 grid grid-cols-3 gap-6 border-t border-teal-900/10 pt-10 sm:max-w-lg">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[0.65rem] font-bold tracking-[0.18em] text-teal-700/60 uppercase">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-3xl font-bold text-teal-900 sm:text-4xl">
                    <CountUp value={stat.value} />+
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="scale-in d2 relative mx-auto w-full max-w-lg xl:max-w-none">
            <div className="relative overflow-hidden rounded-[2.75rem] bg-white shadow-[0_50px_100px_-40px_rgb(10_46_42_/_0.4)]">
              <Image
                src="/images/banner.png"
                alt="Technology services"
                width={980}
                height={420}
                priority
                className="h-auto w-full p-6 sm:p-8"
              />
              <div className="flex items-center gap-4 border-t border-teal-900/5 px-6 py-5 sm:px-8">
                <Image
                  src="/images/work/tajika-1.png"
                  alt=""
                  width={80}
                  height={160}
                  className="float h-24 w-auto"
                />
                <div>
                  <p className="text-base font-bold text-teal-900">Engineering digital excellence</p>
                  <p className="mt-1 text-sm text-teal-800/55">
                    Award-winning apps since {company.established}
                  </p>
                </div>
              </div>
            </div>
            <Image
              src="/images/work/app-1.png"
              alt="App preview"
              width={280}
              height={560}
              className="bounce-soft absolute -right-2 bottom-20 w-28 drop-shadow-2xl sm:-right-8 sm:w-36 xl:-right-12"
            />
            <div className="float absolute -top-4 -left-4 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:-left-8">
              <p className="text-2xl font-bold text-[#ff6b4a]">9+</p>
              <p className="text-xs font-bold text-teal-800/60">Years</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-teal-900/5 bg-white/70 py-12 backdrop-blur">
        <div className="marquee">
          <ul className="marquee-track items-center gap-12 pr-12">
            {[...clients, ...clients].map((client, i) => (
              <li
                key={`${client.name}-${i}`}
                className="flex h-16 w-40 shrink-0 items-center justify-center"
              >
                <Image
                  src={client.logo}
                  alt={i < clients.length ? client.name : ""}
                  width={120}
                  height={48}
                  className="max-h-11 w-auto object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="services" className="shell scroll-mt-28 py-24 md:py-32">
        <Reveal>
          <p className="text-xs font-bold tracking-[0.22em] text-[#ff6b4a] uppercase">Services</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-teal-950 sm:text-5xl xl:text-6xl">
            Digital products that feel effortless
          </h2>
        </Reveal>
        <ul className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service, i) => (
            <li key={service.id} id={service.id} className="scroll-mt-28">
              <Reveal delay={(i % 3) * 90} from={i % 2 ? "right" : "left"} className="h-full">
                <article className="hover-glow group flex h-full flex-col rounded-[1.75rem] border border-teal-900/5 bg-white p-8 shadow-[0_24px_60px_-36px_rgb(10_46_42_/_0.35)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 text-sm font-bold text-white transition duration-500 group-hover:scale-110 group-hover:rotate-6">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-7 text-xl font-bold text-teal-950 sm:text-2xl">
                    {service.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-teal-800/60">
                    {service.description}
                  </p>
                  <a
                    href="#contact"
                    className="mt-7 text-sm font-bold text-[#ff6b4a] transition group-hover:translate-x-1"
                  >
                    Explore →
                  </a>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="shell">
        <div className="relative overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-teal-900 via-teal-800 to-[#0d4f4a] text-white">
          <div
            className="glow-breathe pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#ff6b4a]/30 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid gap-12 px-8 py-16 sm:px-14 lg:grid-cols-2 lg:items-center xl:px-20 xl:py-20">
            <Reveal from="left">
              <p className="text-xs font-bold tracking-[0.22em] text-[#ff6b4a] uppercase">
                How we partner
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                From first sketch to shipping day
              </h2>
            </Reveal>
            <ol>
              {coreSolutions.map((item, i) => (
                <li key={item.title}>
                  <Reveal delay={i * 90} from="right" className="flex gap-5 border-l border-white/20 py-6 pl-6">
                    <span className="text-2xl font-bold text-[#ff6b4a]">0{i + 1}</span>
                    <span>
                      <span className="block text-xl font-bold">{item.title}</span>
                      <span className="mt-2 block text-sm leading-7 text-white/65">
                        {item.description}
                      </span>
                    </span>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="work" className="shell scroll-mt-28 py-24 md:py-32">
        <Reveal>
          <p className="text-xs font-bold tracking-[0.22em] text-[#ff6b4a] uppercase">Our Work</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-teal-950 sm:text-5xl xl:text-6xl">
            Stories that moved the needle
          </h2>
        </Reveal>
        <div className="mt-16 space-y-20">
          {caseStudies.map((study, index) => (
            <Reveal key={study.name} from={index % 2 ? "right" : "left"}>
              <article
                className={`grid items-center gap-12 lg:grid-cols-2 xl:gap-16 ${
                  index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-800 to-teal-600 px-8 pt-14 shadow-xl">
                  <div
                    className={`flex justify-center ${
                      "landscape" in study && study.landscape
                        ? "flex-col items-center gap-3 pb-8"
                        : "items-end gap-4"
                    }`}
                  >
                    {"landscape" in study && study.landscape ? (
                      <>
                        <Image
                          src={study.screens[0]}
                          alt=""
                          width={960}
                          height={540}
                          className="h-auto w-full rounded-xl object-cover shadow-lg transition duration-700 group-hover:scale-[1.02]"
                        />
                        {study.screens.length > 1 ? (
                          <div className="flex items-end justify-center gap-3">
                            {study.screens.slice(1).map((src) => (
                              <Image
                                key={src}
                                src={src}
                                alt=""
                                width={280}
                                height={560}
                                className="w-24 transition duration-700 group-hover:-translate-y-3 sm:w-32"
                              />
                            ))}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      study.screens.map((src, si) => (
                        <Image
                          key={src}
                          src={src}
                          alt=""
                          width={280}
                          height={560}
                          className={`w-28 transition duration-700 sm:w-40 ${
                            si === 1
                              ? "-translate-y-8 group-hover:-translate-y-12"
                              : "translate-y-3 group-hover:translate-y-0"
                          }`}
                        />
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-teal-700 uppercase">
                    {study.category}
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-teal-950 sm:text-4xl">
                    {study.name}
                  </h3>
                  <p className="mt-5 text-base leading-8 text-teal-800/65 sm:text-lg">
                    {study.summary}
                  </p>
                  <ul className="mt-7 flex flex-wrap gap-2">
                    {study.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full bg-white px-4 py-2 text-xs font-bold text-teal-800 shadow-sm"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-white/80">
        <div className="shell py-24 md:py-32">
          <Reveal className="text-center">
            <p className="text-xs font-bold tracking-[0.22em] text-[#ff6b4a] uppercase">Process</p>
            <h2 className="mt-4 text-4xl font-bold text-teal-950 sm:text-5xl">
              Requirements to delivery
            </h2>
          </Reveal>
          <ol className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {process.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 70} className="hover-glow h-full rounded-3xl bg-[#f0f5f4] p-6">
                  <span className="text-sm font-bold text-[#ff6b4a]">0{i + 1}</span>
                  <h3 className="mt-5 text-lg font-bold text-teal-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-teal-800/60">{step.description}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="shell py-24 md:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start xl:gap-20">
          <Reveal from="left">
            <p className="text-xs font-bold tracking-[0.22em] text-[#ff6b4a] uppercase">
              Industries
            </p>
            <h2 className="mt-4 text-4xl font-bold text-teal-950 sm:text-5xl">
              Your industry doesn&apos;t matter — we make it real
            </h2>
            <ul className="mt-10 flex flex-wrap gap-5">
              {achievements.map((item) => (
                <li key={item.src} className="transition hover:scale-105">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={160}
                    height={160}
                    className="h-24 w-auto object-contain"
                  />
                </li>
              ))}
            </ul>
          </Reveal>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {industries.map((industry, i) => (
              <li key={industry.name}>
                <Reveal delay={(i % 4) * 50} className="h-full">
                  <div className="hover-glow flex min-h-32 flex-col justify-between rounded-2xl bg-white p-5 shadow-sm">
                    <span className="text-xs font-bold text-[#ff6b4a]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-6 text-sm font-bold text-teal-950">{industry.name}</span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shell pb-8">
        <div className="overflow-hidden rounded-[2.75rem] bg-white px-8 py-16 shadow-[0_40px_80px_-50px_rgb(10_46_42_/_0.4)] sm:px-16">
          <Reveal>
            <p className="text-xs font-bold tracking-[0.22em] text-[#ff6b4a] uppercase">
              Client love
            </p>
            <blockquote className="mt-8 max-w-4xl text-2xl leading-snug font-medium text-teal-950 sm:text-4xl">
              “{testimonials[0].quote}”
            </blockquote>
            <div className="mt-10 flex items-center gap-4">
              <Image
                src={testimonials[0].image}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-[#ff6b4a]/40"
              />
              <div>
                <p className="font-bold text-teal-950">{testimonials[0].name}</p>
                <p className="text-sm text-teal-800/55">{testimonials[0].role}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="about" className="shell scroll-mt-28 py-24 md:py-32">
        <Reveal className="max-w-3xl">
          <p className="text-xs font-bold tracking-[0.22em] text-[#ff6b4a] uppercase">
            {about.title}
          </p>
          <h2 className="mt-4 text-4xl font-bold text-teal-950 sm:text-5xl">
            Seeking partners who want to stand out
          </h2>
          <p className="mt-7 text-base leading-8 text-teal-800/65 sm:text-lg">
            {about.paragraphs[0].split(". ").slice(0, 2).join(". ")}.
          </p>
        </Reveal>
      </section>

      <section id="contact" className="shell scroll-mt-28 pb-28">
        <div className="grid gap-12 overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-teal-900 to-[#0d4f4a] px-8 py-14 text-white sm:px-14 lg:grid-cols-2 xl:px-20">
          <Reveal from="left">
            <p className="text-xs font-bold tracking-[0.22em] text-[#ff6b4a] uppercase">
              Let&apos;s collaborate
            </p>
            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
              Create something groundbreaking together
            </h2>
            <p className="mt-6 text-white/70">
              <a href={`mailto:${company.email}`} className="font-bold text-[#ff6b4a]">
                {company.email}
              </a>
              <br />
              {company.address}
            </p>
          </Reveal>
          <Reveal delay={100} from="right" className="text-[#0a2e2a]">
            <InquireForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
