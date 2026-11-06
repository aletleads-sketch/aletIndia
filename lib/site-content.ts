import { cache } from "react";
import * as code from "@/lib/content";
import { careers as codeCareers, serviceDetails as codeServiceDetails, serviceVisuals as codeServiceVisuals } from "@/lib/pages";
import type { ServiceDetail, ServiceVisual } from "@/lib/pages";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/cms-client";
import { caseStudyIndexEntries, demoCaseStudiesResolved, indexFrom, type CaseStudyIndexEntry, type CaseStudyIndexItem, type DemoCaseStudy } from "@/lib/case-study-data";
import { blogPosts as codeBlogPosts, type BlogPost } from "@/lib/blogs";
import { mergeFields, type SectionId, type SectionValues } from "@/lib/section-fields";
import { CUSTOM_PAGE_TYPE } from "@/lib/custom-pages";
import { DEFAULT_BRAND, SITE_CONTENT_TAG } from "@/lib/site-content-shared";
import type { MenuLink, PageSection, SiteContent } from "@/lib/site-content-shared";

export { SITE_CONTENT_TAG };

/**
 * Website content from Supabase (tables filled from the code by scripts/content-export).
 * Every read is cached for an hour and shared by all pages; an admin save clears the cache.
 * If Supabase cannot be reached, or a table is empty, the code's own content is used,
 * so the website never shows a blank section.
 */
