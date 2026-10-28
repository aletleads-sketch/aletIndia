import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumb, Wave } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ContactSection } from "@/components/sections";
import { Arrow, Eyebrow, Photo } from "@/components/ui";
import { CaseStudiesIndex } from "@/components/case-studies-index";

export const metadata: Metadata = {
  title: "Case Studies — Alet India",
  description: "A closer look at how ALET India turns operational challenges into clear digital products.",
};

const outcomes = [
  ["One clear journey", "Book a parcel, shopping run, or vehicle in one familiar flow."],
  ["Live visibility", "Give customers order updates while the team manages every delivery from one panel."],
  ["Built to scale", "A responsive public website and operating dashboard designed for everyday growth."],
];

const deliverySteps = [
  ["01", "Understand the operation", "We mapped the customer journey from booking through pickup, payment, tracking, and delivery."],
  ["02", "Design the simple path", "We made the next action obvious on every screen, without losing the detail operations need."],
  ["03", "Build the connected product", "The website, customer experience, and internal workflow were designed to work together."],
];

export function LegacyAllDeliveriesCaseStudy() {
  return (
    <>
      <section className="hero-mesh relative overflow-hidden text-white">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="orb pointer-events-none absolute top-16 -right-20 h-96 w-96 rounded-full bg-brand/35 blur-3xl" />
        <div className="relative mx-auto grid min-h-[38rem] w-full max-w-[92rem] items-center gap-12 px-5 pt-36 pb-28 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:pt-40 xl:px-12">
          <div>
            <Breadcrumb crumb="Case Studies" className="rise" />
            <p className="rise d1 mt-7 text-xs font-bold tracking-[0.26em] text-brand-2 uppercase">ALET in action</p>
            <h1 className="rise d1 mt-4 max-w-3xl text-5xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Work that makes <span className="text-gradient">the complex feel simple.</span>
            </h1>
            <p className="rise d2 mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              A closer look at the thinking, design, and technology behind products ALET India builds for real businesses.
            </p>
            <Link href="#all-deliveries" className="rise d3 btn-sheen bg-brand-gradient mt-9 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_-8px_rgb(79_70_229_/_0.8)] transition hover:-translate-y-0.5">
              Explore the first study <Arrow />
            </Link>
          </div>

          <Reveal delay={140} className="relative mx-auto w-full max-w-2xl">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-brand/25 blur-3xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-[0_32px_80px_-28px_rgb(0_0_0_/_0.7)] backdrop-blur">
              <Image src="/images/all-deliveries-website.png" alt="All Deliveries website" width={1200} height={700} priority className="h-auto w-full rounded-[1.35rem]" />
            </div>
            <div className="glass absolute -bottom-6 -left-3 rounded-2xl px-5 py-4 text-white sm:-left-8">
              <p className="text-2xl font-extrabold">All Deliveries</p>
              <p className="mt-1 text-sm text-white/70">Courier & logistics platform</p>
            </div>
          </Reveal>
        </div>
        <Wave />
      </section>

      <section id="all-deliveries" className="scroll-mt-24 px-5 py-16 sm:px-8 md:py-24 xl:px-12">
        <div className="mx-auto grid w-full max-w-[92rem] gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <Reveal>
            <Eyebrow>Case study · 01</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              All Deliveries: delivery made <span className="text-gradient-dark">clearer.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/75">
              All Deliveries needed a digital experience that could explain several services quickly, make booking easy, and keep both customers and the operations team informed.
            </p>
            <dl className="mt-9 grid grid-cols-3 gap-4 border-y border-line py-6">
              {[['3', 'Service types'], ['1', 'Connected journey'], ['24/7', 'Customer access']].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-gradient-dark text-3xl font-extrabold">{value}</dt>
                  <dd className="mt-1 text-xs font-semibold text-muted">{label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={120} className="relative">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] bg-brand-gradient" aria-hidden="true" />
            <Photo src="/images/all_deliveries_home.png" alt="All Deliveries mobile experience" className="relative h-80 rounded-[2rem] bg-surface sm:h-[28rem]" />
          </Reveal>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 md:py-24 xl:px-12">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>The challenge</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">One platform. <span className="text-gradient-dark">Many moving parts.</span></h2>
          </Reveal>
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {outcomes.map(([title, body], index) => (
              <li key={title}>
                <Reveal delay={index * 90} className="lift h-full rounded-[2rem] bg-white p-8 ring-1 ring-line shadow-[0_20px_50px_-35px_rgb(30_27_75_/_0.45)]">
                  <span className="text-gradient-dark text-5xl font-extrabold">0{index + 1}</span>
                  <h3 className="mt-6 text-2xl font-extrabold tracking-tight">{title}</h3>
                  <p className="mt-4 text-[0.98rem] leading-7 text-muted">{body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="overflow-hidden bg-night py-16 text-white md:py-24">
        <div className="mx-auto grid w-full max-w-[92rem] gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] xl:px-12">
          <Reveal>
            <Eyebrow light>How we approached it</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">From a booking request to a <span className="text-gradient">reliable delivery.</span></h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-white/70">The project was designed around the jobs people need to finish—not around a complicated product structure.</p>
          </Reveal>
          <ol className="space-y-6">
            {deliverySteps.map(([number, title, body]) => (
              <li key={number} className="glass rounded-2xl p-6 sm:flex sm:gap-6">
                <span className="text-gradient text-3xl font-extrabold">{number}</span>
                <div className="mt-3 sm:mt-0"><h3 className="text-xl font-extrabold">{title}</h3><p className="mt-2 leading-7 text-white/65">{body}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:py-24 xl:px-12">
        <div className="mx-auto grid w-full max-w-[92rem] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-[#c2410c] p-5 sm:p-8">
            <Image src="/images/all-deliveries-website.png" alt="All Deliveries responsive website design" width={1200} height={700} className="h-auto w-full rounded-[1.35rem] shadow-[0_22px_44px_-18px_rgb(0_0_0_/_0.55)]" />
          </Reveal>
          <Reveal delay={120}>
            <Eyebrow>The result</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">A delivery experience people can <span className="text-gradient-dark">understand at a glance.</span></h2>
            <p className="mt-6 text-lg leading-8 text-ink/75">The final product gives customers a direct route from need to booking, and gives the delivery business a professional digital foundation it can keep building on.</p>
            <Link href="/contact-us" className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-brand">Discuss a similar project <Arrow /></Link>
          </Reveal>
        </div>
      </section>

      <ContactSection title="Have a project with a" accent="story to tell?" />
    </>
  );
}

export default function CaseStudiesPage() {
  return <CaseStudiesIndex />;
}
