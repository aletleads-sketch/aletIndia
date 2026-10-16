import Image from "next/image";
import { CountUp } from "@/components/count-up";
import { InquireForm } from "@/components/inquire-form";
import { Reveal } from "@/components/reveal";
import {
  caseStudies,
  clients,
  company,
  coreSolutions,
  process,
  services,
  stats,
  testimonials,
} from "@/lib/content";

/** Sample 1 — Neon brutal: black, lime + cyan, wide layout, kinetic motion */
export function Home1Page() {
  return (
    <div id="top" className="font-syne bg-[#030303] text-white">
      <section className="h1-skew h1-scan relative min-h-[100svh] overflow-hidden">
        <div
          className="glow-breathe pointer-events-none absolute -top-32 right-0 h-[28rem] w-[28rem] rounded-full bg-[#c8ff00]/25 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="glow-breathe pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl"
          style={{ animationDelay: "-2s" }}
          aria-hidden="true"
        />

        <div className="shell relative flex flex-col justify-end pt-36 pb-16 lg:min-h-[100svh] lg:pb-24">
          <div className="grid items-end gap-12 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="rise flex items-center gap-3 text-xs font-bold tracking-[0.35em] text-[#c8ff00] uppercase">
                <span className="pulse-dot !bg-[#c8ff00]" aria-hidden="true" />
                {company.tagline} · Est. {company.established}
              </p>
              <h1 className="clip-up d1 mt-5 text-[clamp(3.5rem,11vw,10rem)] leading-[0.82] font-extrabold tracking-[-0.045em] uppercase">
                ALET
                <span className="block bg-gradient-to-r from-[#c8ff00] via-[#a3e635] to-cyan-300 bg-clip-text text-transparent">
                  India
                </span>
              </h1>
              <p className="slide-x d2 mt-8 max-w-xl font-space text-lg leading-relaxed text-white/65 sm:text-xl">
                Your trusted technology partner. We lead the IT industry with mobile apps,
                web platforms, and digital experiences that move businesses forward.
              </p>
              <div className="rise d3 mt-10 flex flex-wrap gap-3">
                <a
                  href="#contact"
                  className="btn-sheen inline-flex items-center gap-2 bg-[#c8ff00] px-8 py-4 text-sm font-extrabold tracking-wide text-black uppercase transition hover:scale-[1.03] hover:bg-white"
                >
                  Inquire Now →
                </a>
                <a
                  href="#work"
                  className="inline-flex items-center gap-2 border border-white/25 px-8 py-4 text-sm font-extrabold tracking-wide uppercase transition hover:border-cyan-300 hover:text-cyan-300"
                >
                  See Work
                </a>
              </div>
            </div>

            <div className="scale-in d2 relative hidden xl:block">
              <div className="absolute inset-0 rotate-3 bg-gradient-to-br from-[#c8ff00] to-cyan-400 opacity-80" />
              <div className="relative -rotate-2 overflow-hidden border border-white/10 bg-[#0a0a0a]">
                <Image
                  src="/images/banner.png"
                  alt="Technology services"
                  width={980}
                  height={420}
                  priority
                  className="h-auto w-full p-4"
                />
              </div>
              <Image
                src="/images/work/app-1.png"
                alt=""
                width={200}
                height={400}
                className="bounce-soft absolute -right-6 -bottom-10 w-28 drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="rise d4 mt-16 grid grid-cols-3 gap-6 border-t border-white/10 pt-10 sm:gap-16">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="hover-glow border border-transparent p-2 transition hover:border-[#c8ff00]/30"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <p className="text-4xl font-extrabold tracking-tight text-[#c8ff00] sm:text-6xl">
                  <CountUp value={stat.value} />+
                </p>
                <p className="mt-2 font-space text-xs tracking-[0.22em] text-white/45 uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-white/10 bg-gradient-to-r from-[#c8ff00] via-[#d9ff4d] to-cyan-300 py-5 text-black">
        <div className="marquee">
          <ul className="marquee-track items-center gap-12 pr-12 text-sm font-extrabold tracking-[0.1em] uppercase sm:text-base">
            {[...services, ...services].map((service, i) => (
              <li key={`${service.id}-${i}`} className="shrink-0">
                {service.title} <span className="mx-5 opacity-35">◆</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="services" className="shell scroll-mt-28 py-24 md:py-32">
        <Reveal>
          <p className="text-xs font-bold tracking-[0.3em] text-[#c8ff00] uppercase">Services</p>
          <h2 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-tight uppercase sm:text-6xl xl:text-7xl">
            Built for speed.{" "}
            <span className="text-cyan-300">Designed for scale.</span>
          </h2>
        </Reveal>
        <ul className="mt-16 divide-y divide-white/10 border-y border-white/10">
          {services.map((service, index) => (
            <li key={service.id} id={service.id} className="scroll-mt-28">
              <Reveal delay={index * 50} from={index % 2 ? "right" : "left"}>
                <a
                  href="#contact"
                  className="row-slide group grid gap-4 py-9 md:grid-cols-[5rem_1fr_auto] md:items-center md:gap-10"
                >
                  <span className="font-space text-sm text-cyan-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-2xl font-extrabold uppercase transition group-hover:text-[#c8ff00] sm:text-4xl">
                      {service.title}
                    </span>
                    <span className="mt-3 block max-w-3xl font-space text-sm leading-7 text-white/50 sm:text-base">
                      {service.description}
                    </span>
                  </span>
                  <span className="inline-flex h-14 w-14 items-center justify-center border border-white/20 text-2xl transition duration-500 group-hover:rotate-45 group-hover:border-[#c8ff00] group-hover:bg-[#c8ff00] group-hover:text-black">
                    →
                  </span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-[#0a0a0a]">
        <div className="shell grid gap-14 py-24 md:py-32 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Reveal from="left">
            <p className="text-xs font-bold tracking-[0.3em] text-cyan-300 uppercase">
              Core Solution
            </p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight uppercase sm:text-5xl xl:text-6xl">
              Develop. Enhance. Upgrade.
            </h2>
            <ol className="mt-12 space-y-5">
              {coreSolutions.map((item, i) => (
                <li
                  key={item.title}
                  className="hover-glow border-l-2 border-[#c8ff00] bg-white/[0.02] py-4 pl-6 transition hover:bg-[#c8ff00]/5"
                >
                  <p className="text-xs tracking-[0.2em] text-white/35 uppercase">0{i + 1}</p>
                  <p className="mt-1 text-2xl font-extrabold uppercase sm:text-3xl">{item.title}</p>
                  <p className="mt-2 max-w-lg font-space text-sm leading-7 text-white/55">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={120} from="right" className="relative">
            <div
              className="glow-breathe absolute -inset-4 rotate-2 bg-gradient-to-br from-[#c8ff00] to-cyan-400"
              aria-hidden="true"
            />
            <div className="relative -rotate-1 overflow-hidden">
              <Image
                src="/images/mobile-dev.jpg"
                alt="Mobile application development"
                width={1200}
                height={900}
                className="zoom-img h-[32rem] w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="work" className="scroll-mt-28 overflow-hidden py-24 md:py-32">
        <div className="shell flex items-end justify-between gap-8">
          <Reveal>
            <p className="text-xs font-bold tracking-[0.3em] text-[#c8ff00] uppercase">Work</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight uppercase sm:text-6xl xl:text-7xl">
              Selected products
            </h2>
          </Reveal>
        </div>
        <div className="mt-14 flex gap-6 overflow-x-auto px-[clamp(1.25rem,4vw,3.5rem)] pb-4">
          {caseStudies.map((study, i) => (
            <Reveal key={study.name} delay={i * 100} className="shrink-0">
              <article className="group hover-glow w-[85vw] border border-white/10 bg-[#0d0d0d] sm:w-[36rem] xl:w-[40rem]">
                <div
                  className={`flex h-80 justify-center gap-3 overflow-hidden bg-gradient-to-b from-[#151515] to-[#0d0d0d] px-6 ${
                    "landscape" in study && study.landscape
                      ? "items-center py-8"
                      : "items-end pt-10"
                  }`}
                >
                  {study.screens.map((src) => {
                    const landscape = "landscape" in study && study.landscape;
                    return (
                      <Image
                        key={src}
                        src={src}
                        alt=""
                        width={landscape ? 960 : 280}
                        height={landscape ? 540 : 560}
                        className={
                          landscape
                            ? "h-auto max-h-64 w-full rounded-xl object-cover transition duration-700 group-hover:scale-[1.03]"
                            : "h-72 w-auto transition duration-700 group-hover:-translate-y-5"
                        }
                      />
                    );
                  })}
                </div>
                <div className="border-t border-white/10 p-8">
                  <p className="text-xs tracking-[0.2em] text-cyan-300 uppercase">
                    {study.category}
                  </p>
                  <h3 className="mt-2 text-3xl font-extrabold uppercase sm:text-4xl">
                    {study.name}
                  </h3>
                  <p className="mt-4 font-space text-base leading-7 text-white/55">
                    {study.summary}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10">
        <div className="shell grid gap-px bg-white/10 sm:grid-cols-5">
          {process.map((step, i) => (
            <Reveal key={step.title} delay={i * 70} className="bg-[#030303] p-7 sm:p-9">
              <p className="text-[#c8ff00]">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-8 text-xl font-extrabold uppercase">{step.title}</h3>
              <p className="mt-3 font-space text-sm leading-6 text-white/45">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="shell py-24 md:py-32">
        <Reveal>
          <p className="text-xs font-bold tracking-[0.3em] text-cyan-300 uppercase">Clients</p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight uppercase sm:text-5xl xl:text-6xl">
            Trusted worldwide
          </h2>
        </Reveal>
        <ul className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
          {clients.map((client, i) => (
            <li key={client.name}>
              <Reveal delay={i * 40} className="h-full">
                <div className="hover-glow flex h-32 items-center justify-center border border-white/10 bg-[#0d0d0d] px-4 grayscale transition hover:border-[#c8ff00]/40 hover:grayscale-0">
                  <Image
                    src={client.logo}
                    alt={client.name}
                    width={120}
                    height={60}
                    className="max-h-12 w-auto object-contain"
                  />
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="overflow-hidden bg-gradient-to-r from-[#c8ff00] via-[#b8f000] to-cyan-300 text-black">
        <div className="shell py-24 md:py-28">
          <Reveal>
            <p className="text-xs font-bold tracking-[0.3em] uppercase">Testimonials</p>
            <blockquote className="mt-8 max-w-5xl text-3xl leading-[1.15] font-extrabold tracking-tight sm:text-5xl xl:text-6xl">
              “{testimonials[0].quote}”
            </blockquote>
            <p className="mt-10 font-space text-sm font-bold tracking-[0.15em] uppercase">
              {testimonials[0].name} — {testimonials[0].role}
            </p>
          </Reveal>
        </div>
      </section>

      <section id="about" className="shell scroll-mt-28 py-24 md:py-32">
        <Reveal className="max-w-4xl">
          <p className="text-xs font-bold tracking-[0.3em] text-[#c8ff00] uppercase">About</p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight uppercase sm:text-5xl xl:text-6xl">
            Inspired by technology since {company.established}
          </h2>
          <p className="mt-8 font-space text-lg leading-8 text-white/60">
            Alet India turns ideas into mobile and web products for startups and enterprises
            across 20+ countries — from New Delhi to the world.
          </p>
        </Reveal>
      </section>

      <section id="contact" className="scroll-mt-28 border-t border-white/10">
        <div className="shell grid gap-14 py-24 md:py-32 lg:grid-cols-2">
          <Reveal from="left">
            <p className="text-xs font-bold tracking-[0.3em] text-cyan-300 uppercase">Contact</p>
            <h2 className="mt-4 text-5xl font-extrabold tracking-tight uppercase sm:text-7xl">
              Let&apos;s build.
            </h2>
            <p className="mt-8 font-space text-white/55">
              <a href={`mailto:${company.email}`} className="text-[#c8ff00] hover:underline">
                {company.email}
              </a>
              <br />
              {company.address}
            </p>
          </Reveal>
          <Reveal delay={100} from="right" className="text-ink">
            <InquireForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
