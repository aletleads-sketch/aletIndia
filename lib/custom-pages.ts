/**
 * Pages made in the admin (Pages → Add Page). A page is a row of public.site_pages with
 * page_type "Custom"; its blocks are rows of public.page_sections (content = { kind, fields }),
 * shown in sort_order and skipped when hidden. The website renders them in components/custom-page.tsx.
 */

export const CUSTOM_PAGE_TYPE = "Custom";

export type Picture = { src: string; alt: string };
export type Button = { label: string; href: string };

export type BlockFields = {
  hero: { eyebrow: string; title: string; accent: string; text: string; image: Picture; button: Button };
  text: { heading: string; paragraphs: string[] };
  image_text: { heading: string; paragraphs: string[]; image: Picture; imageSide: "left" | "right"; button: Button };
  cards: { heading: string; intro: string; items: { title: string; text: string }[] };
  cta: { heading: string; text: string; button: Button };
  contact: Record<string, never>;
};

export type BlockKind = keyof BlockFields;

export const BLOCKS: { kind: BlockKind; label: string; hint: string }[] = [
  { kind: "hero", label: "Hero Banner", hint: "Big title with a background picture, at the top of the page." },
  { kind: "text", label: "Text", hint: "A heading with paragraphs." },
  { kind: "image_text", label: "Picture and Text", hint: "A picture beside a heading, paragraphs and a button." },
  { kind: "cards", label: "Cards", hint: "A heading with a grid of small cards (title and text)." },
  { kind: "cta", label: "Call to Action", hint: "A coloured band with a heading and a button." },
  { kind: "contact", label: "Contact Form", hint: "The website's contact form, as on the other pages." },
];

export const blockLabel = (kind: string) => BLOCKS.find((block) => block.kind === kind)?.label ?? "Block";

/** What a new block starts with. */
export function blankBlock<K extends BlockKind>(kind: K, pageName = "New page"): BlockFields[K] {
  const blanks: BlockFields = {
    hero: {
      eyebrow: "ALET India",
      title: pageName,
      accent: "",
      text: "A short line about this page.",
      image: { src: "/images/pages/office.jpg", alt: "" },
      button: { label: "Talk to us", href: "/contact-us" },
    },
    text: { heading: "Heading", paragraphs: ["Write your text here."] },
    image_text: {
      heading: "Heading",
      paragraphs: ["Write your text here."],
      image: { src: "/images/pages/office.jpg", alt: "" },
      imageSide: "right",
      button: { label: "", href: "" },
    },
    cards: {
      heading: "Heading",
      intro: "",
      items: [
        { title: "First point", text: "A sentence or two." },
        { title: "Second point", text: "A sentence or two." },
        { title: "Third point", text: "A sentence or two." },
      ],
    },
    cta: { heading: "Ready to start your project?", text: "Tell us what you need and we will get back to you within a day.", button: { label: "Get a Free Consultation", href: "/contact-us" } },
    contact: {},
  };
  return blanks[kind];
}

/** Addresses the website already uses (folders in app/ and the legacy blog addresses are checked too). */
export const RESERVED_SLUGS = new Set([
  "about-us", "admin", "ai-data-solutions", "api", "blogs", "career", "case-studies", "contact-us", "cross-functional-application",
  "digital-marketing", "embeds", "game-development", "graphic-design", "home1", "home2", "home3", "mobile-app-development", "portfolio",
  "privacy-policy", "refund-policy", "salesforce-solutions", "services", "terms-conditions", "ux-ui-design", "web-application", "images",
]);

/** A page address the admin may use: lowercase words joined by dashes, not one the website already has. */
export const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const slugFrom = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