async function read<T>(table: string, query: string): Promise<T[] | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` },
      next: { revalidate: 3600, tags: [SITE_CONTENT_TAG] },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as T[];
    return Array.isArray(rows) && rows.length ? rows : null;
  } catch {
    return null;
  }
}

const published = "status=eq.published&order=sort_order.asc";

type ServiceRow = {
  service_key: string | null;
  slug: string;
  name: string;
  nav_label: string | null;
  group_name: string;
  summary: string | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  channels: string[] | null;
  body: ServiceDetail | null;
  visual: ServiceVisual | null;
};
type ProjectRow = {
  name: string;
  industry: string | null;
  summary: string | null;
  platforms: string[] | null;
  theme: string | null;
  logo_url: string | null;
  gallery: { src: string; alt: string }[] | null;
  display: { landscape?: boolean; mockup?: boolean } | null;
};
type FaqRow = { question: string; answer: string; topic: string | null };
type TestimonialRow = { quote: string; client_name: string; client_role: string | null; image_url: string | null; image_fit: string | null };
type LogoRow = { client_name: string; logo_url: string };
type IndustryRow = { name: string; image_url: string | null };
type CareerRow = {
  slug: string;
  title: string;
  department: string | null;
  employment_type: string | null;
  location: string | null;
  experience: string | null;
  image_url: string | null;
  summary: string | null;
  description: Record<string, unknown> | null;
};
type MenuRow = { id: string; menu: string; label: string; href: string | null; parent_id: string | null; sort_order: number; visible: boolean };
type SectionRow = PageSection & { page_path: string };

type CompanyData = typeof code.company & {
  careers_email?: string;
  logo?: string;
  logo_light?: string;
  favicon?: string;
  stats?: typeof code.stats;
  badges?: typeof code.achievements;
};

const menuLinks = (rows: MenuRow[] | null, menu: string, fallback: MenuLink[]): MenuLink[] => {
  const links = (rows ?? []).filter((row) => row.menu === menu && !row.parent_id && row.visible);
  return links.length ? links.map((row) => ({ label: row.label, href: row.href ?? "/" })) : fallback;
};

async function loadAll(): Promise<SiteContent> {
  const [serviceRows, projectRows, faqRows, testimonialRows, logoRows, industryRows, careerRows, menuRows, sectionRows] = await Promise.all([
    read<ServiceRow>("services", `select=service_key,slug,name,nav_label,group_name,summary,hero_image_url,hero_image_alt,channels,body,visual&${published}`),
    read<ProjectRow>("projects", `select=name,industry,summary,platforms,theme,logo_url,gallery,display&${published}`),
    read<FaqRow>("faqs", `select=question,answer,topic&${published}`),
    read<TestimonialRow>("testimonials", `select=quote,client_name,client_role,image_url,image_fit&${published}`),
    read<LogoRow>("client_logos", `select=client_name,logo_url&${published}`),
    read<IndustryRow>("industries", `select=name,image_url&${published}`),
    read<CareerRow>("careers", `select=slug,title,department,employment_type,location,experience,image_url,summary,description&${published}`),
    read<MenuRow>("menu_items", "select=id,menu,label,href,parent_id,sort_order,visible&order=sort_order.asc"),
    read<SectionRow>("page_sections", `select=page_path,section_key,label,shared_key,collections,hidden,sort_order,content&${published}`),
  ]);

  const sections = new Map<string, PageSection>();
  for (const row of sectionRows ?? []) sections.set(`${row.page_path}#${row.section_key}`, row);
  const data = (pagePath: string, key: string) => sections.get(`${pagePath}#${key}`)?.content?.data as Record<string, unknown> | undefined;

  const companyData = (data("_shared", "company") ?? {}) as Partial<CompanyData>;
  const { careers_email, stats, badges, logo, logo_light, favicon, ...companyFields } = companyData;
  const company = { ...code.company, ...companyFields };

  const services = serviceRows
    ? serviceRows.map((row) => ({
        id: row.service_key ?? row.slug,
        slug: row.slug,
        title: row.name,
        nav: row.nav_label ?? row.name,
        group: row.group_name,
        description: row.summary ?? "",
        image: row.hero_image_url ?? "",
        imageAlt: row.hero_image_alt ?? "",
        ...(row.channels?.length ? { channels: row.channels } : {}),
      }))
    : code.services;
  const serviceDetails: Record<string, ServiceDetail> = { ...codeServiceDetails };
  const serviceVisuals: Record<string, ServiceVisual> = { ...codeServiceVisuals };
  for (const row of serviceRows ?? []) {
    const id = row.service_key ?? row.slug;
    if (row.body) serviceDetails[id] = row.body;
    if (row.visual) serviceVisuals[id] = row.visual;
  }

  const caseStudies = projectRows
    ? projectRows.map((row) => ({
        name: row.name,
        category: row.industry ?? "",
        summary: row.summary ?? "",
        tags: row.platforms ?? [],
        color: row.theme ?? "",
        logo: row.logo_url ?? "",
        screens: (row.gallery ?? []).map((image) => image.src),
        ...(row.display?.landscape ? { landscape: true } : {}),
        ...(row.display?.mockup ? { mockup: true } : {}),
      }))
    : code.caseStudies;

  const faqsFor = (topic: string) => (faqRows ?? []).filter((row) => row.topic === topic).map(({ question, answer }) => ({ question, answer }));
  const homeFaqs = faqsFor("home");
  const contactFaqs = faqsFor("contact");

  const careerOpenings = careerRows
    ? careerRows.map((row) => ({
        ...(row.description ?? {}),
        id: row.slug,
        title: row.title,
        department: row.department ?? "",
        type: row.employment_type ?? "",
        location: row.location ?? "",
        experience: row.experience ?? "",
        image: row.image_url ?? "",
        summary: row.summary ?? "",
      }))
    : codeCareers.openings;

  const header = (menuRows ?? []).filter((row) => row.menu === "header" && row.visible);
  const navigation = header.length
    ? header
        .filter((row) => !row.parent_id)
        .map((row) => ({
          id: row.id,
          label: row.label,
          href: row.href,
          parent_id: null,
          sort_order: row.sort_order,
          visible: true,
          children: header.filter((child) => child.parent_id === row.id).map((child) => ({ id: child.id, label: child.label, href: child.href, parent_id: child.parent_id, sort_order: child.sort_order, visible: child.visible })),
        }))
    : null;  const homeData = (key: string) => data("/", key) ?? {};
  const inquireRow = sections.get("_shared#inquire_form");
  return {
    company,
    careersEmail: careers_email ?? codeCareers.email,
    stats: stats ?? code.stats,
    achievements: badges ?? code.achievements,
    hero: (homeData("hero").hero as typeof code.hero) ?? code.hero,
    about: (homeData("about").about as typeof code.about) ?? code.about,
    showcase: (homeData("work").showcase as typeof code.showcase) ?? code.showcase,
    ideology: (homeData("process").ideology as typeof code.ideology) ?? code.ideology,
    process: (homeData("process").process as typeof code.process) ?? code.process,
    services,
    serviceDetails,
    serviceVisuals,
    caseStudies,
    clients: logoRows ? logoRows.map((row) => ({ name: row.client_name, logo: row.logo_url })) : code.clients,
    industries: industryRows ? industryRows.map((row) => ({ name: row.name, image: row.image_url ?? "" })) : code.industries,
    faqs: homeFaqs.length ? homeFaqs : code.faqs,
    contactFaqs,
    testimonials: testimonialRows
      ? testimonialRows.map((row) => ({
          quote: row.quote,
          name: row.client_name,
          role: row.client_role ?? "",
          image: row.image_url ?? "",
          fit: row.image_fit === "contain" ? ("contain" as const) : ("cover" as const),
        }))
      : code.testimonials,
    careers: { email: careers_email ?? codeCareers.email, openings: careerOpenings as typeof codeCareers.openings },
    navigation,
    socialLinks: menuLinks(menuRows, "footer_social", []),
    footerDevelopment: menuLinks(menuRows, "footer_development", []),
    footerDesigning: menuLinks(menuRows, "footer_designing", []),
    footerMarketing: menuLinks(menuRows, "footer_marketing", []),
    companyLinks: menuLinks(menuRows, "footer_company", code.companyLinks),
    legalLinks: menuLinks(menuRows, "footer_legal", code.legalLinks),
    portals: menuLinks(menuRows, "portals", code.portals),    inquireForm: mergeFields("_shared#inquire_form", inquireRow?.content.fields),
    sections: Object.fromEntries(sections),
    brand: { logo: logo || DEFAULT_BRAND.logo, logoLight: logo_light || DEFAULT_BRAND.logoLight, favicon: favicon || DEFAULT_BRAND.favicon },
  };
}

