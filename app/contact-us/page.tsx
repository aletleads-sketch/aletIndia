import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ContactSection } from "@/components/sections";
import { company } from "@/lib/content";
import { careers } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Contact Us — Alet India",
  description: `Talk to ALET India about your mobile app, web, design, or marketing project. Call ${company.phone} or email ${company.email}.`,
};

const channels = [
  { label: "Call us", value: company.phone, href: company.phoneHref },
  { label: "Sales", value: company.email, href: `mailto:${company.email}` },
  { label: "Careers", value: careers.email, href: `mailto:${careers.email}` },
  {
    label: "Visit us",
    value: "Mayur Vihar Phase I, New Delhi",
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumb="Contact Us"
        title="Let's talk about"
        accent="your idea"
        intro="Share your project, budget, and timeline — our team replies within 24 hours with next steps and a free consultation."
        actions={false}
      />

      <section className="relative z-10 -mt-16 px-5 sm:px-8">
        <Reveal className="mx-auto grid max-w-[92rem] gap-px overflow-hidden rounded-3xl bg-line shadow-[0_30px_70px_-25px_rgb(30_27_75_/_0.35)] sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              {...(channel.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              className="group bg-white px-6 py-6 transition hover:bg-surface"
            >
              <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">
                {channel.label}
              </p>
              <p className="mt-2 text-base font-extrabold text-ink transition group-hover:text-brand">
                {channel.value}
              </p>
            </a>
          ))}
        </Reveal>
      </section>

      <ContactSection />

      <section className="mx-auto w-full max-w-[92rem] px-5 pb-14 sm:px-8 md:pb-20 xl:px-12">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] border border-line shadow-[0_20px_60px_-30px_rgb(30_27_75_/_0.35)]">
            <iframe
              title="ALET India office location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(company.address)}&output=embed`}
              className="h-[24rem] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </section>
    </>
  );
}
