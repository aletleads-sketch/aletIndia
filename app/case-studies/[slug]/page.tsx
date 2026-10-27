import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow, Eyebrow } from "@/components/ui";
import { Breadcrumb, Wave } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ContactSection } from "@/components/sections";
import { caseStudyDetails, getCaseStudy } from "@/lib/case-study-data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return caseStudyDetails.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  return caseStudy ? { title: `${caseStudy.study.name} Case Study — Alet India`, description: caseStudy.study.summary } : {};
}

function ProjectVisual({ src, alt, landscape }: { src: string; alt: string; landscape: boolean }) {
  if (landscape) {
    return <div className="absolute inset-0 flex items-center justify-center bg-[#17213f] p-5 sm:p-8"><div className="w-full overflow-hidden rounded-[1.6rem] border-[8px] border-[#151925] bg-[#151925] p-1.5 shadow-[0_26px_55px_-22px_rgb(0_0_0_/_0.8)]"><div className="relative aspect-video overflow-hidden rounded-[1rem] bg-slate-800"><Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /></div></div></div>;
  }
  return <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-contain object-center p-5 sm:p-8" />;
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  if (!caseStudy) notFound();

  const { study } = caseStudy;
  const landscape = "landscape" in study && study.landscape;

  return <>
    <section className="hero-mesh relative overflow-hidden text-white">
      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className={`pointer-events-none absolute -top-24 -right-20 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br ${study.color} opacity-35 blur-3xl`} />
      <div className="relative mx-auto grid min-h-[38rem] w-full max-w-[92rem] items-center gap-12 px-5 pt-36 pb-28 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:pt-40 xl:px-12">
        <div><Breadcrumb crumb={study.name} className="rise" /><p className="rise d1 mt-7 text-xs font-bold tracking-[0.26em] text-brand-2 uppercase">Case study · {caseStudy.kicker}</p><h1 className="rise d1 mt-4 max-w-3xl text-5xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">{caseStudy.heroTitle} <span className="text-gradient">{caseStudy.heroAccent}</span></h1><p className="rise d2 mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{study.summary}</p><Link href="#story" className="rise d3 btn-sheen bg-brand-gradient mt-9 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_-8px_rgb(79_70_229_/_0.8)] transition hover:-translate-y-0.5">Explore the story <Arrow /></Link></div>
        <Reveal delay={140} className="relative mx-auto w-full max-w-2xl"><div className={`absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br ${study.color} opacity-40 blur-3xl`} aria-hidden="true" /><div className="relative h-[22rem] overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-[0_32px_80px_-28px_rgb(0_0_0_/_0.7)] backdrop-blur sm:h-[27rem]"><ProjectVisual src={study.screens[0]} alt={`${study.name} product experience`} landscape={Boolean(landscape)} /></div><div className="glass absolute -bottom-6 -left-3 rounded-2xl px-5 py-4 text-white sm:-left-8"><p className="text-2xl font-extrabold">{study.name}</p><p className="mt-1 text-sm text-white/70">{study.category}</p></div></Reveal>
      </div>
      <Wave />
    </section>

    <section id="story" className="scroll-mt-24 px-5 py-16 sm:px-8 md:py-24 xl:px-12"><div className="mx-auto grid w-full max-w-[92rem] gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center"><Reveal><Eyebrow>The opportunity</Eyebrow><h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">A better path through <span className="text-gradient-dark">every important moment.</span></h2><p className="mt-6 max-w-xl text-lg leading-8 text-ink/75">{caseStudy.challenge}</p><dl className="mt-9 grid grid-cols-3 gap-4 border-y border-line py-6">{caseStudy.metrics.map(([value, label]) => <div key={label}><dt className="text-gradient-dark text-3xl font-extrabold">{value}</dt><dd className="mt-1 text-xs font-semibold text-muted">{label}</dd></div>)}</dl></Reveal><Reveal delay={120} className="relative"><div className={`absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] bg-gradient-to-br ${study.color}`} aria-hidden="true" /><div className="relative h-80 overflow-hidden rounded-[2rem] bg-surface sm:h-[28rem]"><ProjectVisual src={study.screens[1] ?? study.screens[0]} alt={`${study.name} interface`} landscape={Boolean(landscape)} /></div></Reveal></div></section>

    <section className="bg-surface"><div className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 md:py-24 xl:px-12"><Reveal className="mx-auto max-w-2xl text-center"><Eyebrow>What changed</Eyebrow><h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Built around people, <span className="text-gradient-dark">not product complexity.</span></h2></Reveal><ul className="mt-12 grid gap-6 md:grid-cols-3">{caseStudy.outcomes.map(([title, body], index) => <li key={title}><Reveal delay={index * 90} className="lift h-full rounded-[2rem] bg-white p-8 ring-1 ring-line shadow-[0_20px_50px_-35px_rgb(30_27_75_/_0.45)]"><span className="text-gradient-dark text-5xl font-extrabold">0{index + 1}</span><h3 className="mt-6 text-2xl font-extrabold tracking-tight">{title}</h3><p className="mt-4 text-[0.98rem] leading-7 text-muted">{body}</p></Reveal></li>)}</ul></div></section>

    <section className="overflow-hidden bg-night py-16 text-white md:py-24"><div className="mx-auto grid w-full max-w-[92rem] gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] xl:px-12"><Reveal><Eyebrow light>How we approached it</Eyebrow><h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">From the first idea to <span className="text-gradient">a usable product.</span></h2><p className="mt-6 max-w-lg text-base leading-8 text-white/70">We shaped the work around the jobs people need to finish—not around complicated technology or unfamiliar workflows.</p></Reveal><ol className="space-y-6">{caseStudy.steps.map(([number, title, body]) => <li key={number} className="glass rounded-2xl p-6 sm:flex sm:gap-6"><span className="text-gradient text-3xl font-extrabold">{number}</span><div className="mt-3 sm:mt-0"><h3 className="text-xl font-extrabold">{title}</h3><p className="mt-2 leading-7 text-white/65">{body}</p></div></li>)}</ol></div></section>

    <section className="px-5 py-16 sm:px-8 md:py-24 xl:px-12"><div className="mx-auto grid w-full max-w-[92rem] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"><Reveal className={`relative h-80 overflow-hidden rounded-[2rem] bg-gradient-to-br ${study.color} sm:h-[28rem]`}><ProjectVisual src={study.screens[0]} alt={`${study.name} final product`} landscape={Boolean(landscape)} /></Reveal><Reveal delay={120}><Eyebrow>The result</Eyebrow><h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">A digital experience people can <span className="text-gradient-dark">understand at a glance.</span></h2><p className="mt-6 text-lg leading-8 text-ink/75">{caseStudy.result}</p><Link href="/contact-us" className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-brand">Discuss a similar project <Arrow /></Link></Reveal></div></section>
    <ContactSection title="Have a project with a" accent="story to tell?" />
  </>;
}