/** All website content. One load per request, shared by every component that asks. */
export const loadSiteContent = cache(loadAll);

/** One section of one page (or of '_shared'), following a shared block when the row points at one. */
export async function loadSection(pagePath: string, key: string): Promise<PageSection | null> {
  const { sections } = await loadSiteContent();
  const row = sections[`${pagePath}#${key}`];
  if (!row) return null;
  return row.shared_key ? (sections[`_shared#${row.shared_key}`] ?? row) : row;
}

/**
 * The order and visibility of a page's sections as set in the admin: the keys to show, in order.
 * Keys the database does not know keep the code's order, after the known ones.
 */
export async function loadSectionLayout(pagePath: string, codeOrder: string[]): Promise<string[]> {
  const { sections } = await loadSiteContent();
  const prefix = `${pagePath}#`;
  const rows = Object.entries(sections)
    .filter(([id]) => id.startsWith(prefix))
    .map(([, row]) => row)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  if (!rows.length) return codeOrder;
  const known = new Set(rows.map((row) => row.section_key));
  return [...rows.filter((row) => !row.hidden && codeOrder.includes(row.section_key)).map((row) => row.section_key), ...codeOrder.filter((key) => !known.has(key))];
}

/** The editable fields of one wired section: stored values over the website's own copy. */
export async function loadFields<Id extends SectionId>(id: Id): Promise<SectionValues<Id>> {
  const [pagePath, key] = id.split("#");
  const section = await loadSection(pagePath, key);
  return mergeFields(id, section?.content.fields);
}

type BlogRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: { sections?: BlogPost["sections"] } | null;
  category: string | null;
  categories: string[] | null;
  author_name: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  published_at: string | null;
};

/** India date (YYYY-MM-DD) of a stored timestamp, as the blog pages show it. */
const indiaDate = (value: string | null) =>
  value ? new Date(new Date(value).getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10) : "";

/** Published blog articles, newest first (the code's articles if the database has none). */
export const loadBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const rows = await read<BlogRow>(
    "blogs",
    "select=slug,title,excerpt,content,category,categories,author_name,cover_image_url,cover_image_alt,published_at&status=eq.published&order=published_at.desc",
  );
  if (!rows) return codeBlogPosts;
  return rows
    .map((row) => ({
      slug: row.slug,
      date: indiaDate(row.published_at),
      title: row.title,
      excerpt: row.excerpt ?? "",
      image: row.cover_image_url ?? "",
      imageAlt: row.cover_image_alt ?? undefined,
      tag: row.category ?? "",
      categories: row.categories ?? [],
      author: row.author_name ?? "Alet India Softwares",
      sections: row.content?.sections ?? [],
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
});

type CaseStudyRow = {
  slug: string;
  client: string;
  industry: string | null;
  title: string;
  summary: string | null;
  data: Omit<DemoCaseStudy, "slug" | "client" | "industry" | "title" | "summary"> | null;
  preview: CaseStudyIndexEntry | null;
};

/** Case study pages, and the cards on the Case Studies index (the code's if the database has none). */
export const loadCaseStudies = cache(async (): Promise<{ studies: DemoCaseStudy[]; index: CaseStudyIndexItem[] }> => {
  const [rows, { caseStudies: projects }] = await Promise.all([
    read<CaseStudyRow>("case_studies", `select=slug,client,industry,title,summary,data,preview&${published}`),
    loadSiteContent(),
  ]);
  if (!rows) return { studies: demoCaseStudiesResolved, index: caseStudyIndexEntries };
  const studies: DemoCaseStudy[] = rows.map((row) => ({
    facts: [],
    screens: [],
    challenge: [],
    approach: [],
    built: [],
    outcome: "",
    ...(row.data ?? {}),
    slug: row.slug,
    client: row.client,
    industry: row.industry ?? "",
    title: row.title,
    summary: row.summary ?? "",
  }));
  // A study is on the index only when its card has a title (the admin clears it to hide one).
  const previews = new Map(rows.filter((row) => row.preview?.previewTitle).map((row) => [row.slug, { ...row.preview!, slug: row.slug }]));
  return { studies, index: indexFrom(studies, previews, projects) };
});

type CustomPageRow = { path: string; name: string };
type CustomBlockRow = { section_key: string; hidden: boolean; content: { kind?: string; fields?: Record<string, unknown> } };

/** A page made in the admin (Pages → Add Page), with its visible blocks in order; null when there is none. */
export const loadCustomPage = cache(async (path: string) => {
  const address = encodeURIComponent(path);
  const [pages, blocks] = await Promise.all([
    read<CustomPageRow>("site_pages", `select=path,name&path=eq.${address}&page_type=eq.${CUSTOM_PAGE_TYPE}&status=eq.published`),
    read<CustomBlockRow>("page_sections", `select=section_key,hidden,content&page_path=eq.${address}&${published}`),
  ]);
  const page = pages?.[0];
  if (!page) return null;
  return {
    name: page.name,
    blocks: (blocks ?? []).filter((block) => !block.hidden && block.content?.kind).map((block) => ({ key: block.section_key, kind: block.content.kind as string, fields: block.content.fields ?? {} })),
  };
});

/** Addresses of the published pages made in the admin (for the sitemap). */
export const loadCustomPagePaths = cache(async () => {
  const rows = await read<{ path: string; updated_at: string }>("site_pages", `select=path,updated_at&page_type=eq.${CUSTOM_PAGE_TYPE}&status=eq.published`);
  return rows ?? [];
});
