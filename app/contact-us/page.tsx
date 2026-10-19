import type { Metadata } from "next";
import Image from "next/image";
import { InquireForm } from "@/components/inquire-form";
import { Breadcrumb, HeroTitle, Wave } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Eyebrow, Photo } from "@/components/ui";
import { company, services } from "@/lib/content";
import { careers } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Contact Us — Alet India",
  description: `Talk to ALET India about your mobile app, web, design, or marketing project. Call ${company.phone} or email ${company.email}.`,
};

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`;

const channels = [
  { label: "Call us", value: company.phone, href: company.phoneHref, icon: "M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1Z" },
  { label: "Sales", value: company.email, href: `mailto:${company.email}`, icon: "M4 6h16v12H4zM4 7l8 6 8-6" },
  { label: "Careers", value: careers.email, href: `mailto:${careers.email}`, icon: "M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 8h16v11H4zM4 13h16" },
  { label: "Visit us", value: "Mayur Vihar Phase I, New Delhi", href: mapsHref, icon: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" },
];

const faqs = [
  {
    q: "How soon will I hear back?",
    a: "Our team replies to every inquiry within 24 hours with next steps and a time for a free consultation call.",
  },
  {
    q: "Which services can I ask about?",
    a: `Anything we offer — ${services
      .slice(0, 6)
      .map((service) => service.title)
      .join(", ")}, and more.`,
  },
  {
    q: "Do you work with clients outside India?",
    a: "Yes. We have delivered projects for businesses in more than 20 countries and work comfortably across time zones.",
  },
  {
    q: "Can I visit your office?",
    a: `Of course. We are at ${company.address}. Call ahead and we'll set up a meeting.`,
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="hero-mesh relative overflow-hidden text-white">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid w-full max-w-[92rem] items-center gap-14 px-5 pt-36 pb-28 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-40 xl:px-12">
          <div>
            <Breadcrumb crumb="Contact Us" className="rise" />
            <HeroTitle title="Let's talk about" accent="your idea" />
            <p className="rise d2 mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
              Share your project, budget, and timeline — our team replies within 24 hours with
              next steps and a free consultation.
            </p>
            <ul className="rise d3 mt-10 grid gap-3 sm:grid-cols-2">
              {channels.map((channel) => (
                <li key={channel.label}>
                  <a
                    href={channel.href}
                    {...(channel.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="glass group flex items-center gap-4 rounded-2xl px-5 py-4 transition hover:bg-white/15"
                  >
                    <span className="bg-brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                        <path d={channel.icon} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold tracking-[0.16em] text-brand-2 uppercase">
                        {channel.label}
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-bold">{channel.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="rise d2 relative mx-auto w-full max-w-lg">
            <Photo
              src="/images/pages/contact-desk.jpg"
              alt="Planning a project on a laptop"
              priority
              className="h-[28rem] rounded-[2.5rem] border-[6px] border-white/10 sm:h-[32rem]"
            />
            <div className="float absolute -bottom-6 -left-4 flex items-center gap-4 rounded-2xl bg-white px-5 py-4 text-ink shadow-2xl sm:-left-10">
              <span className="pulse-dot" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Avg. response</p>
                <p className="text-xl font-extrabold">Under 24 hrs</p>
              </div>
            </div>
            <div className="float float-b glass absolute -top-5 -right-3 flex items-center gap-3 rounded-2xl px-4 py-3 sm:-right-8">
              <span className="flex -space-x-3">
                {["/images/people/aadi.jpg", "/images/people/rk.jpg", "/images/people/insight.png"].map((src) => (
                  <Image key={src} src={src} alt="" width={40} height={40} className="h-9 w-9 rounded-full border-2 border-night object-cover" />
                ))}
              </span>
              <span className="text-xs font-bold">500+ happy clients</span>
            </div>
          </div>
        </div>
        <Wave />
      </section>

      <section id="contact" className="mx-auto grid w-full max-w-[92rem] scroll-mt-24 gap-8 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[1.1fr_0.9fr] xl:px-12">
        <Reveal className="rounded-[2.5rem] bg-white p-3 ring-1 ring-line shadow-[0_30px_70px_-35px_rgb(30_27_75_/_0.45)]">
          <div className="px-5 pt-6 pb-5 sm:px-7">
            <Eyebrow>Send an inquiry</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Tell us about your <span className="text-gradient-dark">project</span>
            </h2>
          </div>
          <InquireForm />
        </Reveal>

        <Reveal delay={120} className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-[2.5rem]">
            <Photo src="/images/pages/office-2.jpg" alt="Modern office workspace" className="h-64 sm:h-72" />
            <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white">
              <p className="text-xs font-bold tracking-[0.16em] text-brand-2 uppercase">Our office</p>
              <p className="mt-2 text-sm leading-6 text-white/90">{company.address}</p>
            </div>
          </div>
          <div className="min-h-[18rem] flex-1 overflow-hidden rounded-[2.5rem] ring-1 ring-line">
            <iframe
              title="ALET India office location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(company.address)}&output=embed`}
              className="h-full min-h-[18rem] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </section>

      <section className="bg-surface">
        <div className="mx-auto grid w-full max-w-[92rem] gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[0.8fr_1.2fr] xl:px-12">
          <Reveal>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Before you <span className="text-gradient-dark">reach out</span>
            </h2>
            <Photo src="/images/pages/video-call.jpg" className="mt-8 hidden h-64 rounded-[2rem] lg:block" />
          </Reveal>
          <Reveal delay={120} className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={faq.q}
                open={index === 0}
                className="group rounded-3xl bg-white px-7 py-6 ring-1 ring-line open:shadow-[0_20px_50px_-35px_rgb(30_27_75_/_0.45)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-extrabold">
                  {faq.q}
                  <span className="bg-brand-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[0.98rem] leading-7 text-ink/75">{faq.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
