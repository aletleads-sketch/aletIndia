"use client";

import { createContext, useContext, type ReactNode } from "react";
import * as code from "@/lib/content";
import { careers as codeCareers } from "@/lib/pages";
import { defaultFields } from "@/lib/section-fields";
import { DEFAULT_BRAND, type SiteContent } from "@/lib/site-content-shared";

/** The part of the website content that interactive (client) components need. */
export type ClientSiteContent = Pick<SiteContent, "company" | "services" | "caseStudies" | "testimonials" | "careers" | "showcase" | "inquireForm" | "brand">;

const fallback: ClientSiteContent = {
  company: code.company,
  services: code.services,
  caseStudies: code.caseStudies,
  testimonials: code.testimonials,
  careers: codeCareers,
  showcase: code.showcase,
  inquireForm: defaultFields("_shared#inquire_form"),
  brand: DEFAULT_BRAND,
};

const SiteContentContext = createContext<ClientSiteContent>(fallback);

export function SiteContentProvider({ value, children }: { value: ClientSiteContent; children: ReactNode }) {
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

/** Website content from the database (the code's content until it loads or if it fails). */
export function useSiteContent() {
  return useContext(SiteContentContext);
}
