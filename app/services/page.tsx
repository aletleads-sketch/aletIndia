import type { Metadata } from "next";
import { DynamicServices } from "@/components/dynamic-services";
import { ContactSection } from "@/components/sections";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "Services — ALET India", description: "Explore ALET India's mobile, web, design, marketing, AI and CRM capabilities." };

export default function ServicesPage() {
  return <><section className="hero-mesh pt-36 pb-20 text-white"><div className="mx-auto w-full max-w-[92rem] px-5 sm:px-8 xl:px-12"><Eyebrow light>Capabilities</Eyebrow><h1 className="mt-4 max-w-3xl text-5xl font-extrabold tracking-tight sm:text-6xl">Technology that moves your business <span className="text-gradient">forward.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">Every service is managed from the ALET India CMS. Published services appear here automatically.</p></div></section><section className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 md:py-24 xl:px-12"><DynamicServices /></section><ContactSection title="Have a project in" accent="mind?" /></>;
}
