import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { ContactSection, ServiceCard } from "@/components/sections";
import { Eyebrow } from "@/components/ui";
import { loadFields, loadSiteContent } from "@/lib/site-content";
import { canonical } from "@/lib/seo";
import { withSeoOverrides } from "@/lib/seo-overrides";

const baseMetadata: Metadata = { alternates: canonical("/services"), title: "Services — ALET India", description: "Explore ALET India's mobile, web, design, marketing, AI and CRM capabilities." };

export function generateMetadata() {
  return withSeoOverrides("/services", baseMetadata);
}

export default async function ServicesPage() {
  const [{ services }, copy] = await Promise.all([loadSiteContent(), loadFields("/services#hero")]);
  return <><section className="hero-mesh pt-36 pb-20 text-white"><div className="mx-auto w-full max-w-[92rem] px-5 sm:px-8 xl:px-12"><Eyebrow light>{copy.eyebrow}</Eyebrow><h1 className="mt-4 max-w-3xl text-5xl font-extrabold tracking-tight sm:text-6xl">{copy.title} <span className="text-gradient">{copy.accent}</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">{copy.text}</p></div></section><section className="mx-auto w-full max-w-[92rem] px-5 py-12 sm:px-8 md:py-16 xl:px-12"><ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{services.map((service, index) => <li key={service.id} id={service.slug} className="scroll-mt-32"><Reveal delay={(index % 3) * 90} className="h-full"><ServiceCard service={service} /></Reveal></li>)}</ul></section><ContactSection placement="Services" /></>;
}
