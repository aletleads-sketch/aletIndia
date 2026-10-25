import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumb, HeroActions, Wave } from "@/components/page-hero";
import { PortfolioSlider } from "@/components/portfolio-slider";
import { Reveal } from "@/components/reveal";
import {
  ContactSection,
  ProcessSection,
  ServiceCard,
  TestimonialsSection,
} from "@/components/sections";
import { Arrow, Check, Eyebrow, Photo } from "@/components/ui";
import { services } from "@/lib/content";
import { serviceDetails, serviceVisuals, type ServiceDetail, type ServiceVisual } from "@/lib/pages";

type Service = (typeof services)[number];

type LayoutProps = {
  service: Service;
  detail: ServiceDetail;
  visual: ServiceVisual;
  related: Service[];
};

export function getService(id: string) {
  const service = services.find((item) => item.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
}

export function serviceMetadata(id: string) {
  const service = getService(id);
  return {
    title: `${service.nav} — Alet India`,
    description: serviceDetails[id].intro,
  };
}

export function ServicePage({ id }: { id: string }) {
  const service = getService(id);
  const detail = serviceDetails[id];
  const visual = serviceVisuals[id];
  const index = services.indexOf(service);
  const related = [1, 2, 3].map((step) => services[(index + step) % services.length]);
  const theme = { "--a": visual.theme[0], "--b": visual.theme[1] } as CSSProperties;
  const props = { service, detail, visual, related };

  return (
    <div style={theme}>
      {visual.layout === "split" ? <SplitLayout {...props} /> : null}
      {visual.layout === "immersive" ? <ImmersiveLayout {...props} /> : null}
      {visual.layout === "editorial" ? <EditorialLayout {...props} /> : null}
      <ContactSection title="Let's discuss your" accent="project" defaultService={service.title} />
    </div>
  );
}

function SplitLayout({ service, detail, visual, related }: LayoutProps) {
  const [main, second, third] = visual.gallery;
  return (
    <>
      <section className="theme-mesh relative overflow-hidden text-white">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid w-full max-w-[92rem] items-center gap-14 px-5 pt-36 pb-28 sm:px-8 xl:px-12 lg:grid-cols-[1.05fr_0.95fr] lg:pt-40">
          <div>
            <Breadcrumb crumb={service.nav} className="rise" />
            <HeroHeading detail={detail} />
            <p className="rise d2 mt-6 max-w-2xl text-base leading-7 text-white/70">{detail.intro}</p>
            <HeroActions />
          </div>

          <div className="rise d2 relative mx-auto w-full max-w-xl">
            <div className="grid h-[26rem] grid-cols-[1.3fr_1fr] grid-rows-2 gap-4 sm:h-[30rem]">
              <Photo src={main} alt={service.imageAlt} priority className="row-span-2 rounded-[2rem]" />
              <Photo src={second} className="rounded-[1.6rem]" />
              <Photo src={third} className="rounded-[1.6rem]" />
            </div>
            <StatBadge visual={visual} className="float absolute -bottom-8 -left-4 sm:-left-10" />
            <div className="float float-b glass absolute -top-6 right-6 rounded-2xl px-4 py-3 text-xs font-bold">
              {detail.stack.slice(0, 3).join(" · ")}
            </div>
          </div>
        </div>
        <Wave />
      </section>

      <section className="relative z-10 -mt-6 px-5 sm:px-8">
        <ul className="mx-auto grid max-w-[92rem] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {detail.highlights.map((item, index) => (
            <li key={item}>
              <Reveal delay={index * 70} className="h-full">
                <div className="lift flex h-full items-center gap-4 rounded-2xl bg-white px-5 py-5 ring-1 ring-line shadow-[0_20px_50px_-30px_rgb(30_27_75_/_0.45)]">
                  <span className="theme-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white">
                    <Check />
                  </span>
                  <span className="text-[0.95rem] font-bold text-ink">{item}</span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-[92rem] space-y-16 overflow-x-clip px-5 py-16 sm:px-8 md:space-y-24 md:py-24 xl:px-12">
        {detail.sections.map((section, index) => {
          const flip = index % 2 === 1;
          return (
            <div key={section.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal from={flip ? "right" : "left"} className={flip ? "lg:order-2" : ""}>
                <div className="relative">
                  <div
                    className={`theme-gradient absolute inset-0 rounded-[2rem] ${
                      flip ? "-translate-x-4 translate-y-4" : "translate-x-4 translate-y-4"
                    }`}
                    aria-hidden="true"
                  />
                  <Photo
                    src={visual.gallery[index % visual.gallery.length]}
                    className="relative h-72 rounded-[2rem] sm:h-96"
                  />
                </div>
              </Reveal>
              <Reveal delay={100}>
                <p className="theme-text text-6xl font-extrabold tracking-tight sm:text-7xl">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                  {section.title}
                </h2>
                <div className="mt-5 space-y-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)} className="text-[0.98rem] leading-8 text-ink/75">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Reveal>
            </div>
          );
        })}
      </section>

      {visual.screens ? (
        <section className="px-5 sm:px-8">
          <Reveal className="theme-gradient relative mx-auto max-w-[92rem] overflow-hidden rounded-[2.5rem] px-6 pt-12 text-white sm:px-12">
            <div className="dot-grid pointer-events-none absolute inset-0" />
            <div className="relative text-center">
              <Eyebrow light>From our portfolio</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Screens from apps we&apos;ve shipped
              </h2>
            </div>
            <div className="relative mt-10 flex items-end justify-center gap-3 sm:gap-6">
              {visual.screens.map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  width={280}
                  height={560}
                  className={`w-auto drop-shadow-[0_24px_30px_rgb(0_0_0_/_0.35)] ${
                    index === 2 ? "h-72 sm:h-96" : index % 2 ? "h-60 sm:h-80" : "hidden h-52 sm:block sm:h-64"
                  }`}
                />
              ))}
            </div>
          </Reveal>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 md:py-24 xl:px-12">
        <Reveal className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Our stack</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Technologies <span className="theme-text">we trust</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-muted">{service.description}</p>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {detail.stack.map((tech, index) => (
              <li
                key={tech}
                className="lift theme-soft theme-ring flex items-center gap-3 rounded-2xl px-5 py-5"
              >
                <span className="theme-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-extrabold text-ink">{tech}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <ProcessSection showIdeology={false} />

      <section className="mx-auto w-full max-w-[92rem] px-5 pt-16 sm:px-8 md:pt-24 xl:px-12">
        <Reveal>
          <Eyebrow>More services</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Explore <span className="theme-text">other services</span>
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item, index) => (
            <li key={item.id}>
              <Reveal delay={index * 90} className="h-full">
                <ServiceCard service={item} />
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function ImmersiveLayout({ service, detail, visual, related }: LayoutProps) {
  const [main, second, third] = visual.gallery;
  const [a, b] = visual.theme;
  return (
    <>
      <section className="relative flex min-h-[44rem] items-center overflow-hidden bg-night text-white lg:min-h-[48rem]">
        <Image src={main} alt={service.imageAlt} fill priority sizes="100vw" className="object-cover" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${a}e6 0%, #060a1fd9 55%, ${b}b3 100%)` }}
          aria-hidden="true"
        />
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto w-full max-w-5xl px-5 pt-36 pb-32 text-center sm:px-8 lg:pt-40">
          <Breadcrumb crumb={service.nav} className="rise" />
          <HeroHeading detail={detail} />
          <p className="rise d2 mx-auto mt-6 max-w-3xl text-base leading-7 text-white/75">{detail.intro}</p>
          <HeroActions center />
          <ul className="rise d4 mt-12 flex flex-wrap justify-center gap-3">
            {detail.highlights.map((item) => (
              <li
                key={item}
                className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              >
                <Check className="h-4 w-4 text-white" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Wave />
      </section>

      <section className="mx-auto grid w-full max-w-[92rem] items-center gap-14 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-2 xl:px-12">
        <Reveal>
          <Eyebrow>{detail.eyebrow}</Eyebrow>
          <p className="mt-6 text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
            &ldquo;{service.description}&rdquo;
          </p>
          <div className="mt-8 flex items-center gap-5">
            <p className="theme-text text-5xl font-extrabold tracking-tight">{visual.stat.value}</p>
            <p className="max-w-[10rem] text-sm font-semibold text-muted">{visual.stat.label}</p>
          </div>
        </Reveal>
        <Reveal delay={120} className="relative pb-16 sm:pr-16">
          <Photo src={second} className="h-80 rounded-[2rem] sm:h-[26rem]" />
          <div className="absolute right-0 -bottom-2 w-1/2 overflow-hidden rounded-[1.6rem] border-[6px] border-white shadow-[0_30px_60px_-25px_rgb(30_27_75_/_0.6)]">
            <Photo src={third} className="h-44 sm:h-56" />
          </div>
          <div className="theme-gradient absolute -top-5 -left-5 -z-10 h-32 w-32 rounded-[2rem]" aria-hidden="true" />
        </Reveal>
      </section>

      <section className="theme-soft">
        <div className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 md:py-24 xl:px-12">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>What we deliver</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Built for <span className="theme-text">real results</span>
            </h2>
          </Reveal>
          <ul className={`mt-12 grid gap-6 ${detail.sections.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
            {detail.sections.map((section, index) => {
              const image = visual.gallery[(index + 1) % visual.gallery.length];
              const diagram = /hybrid_app|same_code_different/.test(image);
              return (
              <li key={section.title}>
                <Reveal delay={index * 90} className="h-full">
                  <article className="lift group h-full overflow-hidden rounded-[2rem] bg-white ring-1 ring-line shadow-[0_20px_50px_-35px_rgb(30_27_75_/_0.45)]">
                    <div className={diagram ? "relative aspect-[3/2] bg-[#f4f7fb]" : "relative h-52 overflow-hidden"}>
                      {diagram ? (
                        <Image
                          src={image}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-contain"
                        />
                      ) : (
                        <Photo src={image} className="zoom-img h-full" />
                      )}
                      {diagram ? null : (
                        <span className="theme-gradient absolute bottom-4 left-5 rounded-full px-3.5 py-1.5 text-xs font-extrabold text-white">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                    <div className="p-7 sm:p-8">
                      <h3 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight">
                        {diagram ? (
                          <span className="theme-gradient inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        ) : null}
                        {section.title}
                      </h3>
                      <div className="mt-4 space-y-3">
                        {section.body.map((paragraph) => (
                          <p key={paragraph.slice(0, 32)} className="text-[0.95rem] leading-7 text-ink/75">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </article>
                </Reveal>
              </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden bg-night py-10 text-white">
        <div className="marquee">
          <ul className="marquee-track gap-4">
            {[...detail.stack, ...detail.stack, ...detail.stack, ...detail.stack].map((tech, index) => (
              <li
                key={`${tech}-${index}`}
                className="glass flex shrink-0 items-center gap-3 rounded-full px-6 py-3 text-lg font-extrabold"
              >
                <span className="theme-gradient h-2.5 w-2.5 rounded-full" aria-hidden="true" />
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {visual.screens ? (
        <section className="mx-auto grid w-full max-w-[92rem] items-center gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[0.9fr_1.1fr] xl:px-12">
          <Reveal>
            <Eyebrow>Crafted by ALET</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Interfaces people <span className="theme-text">enjoy using</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-muted">
              A look at screens we designed and built for clients across real estate, fashion,
              sports, and travel.
            </p>
            <Link
              href="/portfolio"
              className="theme-gradient mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              See the full portfolio
              <Arrow />
            </Link>
          </Reveal>
          <Reveal delay={120} className="theme-gradient relative overflow-hidden rounded-[2.5rem] px-6 pt-12">
            <div className="dot-grid pointer-events-none absolute inset-0" />
            <div className="relative flex items-end justify-center">
              {visual.screens.slice(0, 3).map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  width={280}
                  height={560}
                  className={`w-auto drop-shadow-[0_24px_30px_rgb(0_0_0_/_0.4)] ${
                    index === 1
                      ? "relative z-10 h-80 sm:h-96"
                      : index === 0
                        ? "-mr-8 h-64 -rotate-6 sm:h-80"
                        : "-ml-8 h-64 rotate-6 sm:h-80"
                  }`}
                />
              ))}
            </div>
          </Reveal>
        </section>
      ) : null}

      <div className={visual.screens ? "pb-16 md:pb-24" : "py-16 md:py-24"}>
        <TestimonialsSection />
      </div>

      <section className="mx-auto w-full max-w-[92rem] px-5 sm:px-8 xl:px-12">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>More services</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Keep <span className="theme-text">exploring</span>
            </h2>
          </div>
        </Reveal>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {related.map((item, index) => (
            <li key={item.id}>
              <Reveal delay={index * 90} className="h-full">
                <Link
                  href={`/${item.slug}`}
                  className="group relative flex h-80 items-end overflow-hidden rounded-[2rem] text-white"
                >
                  <div className="zoom-img absolute inset-0">
                    <Photo src={item.image} className="h-full" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
                  <div className="relative p-7">
                    <h3 className="text-2xl font-extrabold tracking-tight">{item.title}</h3>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-white/85">
                      Explore
                      <span className="transition group-hover:translate-x-1.5">
                        <Arrow />
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function EditorialLayout({ service, detail, visual, related }: LayoutProps) {
  const [main, second, third] = visual.gallery;
  const browserShot = visual.screens?.[0];
  return (
    <>
      <section className="theme-mesh relative overflow-hidden text-white">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto w-full max-w-5xl px-5 pt-36 pb-48 text-center sm:px-8 lg:pt-40 lg:pb-56">
          <Breadcrumb crumb={service.nav} className="rise" />
          <p className="rise d1 mt-6 text-xs font-bold tracking-[0.3em] text-white/60 uppercase">
            {detail.eyebrow}
          </p>
          <h1 className="rise d1 mt-4 text-5xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {detail.headline} <span className="theme-text-light">{detail.accent}</span>
          </h1>
          <HeroActions center />
        </div>
      </section>

      <section className="relative z-10 -mt-40 px-5 sm:px-8 lg:-mt-48">
        <div className="mx-auto grid max-w-6xl grid-cols-3 items-end gap-3 sm:gap-5">
          <Photo src={second} className="rise d2 h-40 rounded-[1.6rem] border-4 border-white shadow-xl sm:h-64" />
          <div className="rise d3 relative">
            <Photo
              src={main}
              alt={service.imageAlt}
              priority
              className="h-56 rounded-[2rem] border-4 border-white shadow-2xl sm:h-80"
            />
            <StatBadge visual={visual} className="absolute -bottom-6 left-1/2 hidden -translate-x-1/2 sm:flex" />
          </div>
          <Photo src={third} className="rise d4 h-40 rounded-[1.6rem] border-4 border-white shadow-xl sm:h-64" />
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[92rem] gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-2 xl:px-12">
        <Reveal>
          <Eyebrow>Overview</Eyebrow>
          <p className="mt-6 text-xl leading-9 font-medium text-ink/85">{detail.intro}</p>
        </Reveal>
        <Reveal delay={120}>
          <ol className="divide-y divide-line border-y border-line">
            {detail.highlights.map((item, index) => (
              <li key={item} className="row-slide flex items-center gap-6 py-5">
                <span className="theme-text text-3xl font-extrabold">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-lg font-bold">{item}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="bg-surface">
        <div className="mx-auto grid w-full max-w-[92rem] gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[0.85fr_1.15fr] xl:px-12">
          <Reveal className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              What we <span className="theme-text">deliver</span>
            </h2>
            <Photo src={main} className="mt-8 h-72 rounded-[2rem] sm:h-80" />
            <ul className="mt-6 flex flex-wrap gap-2">
              {detail.stack.map((tech) => (
                <li key={tech} className="rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-ink ring-1 ring-line">
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>

          <ol className="relative space-y-12 border-l-2 border-dashed border-line pl-8 sm:pl-12">
            {detail.sections.map((section, index) => (
              <li key={section.title} className="relative">
                <span
                  className="theme-gradient absolute top-1 -left-[2.65rem] flex h-9 w-9 items-center justify-center rounded-full text-xs font-extrabold text-white ring-8 ring-surface sm:-left-[3.65rem]"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <Reveal delay={index * 80}>
                  <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{section.title}</h3>
                  <div className="mt-4 space-y-4">
                    {section.body.map((paragraph) => (
                      <p key={paragraph.slice(0, 32)} className="text-[0.98rem] leading-8 text-ink/75">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {browserShot ? (
        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <Reveal className="text-center">
            <Eyebrow>Live project</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Built and launched <span className="theme-text">by ALET</span>
            </h2>
          </Reveal>
          <Reveal delay={120} className="relative mt-12">
            <div className="theme-gradient absolute -inset-4 rounded-[2.5rem] opacity-25 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[1.6rem] border-[6px] border-night bg-night shadow-[0_40px_80px_-30px_rgb(30_27_75_/_0.6)]">
              <Image src={browserShot} alt="" width={1920} height={1080} className="h-auto w-full" />
            </div>
          </Reveal>
        </section>
      ) : null}

      <section className={`overflow-hidden ${browserShot ? "bg-surface" : ""} py-16 md:py-24`}>
        <div className="mx-auto w-full max-w-[92rem] px-5 sm:px-8 xl:px-12">
          <Reveal>
            <Eyebrow>Portfolio</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Recent <span className="theme-text">projects</span>
            </h2>
          </Reveal>
        </div>
        <PortfolioSlider serviceSlug={service.slug} />
      </section>

      <section className="mx-auto w-full max-w-[92rem] px-5 pt-16 sm:px-8 md:pt-24 xl:px-12">
        <Reveal className="grid gap-8 lg:grid-cols-[0.6fr_1.4fr]">
          <div>
            <Eyebrow>More services</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              You may <span className="theme-text">also need</span>
            </h2>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {related.map((item) => (
              <li key={item.id}>
                <Link href={`/${item.slug}`} className="row-slide group flex items-center gap-5 py-5">
                  <Photo src={item.image} className="h-20 w-28 shrink-0 rounded-2xl" />
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold tracking-tight transition group-hover:text-brand">
                      {item.title}
                    </h3>
                    <p className="mt-1 hidden text-sm text-muted sm:block">{item.description}</p>
                  </div>
                  <span className="theme-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition group-hover:translate-x-1">
                    <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <div className="pt-16 md:pt-24">
        <TestimonialsSection />
      </div>
    </>
  );
}

function HeroHeading({ detail }: { detail: ServiceDetail }) {
  return (
    <>
      <p className="rise d1 mt-6 text-xs font-bold tracking-[0.3em] text-white/60 uppercase">
        {detail.eyebrow}
      </p>
      <h1 className="rise d1 mt-4 text-4xl leading-[1.06] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
        {detail.headline} <span className="theme-text-light">{detail.accent}</span>
      </h1>
    </>
  );
}

function StatBadge({ visual, className = "" }: { visual: ServiceVisual; className?: string }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-ink shadow-[0_25px_50px_-20px_rgb(0_0_0_/_0.5)] ${className}`}
    >
      <span className="theme-text text-3xl font-extrabold tracking-tight">{visual.stat.value}</span>
      <span className="max-w-[8rem] text-xs leading-4 font-semibold text-muted">{visual.stat.label}</span>
    </div>
  );
}
