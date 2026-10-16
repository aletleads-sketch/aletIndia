import Image from "next/image";
import { CountUp } from "@/components/count-up";
import { InquireForm } from "@/components/inquire-form";
import { Reveal } from "@/components/reveal";
import {
  caseStudies,
  clients,
  company,
  coreSolutions,
  faqs,
  process,
  services,
  stats,
  testimonials,
} from "@/lib/content";

const bentoColors = [
  "bg-[#ff4d00] text-white",
  "bg-[#141414] text-white",
  "bg-[#ffe14d] text-[#141414]",
  "bg-[#2dd4bf] text-[#141414]",
  "bg-white text-[#141414] border-2 border-[#141414]",
  "bg-[#ff8a5c] text-[#141414]",
];

/** Sample 3 — Kinetic bento: orange + charcoal + mint, wide playful grid */
export function Home3Page() {
  return (
    <div id="top" className="font-archivo bg-[#faf7f2] text-[#141414]">
      <section className="h3-checker relative overflow-hidden">
        <div
          className="glow-breathe pointer-events-none absolute top-24 right-[10%] h-64 w-64 rounded-full bg-[#ff4d00]/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="glow-breathe pointer-events-none absolute bottom-20 left-[5%] h-56 w-56 rounded-full bg-[#2dd4bf]/25 blur-3xl"
          style={{ animationDelay: "-2s" }}
          aria-hidden="true"
        />

        <div className="shell relative pt-36 pb-20 lg:pb-28">
          <div className="rise flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#141414] px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-white uppercase">
              {company.name}
            </span>
            <span className="rounded-full border-2 border-[#141414] bg-white px-4 py-1.5 text-xs font-bold tracking-[0.18em] uppercase">
              Est. {company.established}
            </span>
            <span className="bounce-soft rounded-full bg-[#ff4d00] px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-white uppercase">
              New Delhi
            </span>
          </div>

          <h1 className="clip-up d1 mt-8 max-w-[14ch] text-[clamp(3.2rem,10vw,8rem)] leading-[0.88] font-black tracking-[-0.03em]">
            Make it{" "}
            <span className="relative inline-block">
              bigger
              <svg
                viewBox="0 0 200 20"
                className="absolute -bottom-1 left-0 w-full"
                aria-hidden="true"
              >
                <path
                  d="M2 14 Q50 2 100 12 T198 8"
                  fill="none"
                  stroke="#ff4d00"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            with ALET
          </h1>

          <div className="slide-x d2 mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-lg text-lg leading-8 text-[#141414]/70 sm:text-xl">
              Mobile apps, web platforms, UI that pops, and marketing that converts — all
              from one New Delhi team that ships with personality.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#contact"
                className="btn-sheen inline-flex rotate-[-2deg] rounded-2xl bg-[#ff4d00] px-8 py-4 text-sm font-black text-white shadow-[8px_8px_0_#141414] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_#141414]"
              >
                Start a project
              </a>
              <a
                href="#work"
                className="inline-flex rotate-[1.5deg] rounded-2xl border-2 border-[#141414] bg-white px-8 py-4 text-sm font-black shadow-[8px_8px_0_#141414] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_#141414]"
              >
                Peek the work
              </a>
            </div>
          </div>

          <div className="scale-in d3 relative mt-16 grid gap-5 sm:grid-cols-12 xl:gap-6">
            <div className="group relative overflow-hidden rounded-[2rem] border-2 border-[#141414] bg-white shadow-[10px_10px_0_#141414] sm:col-span-7 xl:col-span-8">
              <Image
                src="/images/banner.png"
                alt="Web and mobile technology"
                width={980}
                height={420}
                priority
                className="zoom-img h-auto w-full p-5 sm:p-8"
              />
            </div>
            <div className="flex flex-col gap-5 sm:col-span-5 xl:col-span-4">
              <div className="float flex flex-1 items-end justify-center overflow-hidden rounded-[2rem] border-2 border-[#141414] bg-[#ffe14d] pt-8 shadow-[10px_10px_0_#141414]">
                <Image
                  src="/images/work/tajika-1.png"
                  alt="Tajika app"
                  width={280}
                  height={560}
                  className="h-60 w-auto sm:h-72"
                />
              </div>
              <div className="hover-glow rounded-[2rem] border-2 border-[#141414] bg-[#2dd4bf] p-7 shadow-[10px_10px_0_#141414]">
                <p className="text-5xl font-black">
                  <CountUp value={stats[1].value} />+
                </p>
                <p className="mt-2 text-sm font-bold">Projects delivered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y-2 border-[#141414] bg-[#141414] py-4 text-white">
        <div className="marquee">
          <ul className="h3-ticker flex w-max gap-10 pr-10 text-sm font-black tracking-[0.14em] uppercase sm:text-base">
            {[...services.map((s) => s.title), ...services.map((s) => s.title)].map(
              (label, i) => (
                <li key={`${label}-${i}`} className="shrink-0">
                  ★ {label}
                </li>
              ),
            )}
          </ul>
        </div>
      </section>

      <section id="services" className="shell scroll-mt-28 py-24 md:py-32">
        <Reveal>
          <h2 className="text-4xl font-black tracking-tight sm:text-6xl xl:text-7xl">
            What we <span className="text-[#ff4d00]">cook up</span>
          </h2>
        </Reveal>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service, i) => (
            <li
              key={service.id}
              id={service.id}
              className={`scroll-mt-28 ${i === 0 ? "sm:col-span-2 xl:col-span-2" : ""}`}
            >
              <Reveal delay={(i % 3) * 80} from={i % 2 ? "right" : "left"} className="h-full">
                <article
                  className={`hover-glow flex h-full min-h-52 flex-col justify-between rounded-[1.75rem] p-8 shadow-[8px_8px_0_#141414] ${bentoColors[i % bentoColors.length]}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3
                      className={`font-black leading-tight ${
                        i === 0 ? "max-w-[18ch] text-3xl sm:text-4xl" : "max-w-[14ch] text-2xl sm:text-3xl"
                      }`}
                    >
                      {service.title}
                    </h3>
                    <span className="text-sm font-black opacity-55">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-8 max-w-xl text-sm leading-7 opacity-90 sm:text-base">
                    {service.description}
                  </p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="shell pb-10">
        <div className="grid gap-5 md:grid-cols-3">
          {coreSolutions.map((item, i) => (
            <Reveal key={item.title} delay={i * 90} from={i === 1 ? "up" : i === 0 ? "left" : "right"}>
              <div className="hover-glow h-full rounded-[1.75rem] border-2 border-[#141414] bg-white p-7 shadow-[6px_6px_0_#ff4d00]">
                <p className="text-6xl font-black text-[#ff4d00]">0{i + 1}</p>
                <h3 className="mt-5 text-2xl font-black sm:text-3xl">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#141414]/65">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="work" className="scroll-mt-28 py-24 md:py-32">
        <div className="shell">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-4xl font-black sm:text-6xl xl:text-7xl">
              Work that <span className="text-[#ff4d00]">winks</span>
            </h2>
            <p className="max-w-xs text-sm text-[#141414]/55 sm:text-base">
              Real apps for real clients — swipe through the proof.
            </p>
          </Reveal>
        </div>
        <div className="mt-14 flex gap-7 overflow-x-auto px-[clamp(1.25rem,4vw,3.5rem)] pb-6">
          {caseStudies.map((study, i) => (
            <Reveal key={study.name} delay={i * 100} className="shrink-0">
              <article
                className={`hover-glow w-[82vw] overflow-hidden rounded-[2rem] border-2 border-[#141414] shadow-[10px_10px_0_#141414] sm:w-[32rem] xl:w-[36rem] ${
                  i % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"
                }`}
              >
                <div
                  className={`flex h-72 justify-center gap-3 px-5 ${
                    "landscape" in study && study.landscape
                      ? "items-center py-6"
                      : "items-end pt-10"
                  } ${i === 0 ? "bg-[#ff4d00]" : i === 1 ? "bg-[#2dd4bf]" : "bg-[#ffe14d]"}`}
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
                            ? "h-auto max-h-60 w-full rounded-xl object-cover transition duration-500 hover:scale-[1.02]"
                            : "h-64 w-auto transition duration-500 hover:-translate-y-3"
                        }
                      />
                    );
                  })}
                </div>
                <div className="bg-white p-7">
                  <p className="text-xs font-black tracking-[0.16em] text-[#ff4d00] uppercase">
                    {study.category}
                  </p>
                  <h3 className="mt-2 text-3xl font-black sm:text-4xl">{study.name}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#141414]/65 sm:text-base">
                    {study.summary}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y-2 border-[#141414] bg-[#141414] text-white">
        <div className="shell py-20 md:py-24">
          <Reveal>
            <h2 className="text-4xl font-black sm:text-5xl xl:text-6xl">
              Five steps. <span className="text-[#ffe14d]">Zero drama.</span>
            </h2>
          </Reveal>
          <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {process.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 60} className="hover-glow h-full rounded-2xl bg-white/5 p-6">
                  <span className="text-[#ff4d00]">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-5 text-lg font-black">{step.title}</h3>
                  <p className="mt-3 text-xs leading-5 text-white/55">{step.description}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="shell py-24 md:py-32">
        <Reveal>
          <h2 className="text-4xl font-black sm:text-5xl xl:text-6xl">Friends of the studio</h2>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
          {clients.map((client, i) => (
            <li key={client.name}>
              <Reveal delay={i * 40} className="h-full">
                <div className="hover-glow flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#141414] bg-white px-3 shadow-[5px_5px_0_#141414]">
                  <Image
                    src={client.logo}
                    alt={client.name}
                    width={100}
                    height={50}
                    className="max-h-10 w-auto object-contain"
                  />
                  <span className="text-center text-[0.65rem] font-bold">{client.name}</span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
        <dl className="mt-12 grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <div className="hover-glow rounded-2xl border-2 border-[#141414] bg-[#ffe14d] p-6 text-center shadow-[5px_5px_0_#141414] sm:p-8">
                <dt className="text-[0.65rem] font-black tracking-[0.14em] uppercase">
                  {stat.label}
                </dt>
                <dd className="mt-2 text-4xl font-black sm:text-5xl">
                  <CountUp value={stat.value} />+
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      <section className="shell">
        <Reveal>
          <div className="hover-glow rotate-[-0.5deg] overflow-hidden rounded-[2rem] border-2 border-[#141414] bg-gradient-to-br from-[#ff8a5c] to-[#ff4d00] p-8 text-white shadow-[12px_12px_0_#141414] sm:p-14">
            <p className="text-7xl font-black leading-none text-white/30" aria-hidden="true">
              “
            </p>
            <blockquote className="mt-2 max-w-4xl text-2xl font-black leading-snug sm:text-4xl">
              {testimonials[0].quote}
            </blockquote>
            <p className="mt-10 text-sm font-black uppercase tracking-wide">
              — {testimonials[0].name}, {testimonials[0].role}
            </p>
          </div>
        </Reveal>
      </section>

      <section id="about" className="shell scroll-mt-28 py-24 md:py-32">
        <Reveal className="max-w-3xl" from="left">
          <h2 className="text-4xl font-black sm:text-5xl xl:text-6xl">
            About the people behind the pixels
          </h2>
          <p className="mt-7 text-base leading-8 text-[#141414]/70 sm:text-lg">
            Inspired by technology, based in Mayur Vihar, New Delhi. We build for clients in
            20+ countries — and we keep the process human.
          </p>
        </Reveal>
      </section>

      <section className="bg-white">
        <div className="shell grid gap-12 py-24 md:py-32 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal from="left">
            <h2 className="text-4xl font-black sm:text-5xl">
              FAQ <span className="text-[#ff4d00]">zone</span>
            </h2>
          </Reveal>
          <ul className="space-y-4">
            {faqs.slice(0, 4).map((faq, i) => (
              <li key={faq.question}>
                <Reveal delay={i * 50} from="right">
                  <details className="group rounded-2xl border-2 border-[#141414] bg-[#faf7f2] px-6 py-5 transition open:bg-[#ffe14d] open:shadow-[5px_5px_0_#141414]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black sm:text-base">
                      {faq.question}
                      <span className="faq-icon text-xl transition">+</span>
                    </summary>
                    <p className="mt-4 text-sm leading-7 text-[#141414]/70">{faq.answer}</p>
                  </details>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" className="shell scroll-mt-28 pb-28">
        <div className="grid gap-12 overflow-hidden rounded-[2rem] border-2 border-[#141414] bg-[#141414] px-7 py-14 text-white shadow-[14px_14px_0_#ff4d00] sm:px-14 lg:grid-cols-2">
          <Reveal from="left">
            <h2 className="text-4xl font-black sm:text-5xl xl:text-6xl">
              Got an idea? <span className="text-[#ffe14d]">Hit us up.</span>
            </h2>
            <p className="mt-6 text-white/65">
              <a href={`mailto:${company.email}`} className="font-bold text-[#ff4d00]">
                {company.email}
              </a>
              <br />
              {company.address}
            </p>
          </Reveal>
          <Reveal delay={100} from="right" className="text-[#141414]">
            <InquireForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
