import { company } from "@/lib/content";
import { ORGANIZATION_ID, pageUrl } from "@/lib/seo";

/** Structured data types the admin can switch on and off (rows of `public.seo_schema`). */
export const SCHEMA_TYPES = ["organization", "service", "faq", "article", "job_posting", "breadcrumb"] as const;
export type SchemaType = (typeof SCHEMA_TYPES)[number];

export type OrganizationData = {
  name?: string;
  alternateName?: string;
  logo?: string;
  email?: string;
  telephone?: string;
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
  sameAs?: string[];
};

export type JobPostingData = {
  /** YYYY-MM-DD. Google requires a posting date, so job data stays off until one is set. */
  datePosted?: string;
  validThrough?: string;
};

export type SchemaRow = { type: SchemaType; enabled: boolean; data: Record<string, unknown> };
export type SchemaSettings = Record<SchemaType, SchemaRow>;

export const SCHEMA_INFO: Record<SchemaType, { label: string; where: string; defaultEnabled: boolean }> = {
  organization: { label: "Organization", where: "Every page: company name, logo, address, phone and social profiles.", defaultEnabled: true },
  service: { label: "Service", where: "Each of the 9 service pages.", defaultEnabled: true },
  faq: { label: "FAQ", where: "Home and Contact pages, from their FAQ sections.", defaultEnabled: true },
  article: { label: "Article / Blog post", where: "Every blog post: headline, date, image and publisher.", defaultEnabled: true },
  job_posting: { label: "Job Posting", where: "Career page, one per open role. Needs a posting date before Google accepts it.", defaultEnabled: false },
  breadcrumb: { label: "Breadcrumb", where: "Service, blog and case study pages: the page's place in the site.", defaultEnabled: true },
};

export function defaultSchemaSettings(): SchemaSettings {
  return Object.fromEntries(
    SCHEMA_TYPES.map((type) => [type, { type, enabled: SCHEMA_INFO[type].defaultEnabled, data: {} }]),
  ) as SchemaSettings;
}

/** Built-in company details, used wherever the admin left a field empty. */
export const ORGANIZATION_DEFAULTS: Required<OrganizationData> = {
  name: "Alet India Softwares",
  alternateName: "ALET India",
  logo: pageUrl("/images/alet-india-logo.png"),
  email: company.email,
  telephone: company.phone,
  streetAddress: "326A, Phase 1, Mayur Vihar Phase I, Pocket 2",
  addressLocality: "New Delhi",
  addressRegion: "Delhi",
  postalCode: "110091",
  addressCountry: "IN",
  sameAs: [],
};

const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);

export function organizationSchema(data: OrganizationData = {}) {
  const pick = (key: Exclude<keyof OrganizationData, "sameAs">) => text(data[key]) ?? ORGANIZATION_DEFAULTS[key];
  const sameAs = (Array.isArray(data.sameAs) ? data.sameAs : []).map(text).filter((url): url is string => Boolean(url));
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: pick("name"),
    alternateName: pick("alternateName"),
    url: pageUrl("/"),
    logo: pick("logo"),
    foundingDate: String(company.established),
    email: pick("email"),
    telephone: pick("telephone"),
    address: {
      "@type": "PostalAddress",
      streetAddress: pick("streetAddress"),
      addressLocality: pick("addressLocality"),
      addressRegion: pick("addressRegion"),
      postalCode: pick("postalCode"),
      addressCountry: pick("addressCountry"),
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

type Opening = { id: string; title: string; type: string; location: string; summary: string; responsibilities?: string[]; skills?: string[] };

export function jobPostingSchema(job: Opening, data: JobPostingData, organizationName: string) {
  const description = [job.summary, ...(job.responsibilities ?? []), ...(job.skills ?? [])].map((line) => `<p>${line}</p>`).join("");
  return {
    "@type": "JobPosting",
    title: job.title,
    description,
    identifier: { "@type": "PropertyValue", name: organizationName, value: job.id },
    datePosted: data.datePosted,
    ...(text(data.validThrough) ? { validThrough: data.validThrough } : {}),
    employmentType: /part/i.test(job.type) ? "PART_TIME" : /intern/i.test(job.type) ? "INTERN" : "FULL_TIME",
    hiringOrganization: { "@id": ORGANIZATION_ID },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location, addressRegion: "Delhi", addressCountry: "IN" },
    },
    url: pageUrl(`/career#${job.id}`),
  };
}

export const isDate = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
