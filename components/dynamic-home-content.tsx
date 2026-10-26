"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/reveal";
import { Arrow, Eyebrow } from "@/components/ui";
import { about, achievements, clients, industries } from "@/lib/content";
import { assetPath } from "@/lib/site-path";
import {
  getPublishedClientLogos,
  getPublishedIndustries,
  getPublishedSection,
  type CmsClientLogo,
  type CmsIndustry,
  type CmsSiteSection,
} from "@/lib/cms-client";

export function DynamicClientMarquee() {
  const [items, setItems] = useState<CmsClientLogo[] | null>(null);

  useEffect(() => {
    getPublishedClientLogos().then((rows) => setItems(rows.length ? rows : null)).catch(() => undefined);
  }, []);

  const visible = items?.map((item) => ({ name: item.client_name, logo: item.logo_url, href: item.website_url }))
    ?? clients.map((item) => ({ ...item, href: null }));

  return (
    <section className="py-10 sm:py-12" aria-label="Our clients">
      <p className="text-center text-xs font-bold tracking-[0.22em] text-muted uppercase">Driving technology for our clients</p>
      <div className="marquee mx-auto mt-6 max-w-[92rem]">
        <ul className="marquee-track items-center gap-6 pr-6">
          {[...visible, ...visible].map((client, index) => (
            <li key={`${client.logo}-${index}`} className="flex h-20 w-44 shrink-0 items-center justify-center rounded-2xl border border-line bg-white px-5 grayscale transition duration-300 hover:grayscale-0">
              {client.href ? <a href={assetPath(client.href)} target="_blank" rel="noreferrer"><ClientLogo client={client} alt={index < visible.length ? client.name : ""} /></a> : <ClientLogo client={client} alt={index < visible.length ? client.name : ""} />}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ClientLogo({ client, alt }: { client: { logo: string; name: string }; alt: string }) {
  return <img src={assetPath(client.logo)} alt={alt} className="max-h-[3.3rem] w-auto max-w-[8rem] object-contain" />;
}

export function DynamicIndustries() {
  const [items, setItems] = useState<CmsIndustry[] | null>(null);
  const [section, setSection] = useState<CmsSiteSection | null>(null);

  useEffect(() => {
    Promise.all([getPublishedIndustries(), getPublishedSection("home_industries")])
      .then(([industryRows, sectionRow]) => { setItems(industryRows.length ? industryRows : null); setSection(sectionRow); })
      .catch(() => undefined);
  }, []);

  const visible = items?.map((item) => ({ name: item.name, image: item.image_url || "/images/industries/travel.jpg" })) ?? industries;
  const eyebrow = section?.eyebrow || "Industries";
  const heading = section?.heading || "Your industry doesn't matter.";
  const accent = section?.accent_text || "We make it real.";
  const intro = section?.intro || "We have built apps for almost every category of the App Store, from travel and pharma to fantasy sports and on-demand delivery.";

  return (
    <section className="mx-auto w-full max-w-[92rem] px-5 py-14 sm:px-8 md:py-20 xl:px-12">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{heading} <span className="text-gradient-dark">{accent}</span></h2>
          <p className="mt-5 max-w-md text-base leading-7 text-muted">{intro}</p>
          <ul className="mt-8 flex flex-wrap items-center gap-6">
            {achievements.map((item) => <li key={item.src}><img src={assetPath(item.src)} alt={item.alt} className="h-24 w-auto object-contain transition duration-300 hover:scale-105" /></li>)}
          </ul>
        </Reveal>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {visible.map((industry, index) => (
            <li key={`${industry.name}-${index}`}><Reveal delay={(index % 4) * 70} className="h-full"><div className="gradient-border lift group relative flex h-full min-h-32 flex-col justify-between overflow-hidden rounded-2xl bg-white p-5"><div className="pointer-events-none absolute inset-0" aria-hidden="true"><img src={assetPath(industry.image)} alt="" className="h-full w-full scale-105 object-cover blur-[1px] transition duration-700 group-hover:scale-110 group-hover:blur-[0.5px]" /><div className="absolute inset-0 bg-gradient-to-b from-white/65 via-white/72 to-white/82" /></div><span className="relative text-xs font-extrabold text-brand">{String(index + 1).padStart(2, "0")}</span><span className="relative mt-6 text-[0.95rem] leading-snug font-extrabold text-ink">{industry.name}</span></div></Reveal></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function DynamicAbout() {
  const [section, setSection] = useState<CmsSiteSection | null>(null);
  useEffect(() => { getPublishedSection("home_about").then(setSection).catch(() => undefined); }, []);
  const eyebrow = section?.eyebrow || about.title;
  const heading = section?.heading || "You can be";
  const accent = section?.accent_text || "bigger with ALET INDIA";
  const intro = section?.intro || "Take first step towards your success.";
  const paragraphs = section?.body?.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean) || about.paragraphs;
  const lead = paragraphs[0].split(". ").slice(0, 2).join(". ") + ".";
  return (
    <section id="about" className="mx-auto w-full max-w-[92rem] scroll-mt-24 px-5 py-14 sm:px-8 md:py-20 xl:px-12">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal><Eyebrow>{eyebrow}</Eyebrow><h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{heading} <span className="text-gradient-dark">{accent}</span></h2><p className="mt-5 text-sm font-semibold tracking-wide text-accent uppercase">{intro}</p></Reveal>
        <Reveal delay={120}><p className="text-lg leading-8 text-ink/80">{lead}</p><details className="group mt-6"><summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-brand">Read our full story<span className="faq-icon text-lg leading-none transition duration-300">+</span></summary><div className="mt-6 space-y-5">{paragraphs.map((paragraph) => <p key={paragraph.slice(0, 24)} className="text-base leading-8 text-muted">{paragraph}</p>)}</div></details><Link href="/about-us" className="mt-6 flex w-fit items-center gap-2 text-sm font-extrabold text-brand">More about ALET India<Arrow /></Link></Reveal>
      </div>
    </section>
  );
}
