export type CmsMenuItem = {
  id: string;
  label: string;
  href: string | null;
  parent_id: string | null;
  sort_order: number;
  visible: boolean;
};

export type CmsProject = {
  id: string;
  name: string;
  slug: string;
  project_type: "mobile" | "web" | "game";
  industry: string | null;
  summary: string;
  platforms: string[];
  cover_image_url: string | null;
  service_slugs: string[];
  featured: boolean;
  sort_order: number;
};

export type CmsService = {
  id: string;
  group_name: string;
  name: string;
  slug: string;
  summary: string | null;
  hero_image_url: string | null;
  sort_order: number;
};

export type CmsBlog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: unknown;
  category: string | null;
  cover_image_url: string | null;
  published_at: string | null;
};

export type CmsFaq = {
  id: string;
  question: string;
  answer: string;
  topic: string | null;
  sort_order: number;
};

export type CmsClientLogo = {
  id: string;
  client_name: string;
  logo_url: string;
  website_url: string | null;
  sort_order: number;
};

export type CmsIndustry = {
  id: string;
  name: string;
  image_url: string | null;
  sort_order: number;
};

export type CmsTestimonial = {
  id: string;
  quote: string;
  client_name: string;
  client_role: string | null;
  company: string | null;
  image_url: string | null;
  sort_order: number;
};

export type CmsSiteSection = {
  id: string;
  section_key: string;
  eyebrow: string | null;
  heading: string | null;
  accent_text: string | null;
  intro: string | null;
  body: string | null;
};

const SUPABASE_URL = "https://seegtwkfeolpjlgjlbyd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_AB_9PH5k_kHBDsXIr2IhAA_6VznqX81";

async function publicSelect<T>(table: string, params: URLSearchParams): Promise<T[]> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  if (!response.ok) throw new Error(`CMS request failed (${response.status})`);
  return response.json() as Promise<T[]>;
}

export function getPublishedMenu() {
  return publicSelect<CmsMenuItem>(
    "menu_items",
    new URLSearchParams({ select: "id,label,href,parent_id,sort_order,visible", visible: "eq.true", order: "sort_order.asc" }),
  );
}

export function getPublishedProjects() {
  return publicSelect<CmsProject>(
    "projects",
    new URLSearchParams({
      select: "id,name,slug,project_type,industry,summary,platforms,cover_image_url,service_slugs,featured,sort_order",
      status: "eq.published",
      order: "featured.desc,sort_order.asc,created_at.desc",
    }),
  );
}

export function getPublishedServices() {
  return publicSelect<CmsService>(
    "services",
    new URLSearchParams({
      select: "id,group_name,name,slug,summary,hero_image_url,sort_order",
      status: "eq.published",
      order: "sort_order.asc,name.asc",
    }),
  );
}

export function getPublishedBlogs() {
  return publicSelect<CmsBlog>(
    "blogs",
    new URLSearchParams({
      select: "id,title,slug,excerpt,content,category,cover_image_url,published_at",
      status: "eq.published",
      order: "published_at.desc,created_at.desc",
    }),
  );
}

export function getPublishedFaqs() {
  return publicSelect<CmsFaq>(
    "faqs",
    new URLSearchParams({
      select: "id,question,answer,topic,sort_order",
      status: "eq.published",
      order: "sort_order.asc,created_at.desc",
    }),
  );
}

export function getPublishedClientLogos() {
  return publicSelect<CmsClientLogo>(
    "client_logos",
    new URLSearchParams({
      select: "id,client_name,logo_url,website_url,sort_order",
      status: "eq.published",
      order: "sort_order.asc,created_at.asc",
    }),
  );
}

export function getPublishedIndustries() {
  return publicSelect<CmsIndustry>(
    "industries",
    new URLSearchParams({
      select: "id,name,image_url,sort_order",
      status: "eq.published",
      order: "sort_order.asc,created_at.asc",
    }),
  );
}

export function getPublishedTestimonials() {
  return publicSelect<CmsTestimonial>(
    "testimonials",
    new URLSearchParams({
      select: "id,quote,client_name,client_role,company,image_url,sort_order",
      status: "eq.published",
      order: "sort_order.asc,created_at.asc",
    }),
  );
}

export async function getPublishedSection(sectionKey: string) {
  const rows = await publicSelect<CmsSiteSection>(
    "site_sections",
    new URLSearchParams({
      select: "id,section_key,eyebrow,heading,accent_text,intro,body",
      section_key: `eq.${sectionKey}`,
      status: "eq.published",
      limit: "1",
    }),
  );
  return rows[0] ?? null;
}

export function typeLabel(type: CmsProject["project_type"]) {
  return type === "mobile" ? "Mobile Apps" : type === "web" ? "Web" : "Games";
}
