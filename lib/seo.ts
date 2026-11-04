import { company } from "@/lib/content";

/**
 * The public address every page should be known by. Canonical links, the sitemap
 * and structured data all point here, even when the build is served from the dev
 * domain, so search engines treat the live site as the original.
 * Change NEXT_PUBLIC_SITE_URL when the site moves (e.g. to https://aletindia.com).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://aletindia.com/aletindia").replace(/\/+$/, "");

/** Dev and preview builds set NEXT_PUBLIC_NOINDEX=1 so they never compete with the live site. */
export const NOINDEX = process.env.NEXT_PUBLIC_NOINDEX === "1";

export function pageUrl(path: string) {
  const clean = `/${path}`.replace(/\/+/g, "/").replace(/\/$/, "");
  return `${SITE_URL}${clean}`;
}

/** Spread into a page's metadata: `alternates: canonical("/about-us")`. */
export function canonical(path: string) {
  return { canonical: pageUrl(path) };
}

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export function jsonLd(data: Record<string, unknown>) {
  // `<` is escaped so page text can never close the script tag (per the Next.js JSON-LD guide).
  return { __html: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c") };
}

export const organizationJsonLd = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "Alet India Softwares",
  alternateName: "ALET India",
  url: pageUrl("/"),
  logo: pageUrl("/images/alet-india-logo.png"),
  foundingDate: String(company.established),
  email: company.email,
  telephone: company.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: "326A, Phase 1, Mayur Vihar Phase I, Pocket 2",
    addressLocality: "New Delhi",
    addressRegion: "Delhi",
    postalCode: "110091",
    addressCountry: "IN",
  },
};

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: pageUrl(item.path),
    })),
  };
}
