import type { Metadata } from "next";
import { CaseStudyCard } from "@/components/case-study-card";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ContactSection } from "@/components/sections";
import { caseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Portfolio — Alet India",
  description:
    "Mobile apps, web platforms, and games ALET India has designed and built for clients across travel, delivery, real estate, fashion, sports, and gaming.",
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        crumb="Portfolio"
        title="Products we've"
        accent="brought to life"
        intro="Real apps for real clients — from on-demand delivery and ride booking to fashion stores, fantasy sports, and multiplayer games."
        actions={false}
      />

      <section className="mx-auto w-full max-w-[92rem] px-5 py-14 sm:px-8 md:py-20 xl:px-12">
        <ul className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {caseStudies.map((study, index) => (
            <li key={study.name}>
              <Reveal delay={(index % 3) * 90} className="h-full">
                <CaseStudyCard study={study} colorIndex={index} className="h-full" />
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <ContactSection title="Have a product in" accent="mind?" />
    </>
  );
}
