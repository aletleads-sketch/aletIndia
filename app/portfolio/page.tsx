import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumb, HeroTitle, Wave } from "@/components/page-hero";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { DynamicPortfolioGrid } from "@/components/dynamic-project-showcase";
import { Reveal } from "@/components/reveal";
import { ContactSection } from "@/components/sections";
import { Eyebrow, Photo } from "@/components/ui";
import { caseStudies, industries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Portfolio — Alet India",
  description:
    "Mobile apps, web platforms, and games ALET India has designed and built for clients across travel, delivery, real estate, fashion, sports, and gaming.",
};

const wall = [
  ["/images/work/tajika-1.png", "/images/QUICK-SAWARI.png", "/images/GURI-HOUSES.png"],
  ["/images/all_deliveries_app1.jpeg", "/images/Refult.png", "/images/work/app-1.png"],
  ["/images/QUICK-SAWARI-2.png", "/images/work/tajika-2.png", "/images/REFULT-2.png"],
];

export default function PortfolioPage() {
  const spotlight = caseStudies[0];

  return (
    <>
      <section className="hero-mesh relative overflow-hidden text-white">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] opacity-70 lg:block"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, #000 35%), linear-gradient(180deg, transparent, #000 22%, #000 80%, transparent)",
            maskComposite: "intersect",
          }}
          aria-hidden="true"
        >
          <div className="absolute top-10 right-[-2rem] flex rotate-[-8deg] gap-6">
            {wall.map((column, columnIndex) => (
              <div
                key={column[0]}
                className={`float flex flex-col gap-6 ${columnIndex === 1 ? "float-b mt-28" : columnIndex === 2 ? "float-c mt-10" : ""}`}
              >
                {column.map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={180}
                    height={360}
                    className="h-80 w-auto drop-shadow-[0_20px_30px_rgb(0_0_0_/_0.5)]"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[92rem] px-5 pt-36 pb-32 sm:px-8 lg:min-h-[42rem] lg:pt-44 xl:px-12">
          <div className="max-w-2xl">
            <Breadcrumb crumb="Portfolio" className="rise" />
            <HeroTitle title="Products we've" accent="brought to life" />
            <p className="rise d2 mt-6 text-base leading-7 text-white/70 sm:text-lg">
              Real apps for real clients — from on-demand delivery and ride booking to fashion
              stores, fantasy sports, and multiplayer games.
            </p>
            <dl className="rise d3 mt-10 flex flex-wrap gap-8">
              {[
                [caseStudies.length, "Featured projects"],
                [industries.length, "Industries served"],
                ["20+", "Countries"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-gradient text-4xl font-extrabold">{value}</dt>
                  <dd className="mt-1 text-sm text-white/60">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <Wave />
      </section>

      <section className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 md:py-24 xl:px-12">
        <Reveal className="grid overflow-hidden rounded-[2.5rem] bg-night text-white lg:grid-cols-2">
          <div className="relative flex items-end justify-center gap-4 bg-gradient-to-br from-[#5b4bdb] to-[#8b5cf6] px-6 pt-14">
            <div className="dot-grid pointer-events-none absolute inset-0" />
            {spotlight.screens.map((src, index) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={280}
                height={560}
                className={`relative w-auto drop-shadow-[0_24px_30px_rgb(0_0_0_/_0.4)] ${
                  index === 1 ? "h-80 sm:h-[26rem]" : "h-64 sm:h-80"
                }`}
              />
            ))}
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-14">
            <Eyebrow light>Project spotlight</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{spotlight.name}</h2>
            <p className="mt-2 text-sm font-bold tracking-[0.16em] text-white/60 uppercase">
              {spotlight.category}
            </p>
            <p className="mt-6 text-base leading-8 text-white/75">{spotlight.summary}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {spotlight.tags.map((tag) => (
                <li key={tag} className="glass rounded-full px-4 py-1.5 text-xs font-bold">
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="bg-surface">
        <div className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 md:py-24 xl:px-12">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Case studies</Eyebrow>
              <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Browse our <span className="text-gradient-dark">work</span>
              </h2>
            </div>
          </Reveal>
          <DynamicPortfolioGrid fallback={<PortfolioGrid />} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[92rem] px-5 pt-16 sm:px-8 md:pt-24 xl:px-12">
        <Reveal className="max-w-2xl">
          <Eyebrow>Industries</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Sectors we <span className="text-gradient-dark">build for</span>
          </h2>
        </Reveal>
        <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {industries.slice(0, 8).map((industry, index) => (
            <li key={industry.name} className={index === 0 || index === 5 ? "md:col-span-2" : ""}>
              <Reveal delay={(index % 4) * 70}>
                <div className="group relative h-52 overflow-hidden rounded-[1.6rem] sm:h-60">
                  <div className="zoom-img absolute inset-0">
                    <Photo src={industry.image} className="h-full" sizes="(max-width: 768px) 50vw, 33vw" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent" />
                  <p className="absolute bottom-5 left-5 text-lg font-extrabold text-white">{industry.name}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <ContactSection title="Have a product in" accent="mind?" />
    </>
  );
}
