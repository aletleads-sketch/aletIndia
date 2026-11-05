import type { Metadata } from "next";
import Image from "next/image";
import { InquireForm } from "@/components/inquire-form";
import { Breadcrumb, HeroTitle, Wave } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Eyebrow, Photo } from "@/components/ui";
import { company as codeCompany } from "@/lib/content";
import { loadFields, loadSiteContent } from "@/lib/site-content";
import type { SectionValues } from "@/lib/section-fields";
import { canonical } from "@/lib/seo";
import { withSeoOverrides } from "@/lib/seo-overrides";
import { JsonLd } from "@/components/json-ld";
import { loadSchemaSettings } from "@/lib/seo-schema";
import { faqSchema } from "@/lib/seo-schema-shared";

export async function generateMetadata(): Promise<Metadata> {
  const { company } = await loadSiteContent();
  return withSeoOverrides("/contact-us", {
    alternates: canonical("/contact-us"),
    title: "Contact Us — Alet India",
    description: `Talk to ALET India about your mobile app, web, design, or marketing project. Call ${company.phone} or email ${company.email}.`,
  });
}

const contactChannels = (company: typeof codeCompany, careersEmail: string, copy: SectionValues<"/contact-us#hero">) => {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`;
  return [
  { label: copy.callLabel, value: company.phone, href: company.phoneHref, icon: "M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1Z" },
  { label: copy.salesLabel, value: company.email, href: `mailto:${company.email}`, icon: "M4 6h16v12H4zM4 7l8 6 8-6" },
  { label: copy.careersLabel, value: careersEmail, href: `mailto:${careersEmail}`, icon: "M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 8h16v11H4zM4 13h16" },
  { label: copy.visitLabel, value: copy.visitValue, href: mapsHref, icon: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" },
];
};

/** Used when the Contact FAQs cannot be read from the database (faqs, topic = contact). */
const defaultFaqs = (company: typeof codeCompany) => [
  {
    q: "What services does Alet India Softwares offer?",
    a: "Alet India Softwares specializes in custom mobile app development, web development, software solutions, and IT consulting. We help businesses turn their ideas into scalable, secure, and high-performing digital products.",
  },
  {
    q: "How can I get a quote for my project?",
    a: `Simply fill out our Contact Us form or email us at ${company.email} with your project requirements. Our team will review your needs and provide a customized proposal covering the scope, estimated timeline, and development cost.`,
  },
  {
    q: "How much does it cost to develop a mobile app or website?",
    a: "Development costs depend on project complexity, features, design requirements, technology stack, and timeline. We offer flexible pricing options tailored to your business needs and budget.",
  },
  {
    q: "Do you work with international clients?",
    a: "Yes! Alet India Softwares collaborates with businesses worldwide, providing remote software development services, transparent communication, and structured project delivery to ensure smooth collaboration across different time zones.",
  },
];

export default async function ContactPage() {
  const [schema, content, hero, form, faqCopy] = await Promise.all([
    loadSchemaSettings(),
    loadSiteContent(),
    loadFields("/contact-us#hero"),
    loadFields("/contact-us#contact_form"),
    loadFields("/contact-us#faq"),
  ]);
  const { company } = content;
  const channels = contactChannels(company, content.careersEmail, hero);
  const faqs = content.contactFaqs.length ? content.contactFaqs.map((faq) => ({ q: faq.question, a: faq.answer })) : defaultFaqs(company);
  return (
    <>
      <JsonLd items={schema.faq.enabled ? [faqSchema(faqs.map((faq) => ({ question: faq.q, answer: faq.a })))] : []} />
      <section className="hero-mesh relative overflow-hidden text-white">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid w-full max-w-[92rem] items-center gap-14 px-5 pt-36 pb-28 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-40 xl:px-12">
          <div>
            <Breadcrumb crumb={hero.crumb} className="rise" />
            <HeroTitle title={hero.title} accent={hero.accent} />
            <p className="rise d2 mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
              {hero.text}
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
              src={hero.image.src}
              alt={hero.image.alt}
              priority
              className="h-[28rem] rounded-[2.5rem] border-[6px] border-white/10 sm:h-[32rem]"
            />
            <div className="float absolute -bottom-6 -left-4 flex items-center gap-4 rounded-2xl bg-white px-5 py-4 text-ink shadow-2xl sm:-left-10">
              <span className="pulse-dot" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">{hero.responseLabel}</p>
                <p className="text-xl font-extrabold">{hero.responseValue}</p>
              </div>
            </div>
            <div className="float float-b glass absolute -top-5 -right-3 flex items-center gap-3 rounded-2xl px-4 py-3 sm:-right-8">
              <span className="flex -space-x-3">
                {hero.people.map(({ src }) => (
                  <Image key={src} src={src} alt="" width={40} height={40} className="h-9 w-9 rounded-full border-2 border-night object-cover" />
                ))}
              </span>
              <span className="text-xs font-bold">{hero.clientsBadge}</span>
            </div>
          </div>
        </div>
        <Wave />
      </section>

      <section id="contact" className="mx-auto grid w-full max-w-[92rem] scroll-mt-24 gap-8 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-[1.1fr_0.9fr] xl:px-12">
        <Reveal className="rounded-[2.5rem] bg-white p-3 ring-1 ring-line shadow-[0_30px_70px_-35px_rgb(30_27_75_/_0.45)]">
          <div className="px-5 pt-6 pb-5 sm:px-7">
            <Eyebrow>{form.eyebrow}</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {form.title} <span className="text-gradient-dark">{form.accent}</span>
            </h2>
          </div>
          <InquireForm />
        </Reveal>

        <Reveal delay={120} className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-[2.5rem]">
            <Photo src={form.officeImage.src} alt={form.officeImage.alt} className="h-64 sm:h-72" />
            <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white">
              <p className="text-xs font-bold tracking-[0.16em] text-brand-2 uppercase">{form.officeLabel}</p>
              <p className="mt-2 text-sm leading-6 text-white/90">{company.address}</p>
            </div>
          </div>
          <div className="min-h-[18rem] flex-1 overflow-hidden rounded-[2.5rem] ring-1 ring-line">
            <iframe
              title={form.mapTitle}
              src={`https://www.google.com/maps?q=${encodeURIComponent(company.address)}&output=embed`}
              className="h-full min-h-[18rem] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </section>

      <section className="bg-surface">
        <div className="mx-auto grid w-full max-w-[92rem] gap-12 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-[0.8fr_1.2fr] xl:px-12">
          <Reveal>
            <Eyebrow>{faqCopy.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {faqCopy.title} <span className="text-gradient-dark">{faqCopy.accent}</span>
            </h2>
            <Photo src={faqCopy.image.src} alt={faqCopy.image.alt} className="mt-8 hidden h-64 rounded-[2rem] lg:block" />
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
