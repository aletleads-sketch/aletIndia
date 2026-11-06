import type * as code from "@/lib/content";
import type { careers, ServiceDetail, ServiceVisual } from "@/lib/pages";
import type { CmsMenuItem } from "@/lib/cms-client";
import type { SectionValues } from "@/lib/section-fields";

/** Cache tag for every website content read; the admin clears it after a save. */
export const SITE_CONTENT_TAG = "site-content";

export type MenuLink = { label: string; href: string };

export type SectionBlock = {
  type: string;
  text?: string;
  accent?: string;
  role?: string;
  href?: string;
  src?: string;
  alt?: string;
  value?: string;
  blocks?: SectionBlock[];
};

export type Brand = { logo: string; logoLight: string; favicon: string };

export const DEFAULT_BRAND: Brand = { logo: "/images/logo-dark.png", logoLight: "/images/logo-white.png", favicon: "" };

/** A row of public.page_sections. */
export type PageSection = {
  section_key: string;
  label: string;
  shared_key: string | null;
  collections: string[];
  /** Switched off in the admin: the website leaves the section out. */
  hidden?: boolean;
  sort_order?: number;
  content: {
    eyebrow?: string | null;
    heading?: string | null;
    accent?: string | null;
    intro?: string | null;
    images?: { src: string; alt: string }[];
    blocks?: SectionBlock[];
    data?: Record<string, unknown>;
    /** Editable values of a wired section (see lib/section-fields.ts). */
    fields?: Record<string, unknown>;
  };
};

/** A portfolio project card (public.projects). */
export type CaseStudyItem = {
  name: string;
  category: string;
  summary: string;
  tags: string[];
  color: string;
  logo: string;
  screens: string[];
  landscape?: boolean;
  mockup?: boolean;
};

export type NavigationItem = CmsMenuItem & { children: CmsMenuItem[] };

export type SiteContent = {
  company: typeof code.company;
  careersEmail: string;
  stats: typeof code.stats;
  achievements: typeof code.achievements;
  hero: typeof code.hero;
  about: typeof code.about;
  showcase: typeof code.showcase;
  ideology: typeof code.ideology;
  process: typeof code.process;
  services: (Omit<(typeof code.services)[number], "channels"> & { channels?: string[] })[];
  serviceDetails: Record<string, ServiceDetail>;
  serviceVisuals: Record<string, ServiceVisual>;
  caseStudies: CaseStudyItem[];
  clients: typeof code.clients;
  industries: typeof code.industries;
  faqs: typeof code.faqs;
  contactFaqs: { question: string; answer: string }[];
  testimonials: typeof code.testimonials;
  careers: typeof careers;
  navigation: NavigationItem[] | null;
  /** Footer menus; empty means "use the website's own list". */
  socialLinks: MenuLink[];
  footerDevelopment: MenuLink[];
  footerDesigning: MenuLink[];
  footerMarketing: MenuLink[];
  companyLinks: MenuLink[];
  legalLinks: MenuLink[];
  portals: MenuLink[];  /** Copy of the Inquire Now popup and form. */
  inquireForm: SectionValues<"_shared#inquire_form">;
  /** Logos and browser-tab icon, set in the admin's Site Settings (the design's files by default). */
  brand: Brand;
  /** "page path#section key" → section row */
  sections: Record<string, PageSection>;
};

/**
 * The editable copy of one section, read in page order:
 * heading (with its highlighted words split out), paragraphs, links and images.
 * Each value falls back to the code's text when the section is missing.
 */
export function sectionCopy(section: PageSection | null | undefined) {
  const blocks = section?.content.blocks ?? [];
  const heading = section?.content.heading ?? null;
  const accent = section?.content.accent ?? null;
  const title = heading && accent && heading.endsWith(accent) ? heading.slice(0, heading.length - accent.length).trim() : heading;
  return {
    eyebrow: section?.content.eyebrow ?? null,
    heading,
    accent,
    /** Heading without the highlighted part, e.g. "Engineers at heart." */
    title,
    paragraphs: blocks.filter((block) => block.type === "p" && block.role !== "eyebrow").map((block) => block.text ?? ""),
    links: blocks.filter((block) => block.type === "link" && block.text).map((block) => ({ text: block.text ?? "", href: block.href ?? "/" })),
    images: section?.content.images ?? [],
    blocks,
  };
}

/** Uses the stored text when there is some, otherwise the code's own text. */
export const textOr = (value: string | null | undefined, fallback: string) => (value && value.trim() ? value : fallback);

/** Uses the stored list when it has items, otherwise the code's list. */
export const listOr = <T,>(value: T[] | null | undefined, fallback: T[]) => (value && value.length ? value : fallback);

/** For a design with a fixed number of image slots: the stored image for slot `index`, else the code's. */
export const slotOr = <T,>(value: T[] | null | undefined, index: number, fallback: T) => value?.[index] ?? fallback;
