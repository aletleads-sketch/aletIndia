/**
 * Website-content sections of the CMS, in sidebar order. `view` is the `data-view`
 * name `public/cms-admin.html` opens when embedded with `?embed=1&view=<view>`. Embedded, the
 * CMS hides its own content-type buttons, since this list replaces them.
 */
export const CMS_SECTIONS = [
  { slug: "projects", view: "projects", label: "Projects" },
  { slug: "services", view: "services", label: "Services" },
  { slug: "menus", view: "menus", label: "Menus & submenus" },
  { slug: "client-logos", view: "clients", label: "Client logos" },
  { slug: "industries", view: "industries", label: "Industries" },
  { slug: "testimonials", view: "testimonials", label: "Testimonials" },
  { slug: "homepage-sections", view: "sections", label: "Homepage sections" },
  { slug: "blogs", view: "blogs", label: "Blogs" },
  { slug: "faqs", view: "faqs", label: "FAQs" },
] as const;

export type CmsSection = (typeof CMS_SECTIONS)[number];

export function getCmsSection(slug: string) {
  return CMS_SECTIONS.find((section) => section.slug === slug);
}
