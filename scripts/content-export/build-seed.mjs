// Builds the database rows for the whole website from the code (lib/*) and the
// page sections read by extract-pages.mjs. Writes out/rows.json and out/seed-*.sql.
// Usage: node scripts/content-export/build-seed.mjs
import { createJiti } from "jiti";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const out = path.join(import.meta.dirname, "out");
const jiti = createJiti(import.meta.url, { alias: { "@": root } });
const load = (file) => jiti.import(path.join(root, file));

const content = await load("lib/content.ts");
const pages = await load("lib/pages.ts");
const { blogPosts } = await load("lib/blogs.ts");
const { blogImages } = await load("lib/blog-images.ts");
const caseData = await load("lib/case-study-data.ts");
const { sitePages } = await load("lib/site-pages.ts");
const extracted = JSON.parse(fs.readFileSync(path.join(out, "pages.json"), "utf8"));

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const published = "published";

// ---------------------------------------------------------------- collections

const services = content.services.map((service, index) => ({
  service_key: service.id,
  slug: service.slug,
  name: service.title,
  nav_label: service.nav,
  group_name: service.group,
  summary: service.description,
  hero_image_url: service.image,
  hero_image_alt: service.imageAlt,
  channels: service.channels ?? [],
  body: pages.serviceDetails[service.id] ?? null,
  visual: pages.serviceVisuals[service.id] ?? null,
  status: published,
  sort_order: (index + 1) * 10,
}));

const showcaseAlt = new Map(content.showcase.map((item) => [item.src, item.alt]));
const slugify = (value) => clean(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const projectSlugs = new Map();
const projects = content.caseStudies.map((study, index) => {
  let slug = slugify(study.name);
  const twins = content.caseStudies.filter((item) => item.name === study.name).length > 1;
  if (twins) slug = `${slug}-${study.landscape ? "website" : "app"}`;
  projectSlugs.set(slug, true);
  return {
    name: study.name,
    slug,
    // Same rule as the Portfolio filter (components/portfolio-grid.tsx).
    project_type: study.category.includes("Gam") ? "game" : study.landscape ? "web" : "mobile",
    industry: study.category,
    summary: study.summary,
    platforms: study.tags,
    logo_url: study.logo,
    theme: study.color,
    cover_image_url: study.screens[0],
    gallery: study.screens.map((src) => ({ src, alt: showcaseAlt.get(src) ?? `${study.name} screen` })),
    display: { landscape: Boolean(study.landscape), mockup: Boolean(study.mockup) },
    featured: true,
    status: published,
    sort_order: (index + 1) * 10,
  };
});

const indexEntries = new Map(caseData.caseStudyIndexEntries.map(({ detail, ...entry }) => [entry.slug, entry]));
const caseStudies = caseData.demoCaseStudiesResolved.map((study, index) => ({
  slug: study.slug,
  client: study.client,
  industry: study.industry,
  title: study.title,
  summary: study.summary,
  cover_image_url: study.screens[0]?.src ?? null,
  data: {
    facts: study.facts,
    snapshot: study.snapshot ?? [],
    screens: study.screens,
    sections: study.sections ?? [],
    challenge: study.challenge,
    approach: study.approach,
    built: study.built,
    outcome: study.outcome,
  },
  preview: indexEntries.get(study.slug) ?? null,
  status: published,
  sort_order: (index + 1) * 10,
}));

const blogs = blogPosts.map((post) => ({
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  content: { sections: post.sections },
  category: post.tag,
  categories: post.categories,
  author_name: post.author,
  cover_image_url: post.image,
  cover_image_alt: post.imageAlt ?? post.title,
  images: blogImages[post.slug] ?? null,
  status: published,
  published_at: new Date(`${post.date}T00:00:00+05:30`).toISOString(),
}));

const contactPage = extracted.pages.find((page) => page.path === "/contact-us");
const contactFaqSection = contactPage.sections.find((section) => section.key === "faq");
const contactFaqs = [];
contactFaqSection.blocks.forEach((block, index) => {
  if (block.type !== "summary") return;
  const answer = contactFaqSection.blocks.slice(index + 1).find((next) => next.type === "p");
  contactFaqs.push({ question: block.text.replace(/\s*\+$/, ""), answer: answer?.text ?? "" });
});
if (contactFaqs.length !== 4) throw new Error(`Expected 4 contact FAQs, found ${contactFaqs.length}`);
const faqs = [
  ...content.faqs.map((faq, index) => ({ question: faq.question, answer: faq.answer, topic: "home", status: published, sort_order: (index + 1) * 10 })),
  ...contactFaqs.map((faq, index) => ({ ...faq, topic: "contact", status: published, sort_order: (index + 1) * 10 })),
];

const testimonials = content.testimonials.map((item, index) => ({
  quote: item.quote,
  client_name: item.name,
  client_role: item.role,
  company: null,
  image_url: item.image,
  image_fit: item.fit,
  status: published,
  sort_order: (index + 1) * 10,
}));

const clientLogos = content.clients.map((client, index) => ({
  client_name: client.name,
  logo_url: client.logo,
  logo_alt: client.name,
  status: published,
  sort_order: (index + 1) * 10,
}));

const industries = content.industries.map((industry, index) => ({
  name: industry.name,
  image_url: industry.image,
  image_alt: "",
  status: published,
  sort_order: (index + 1) * 10,
}));

const careers = pages.careers.openings.map((job, index) => {
  const { id, title, department, type, location, experience, image, summary, ...rest } = job;
  return {
    slug: id,
    title,
    department,
    employment_type: type,
    location,
    experience,
    image_url: image,
    summary,
    description: rest,
    application_url: `mailto:${pages.careers.email}`,
    status: published,
    published_at: new Date().toISOString(),
    sort_order: (index + 1) * 10,
  };
});

// Menus: header from components/header.tsx, footer columns from the same data the footer uses.
const headerSource = fs.readFileSync(path.join(root, "components/header.tsx"), "utf8");
const navBlock = headerSource.slice(headerSource.indexOf("const navigation"), headerSource.indexOf("function groupServiceLinks"));
const menuItems = [];
for (const match of navBlock.matchAll(/\{ id: "([^"]+)", label: "([^"]+)", href: "([^"]+)", parent_id: (null|"[^"]+"), sort_order: (\d+)/g)) {
  menuItems.push({ key: match[1], menu: "header", label: match[2], href: match[3], parent: match[4] === "null" ? null : match[4].replaceAll('"', ""), sort_order: Number(match[5]), visible: true });
}
if (menuItems.length !== 17) throw new Error(`Expected 17 header links, found ${menuItems.length}`);
const footerSource = fs.readFileSync(path.join(root, "components/footer.tsx"), "utf8");
const socials = [...footerSource.matchAll(/label: "([^"]+)",\s*href: "([^"]+)"/g)].map((match) => ({ label: match[1], href: match[2] }));
socials.forEach((link, index) => menuItems.push({ menu: "footer_social", label: link.label, href: link.href, parent: null, sort_order: (index + 1) * 10, visible: true }));
// Footer labels as components/footer.tsx shows them.
content.services.filter((service) => service.group === "Development").forEach((service, index) =>
  menuItems.push({ menu: "footer_development", label: service.nav, href: `/${service.slug}`, parent: null, sort_order: (index + 1) * 10, visible: true }));
content.services.filter((service) => service.group === "Designing").forEach((service, index) =>
  menuItems.push({ menu: "footer_designing", label: service.nav === "UX/UI Designing" ? "UX/UI Design" : "Graphic Design", href: `/${service.slug}`, parent: null, sort_order: (index + 1) * 10, visible: true }));
(content.services.find((service) => service.id === "digital-marketing").channels ?? []).forEach((channel, index) =>
  menuItems.push({ menu: "footer_marketing", label: channel, href: "/digital-marketing", parent: null, sort_order: (index + 1) * 10, visible: true }));
content.companyLinks.forEach((link, index) => menuItems.push({ menu: "footer_company", label: link.label, href: link.href, parent: null, sort_order: (index + 1) * 10, visible: true }));
content.legalLinks.forEach((link, index) => menuItems.push({ menu: "footer_legal", label: link.label, href: link.href, parent: null, sort_order: (index + 1) * 10, visible: true }));
content.portals.forEach((link, index) => menuItems.push({ menu: "portals", label: link.label, href: link.href, parent: null, sort_order: (index + 1) * 10, visible: true }));

// ---------------------------------------------------------------- page sections

// Text and images that live in a collection table are left out of a section's blocks,
// and the section lists that collection instead, so each thing is stored once.
const owned = new Map();
// Page text loses the spaces between <strong> and the next word; compare without spaces.
const squash = (value) => clean(value).replace(/\s+/g, "").toLowerCase();
const noExt = (value) => value.replace(/\.(png|jpe?g|webp|gif|svg)$/i, "");
const own = (collection, value) => {
  const text = clean(value);
  if (!text) return;
  if (!owned.has(text)) owned.set(text, collection);
  const squashed = squash(text);
  if (!owned.has(squashed)) owned.set(squashed, collection);
  // Images can exist as .png and .jpg side by side; match them by name.
  if (text.startsWith("/images/") && !owned.has(noExt(text))) owned.set(noExt(text), collection);
};
const ownDeep = (collection, value) => {
  if (typeof value === "string") own(collection, value);
  else if (Array.isArray(value)) value.forEach((item) => ownDeep(collection, item));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => ownDeep(collection, item));
};
const stripHtml = (value) => clean(String(value).replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " "));
services.forEach((service) => ownDeep("services", [service.name, service.nav_label, service.summary, service.channels, service.body, service.hero_image_url, service.visual]));
projects.forEach((project) => ownDeep("projects", [project.name, project.project_type, project.summary, project.platforms, project.logo_url, project.gallery]));
content.showcase.forEach((item) => ownDeep("projects", [item.src, item.alt]));
caseStudies.forEach((study) => ownDeep("case_studies", [study.client, study.industry, study.title, study.summary, study.data, study.preview]));
blogs.forEach((blog) => {
  ownDeep("blogs", [blog.title, blog.excerpt, blog.category, blog.categories, blog.author_name, blog.cover_image_url, blog.images]);
  for (const section of blog.content.sections) {
    own("blogs", section.heading);
    for (const block of section.blocks) {
      if (block.html) own("blogs", stripHtml(block.html));
      if (block.text) own("blogs", block.text);
      if (block.items) block.items.forEach((item) => own("blogs", stripHtml(item)));
      if (block.src) own("blogs", block.src);
    }
  }
});
faqs.forEach((faq) => ownDeep("faqs", [faq.question, faq.answer]));
testimonials.forEach((item) => ownDeep("testimonials", [item.quote, item.client_name, item.client_role, item.image_url]));
clientLogos.forEach((item) => ownDeep("client_logos", [item.client_name, item.logo_url]));
industries.forEach((item) => ownDeep("industries", [item.name, item.image_url]));
careers.forEach((job) => ownDeep("careers", [job.title, job.department, job.employment_type, job.location, job.experience, job.image_url, job.summary, job.description]));

const blockText = (block) => clean(block.type === "img" ? block.src : block.text);
function splitBlocks(blocks) {
  const firstHeading = blocks.find((block) => /^h[1-6]$/.test(block.type));
  const ownerOf = (block) => {
    const text = blockText(block);
    return (
      owned.get(text) ??
      (block.type === "summary" ? owned.get(text.replace(/\s*\+$/, "")) : undefined) ??
      (block.type === "img" ? owned.get(noExt(text)) : owned.get(squash(text)))
    );
  };
  // Pass 1: which lists does this section show? Only text decides that.
  const used = new Set();
  for (const block of blocks) {
    if (block.type === "img" || block.type === "embed") continue;
    const collection = ownerOf(block);
    if (collection && block !== firstHeading && block.role !== "eyebrow") used.add(collection);
  }
  // Pass 2: leave out what those lists already hold. Other images stay with the section.
  const kept = [];
  for (const block of blocks) {
    if (block.type === "embed" && block.blocks) {
      const inner = splitBlocks(block.blocks);
      inner.collections.forEach((name) => used.add(name));
      kept.push({ ...block, blocks: inner.blocks });
      continue;
    }
    const collection = ownerOf(block);
    const listed = collection && used.has(collection);
    if (listed && block !== firstHeading && block.role !== "eyebrow") continue;
    kept.push(block);
  }
  return { blocks: kept, collections: [...used] };
}

function summarize(blocks, allBlocks = blocks) {
  const eyebrow = blocks.find((block) => block.role === "eyebrow")?.text ?? null;
  const headingBlock = blocks.find((block) => /^h[1-3]$/.test(block.type));
  const headingIndex = headingBlock ? blocks.indexOf(headingBlock) : -1;
  const intro = headingIndex >= 0 ? blocks.slice(headingIndex + 1).find((block) => block.type === "p")?.text ?? null : null;
  const images = [];
  const collect = (list) => list.forEach((block) => {
    if (block.type === "img" && block.src) images.push({ src: block.src, alt: block.alt ?? "" });
    if (block.blocks) collect(block.blocks);
  });
  collect(allBlocks);
  return { eyebrow, heading: headingBlock?.text ?? null, accent: headingBlock?.accent ?? null, intro, images };
}

// Readable keys and names for sections the extractor could only name from ids.
const RENAME = {
  section: ["stats_bar", "Stats bar"],
  ajr_title: ["journey_timeline", "Our journey (2017 to today)"],
  alc_heading: ["solution_lifecycle", "Alet India solution cycle"],
  viewport: ["our_difference", "Our difference"],
  alet_india_story: ["story_journey", "Our story and growth journey"],
  words_of_appreciation_from_our_clients: ["testimonials", "Testimonials"],
  our_innovative_ideology: ["process", "Our innovative ideology"],
  contact: ["contact_form", "Contact us form"],
  driving_technology_for_our_clients: ["client_logos", "Client logos"],
  trusted_by_growing_businesses: ["client_logos", "Trusted by growing businesses"],
  building_digital_possibilities_since_201: ["intro", "Building digital possibilities since 2017"],
};

const TEMPLATE = (pagePath) =>
  pagePath.startsWith("/blogs/") ? "/blogs/[slug]" : pagePath.startsWith("/case-studies/") ? "/case-studies/[slug]" : null;

const shared = new Map(); // fingerprint -> shared section
const sitePageRows = [{ path: "_shared", name: "Shared blocks (header, footer, used on many pages)", page_type: "Shared", sort_order: 0 }];
const sectionRows = [];

// Count how often each section appears across pages, so repeated blocks are stored once.
const fingerprint = (blocks) => JSON.stringify(blocks);
const seen = new Map();
for (const page of extracted.pages) {
  if (TEMPLATE(page.path)) continue;
  for (const section of page.sections) {
    const key = fingerprint(section.blocks);
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
}

const builtTemplates = new Set();
let pageOrder = 0;
const pageName = (page) => page.path === "/" ? "Home" : page.title.replace(/\s+[—|-]\s+Alet India.*$/i, "").trim() || page.path;
for (const page of extracted.pages) {
  const template = TEMPLATE(page.path);
  if (template && builtTemplates.has(template)) continue;
  const pagePath = template ?? page.path;
  if (template) builtTemplates.add(template);
  pageOrder += 10;
  sitePageRows.push({
    path: pagePath,
    name: template ? (template.startsWith("/blogs") ? "Blog article (template for every blog)" : "Case study (template for every case study)") : pageName(page),
    page_type: template ? "Template" : page.kind,
    sort_order: pageOrder,
  });
  const usedKeys = new Map();
  page.sections.forEach((section, index) => {
    let [key, label] = RENAME[section.key] ?? [section.key, section.label];
    if (section.key === "section" && page.kind === "Service") [key, label] = ["highlights", "Highlights"];
    if (section.key === "section" && template === "/case-studies/[slug]") [key, label] = ["next_case_study", "Next case study link"];
    if (index === 0 && section.key !== "section") [key, label] = ["hero", `Hero: ${section.label.slice(0, 60)}`];
    const count = (usedKeys.get(key) ?? 0) + 1;
    usedKeys.set(key, count);
    if (count > 1) key = `${key}_${count}`;
    const { blocks, collections } = splitBlocks(section.blocks);
    const sort_order = (index + 1) * 10;
    const print = fingerprint(section.blocks);
    if (!template && (seen.get(print) ?? 0) > 1) {
      if (!shared.has(print)) {
        let sharedKey = key;
        let n = 2;
        while ([...shared.values()].some((row) => row.section_key === sharedKey)) sharedKey = `${key}_${n++}`;
        shared.set(print, {
          page_path: "_shared",
          section_key: sharedKey,
          label,
          sort_order: (shared.size + 3) * 10,
          shared_key: null,
          collections,
          content: { ...summarize(blocks, section.blocks), blocks, used_on: [] },
        });
      }
      const sharedRow = shared.get(print);
      sharedRow.content.used_on.push(pagePath);
      sectionRows.push({ page_path: pagePath, section_key: key, label, sort_order, shared_key: sharedRow.section_key, collections: [], content: {} });
      return;
    }
    sectionRows.push({ page_path: pagePath, section_key: key, label, sort_order, shared_key: null, collections, content: { ...summarize(blocks, section.blocks), blocks } });
  });
}

// Header and footer are shared on every page.
const headerSplit = { blocks: extracted.header, collections: [] };
const footerSplit = { blocks: extracted.footer, collections: [] };
const sharedRows = [
  { page_path: "_shared", section_key: "header", label: "Header (logo, menu, Inquire Now)", sort_order: 10, shared_key: null, collections: ["menu_items"], content: { ...summarize(headerSplit.blocks), blocks: headerSplit.blocks, used_on: ["every page"] } },
  { page_path: "_shared", section_key: "footer", label: "Footer", sort_order: 20, shared_key: null, collections: ["menu_items", "services"], content: { ...summarize(footerSplit.blocks), blocks: footerSplit.blocks, used_on: ["every page"] } },
  {
    page_path: "_shared",
    section_key: "company",
    label: "Company details (name, phone, email, address)",
    sort_order: 1,
    shared_key: null,
    collections: [],
    content: { heading: content.company.name, data: { ...content.company, careers_email: pages.careers.email, stats: content.stats, badges: content.achievements } },
  },
  ...shared.values(),
  ...Object.entries(JSON.parse(fs.readFileSync(path.join(out, "popups.json"), "utf8"))).map(([key, blocks], index) => ({
    page_path: "_shared",
    section_key: key,
    label: key === "inquire_popup" ? "Inquire Now popup and form messages" : "Job application popup (Apply for this role)",
    sort_order: 900 + index * 10,
    shared_key: null,
    collections: key === "inquire_popup" ? ["services"] : ["careers"],
    content: { ...summarize(blocks), heading: blocks.find((block) => block.type === "text")?.text ?? null, blocks, used_on: key === "inquire_popup" ? ["every page (Inquire Now button)"] : ["/career"] },
  })),
];

// Structured data that the website builds sections from (kept beside the section copy).
const attach = (pagePath, key, data) => {
  const row = sectionRows.find((item) => item.page_path === pagePath && item.section_key === key) ?? sharedRows.find((item) => item.section_key === key);
  if (!row) throw new Error(`No section ${pagePath} ${key} for data`);
  const target = row.shared_key ? sharedRows.find((item) => item.section_key === row.shared_key) : row;
  target.content.data = { ...(target.content.data ?? {}), ...data };
};
attach("/", "hero", { hero: content.hero, people: ["/images/people/rk.jpg", "/images/people/aadi.jpg", "/images/people/mayank.png"] });
attach("/", "about", { about: content.about });
attach("/", "work", { showcase: content.showcase });
attach("/", "process", { ideology: content.ideology, process: content.process });
attach("/privacy-policy", "objective", { policy: pages.privacyPolicy });
attach("/terms-conditions", sectionRows.find((row) => row.page_path === "/terms-conditions" && row.section_key !== "hero").section_key, { policy: pages.termsConditions });
attach("/refund-policy", sectionRows.find((row) => row.page_path === "/refund-policy" && row.section_key !== "hero").section_key, { policy: pages.refundPolicy });

const rows = {
  site_pages: sitePageRows,
  page_sections: [...sharedRows, ...sectionRows],
  services,
  projects,
  case_studies: caseStudies,
  blogs,
  faqs,
  testimonials,
  client_logos: clientLogos,
  industries,
  careers,
  menu_items: menuItems,
};
fs.writeFileSync(path.join(out, "rows.json"), JSON.stringify(rows, null, 2));

// ---------------------------------------------------------------- SQL

const lit = (value) => (value === null || value === undefined ? "null" : `'${String(value).replaceAll("'", "''")}'`);
const json = (value) => (value === null || value === undefined ? "null" : `${lit(JSON.stringify(value))}::jsonb`);
const arr = (value) => `array[${(value ?? []).map(lit).join(",")}]::text[]`;
const insert = (table, columns, list) =>
  list.length
    ? `insert into public.${table} (${Object.keys(columns).join(", ")}) values\n${list
        .map((row) => `(${Object.entries(columns).map(([column, kind]) => kind(row[column], row)).join(", ")})`)
        .join(",\n")};\n`
    : "";
const T = (value) => lit(value);
const S = (value) => `${lit(value)}::public.publish_status`;

const sql = [];
sql.push(`-- 1. Remove the old website content (leads, clients, team and SEO are not touched).
delete from public.page_sections;
delete from public.site_pages;
delete from public.case_studies;
delete from public.site_sections;
delete from public.menu_items;
delete from public.blogs;
delete from public.projects;
delete from public.faqs;
delete from public.testimonials;
delete from public.client_logos;
delete from public.industries;
delete from public.careers;
`);

// Services are updated in place: leads point at them by id.
sql.push(`-- 2. Services: update the existing rows by slug (leads keep their link), add any missing.\n`);
for (const service of services) {
  sql.push(`insert into public.services (slug, service_key, name, nav_label, group_name, summary, hero_image_url, hero_image_alt, channels, body, visual, status, sort_order, published_at)
values (${T(service.slug)}, ${T(service.service_key)}, ${T(service.name)}, ${T(service.nav_label)}, ${T(service.group_name)}, ${T(service.summary)}, ${T(service.hero_image_url)}, ${T(service.hero_image_alt)}, ${arr(service.channels)}, ${json(service.body)}, ${json(service.visual)}, ${S(service.status)}, ${service.sort_order}, now())
on conflict (slug) do update set service_key = excluded.service_key, name = excluded.name, nav_label = excluded.nav_label, group_name = excluded.group_name, summary = excluded.summary, hero_image_url = excluded.hero_image_url, hero_image_alt = excluded.hero_image_alt, channels = excluded.channels, body = excluded.body, visual = excluded.visual, status = excluded.status, sort_order = excluded.sort_order;\n`);
}
const serviceSlugs = services.map((service) => lit(service.slug)).join(", ");
sql.push(`update public.services set status = 'archived' where slug not in (${serviceSlugs});\n`);

sql.push("-- 3. Lists.\n");
sql.push(insert("projects", { name: T, slug: T, project_type: T, industry: T, summary: T, platforms: arr, logo_url: T, theme: T, cover_image_url: T, gallery: json, display: json, featured: (v) => (v ? "true" : "false"), status: S, sort_order: String, published_at: () => "now()" }, projects));
sql.push(insert("case_studies", { slug: T, client: T, industry: T, title: T, summary: T, cover_image_url: T, data: json, preview: json, status: S, sort_order: String }, caseStudies));
sql.push(insert("faqs", { question: T, answer: T, topic: T, status: S, sort_order: String }, faqs));
sql.push(insert("testimonials", { quote: T, client_name: T, client_role: T, company: T, image_url: T, image_fit: T, status: S, sort_order: String }, testimonials));
sql.push(insert("client_logos", { client_name: T, logo_url: T, logo_alt: T, status: S, sort_order: String }, clientLogos));
sql.push(insert("industries", { name: T, image_url: T, image_alt: T, status: S, sort_order: String }, industries));
sql.push(insert("careers", { slug: T, title: T, department: T, employment_type: T, location: T, experience: T, image_url: T, summary: T, description: json, application_url: T, status: S, published_at: T, sort_order: String }, careers));

sql.push("-- 4. Menus (header first, then submenu items linked to their parent).\n");
sql.push(insert("menu_items", { menu: T, label: T, href: T, sort_order: String, visible: () => "true" }, menuItems.filter((item) => !item.parent)));
for (const item of menuItems.filter((entry) => entry.parent)) {
  const parent = menuItems.find((entry) => entry.key === item.parent);
  sql.push(`insert into public.menu_items (menu, label, href, sort_order, visible, parent_id) select 'header', ${T(item.label)}, ${T(item.href)}, ${item.sort_order}, true, id from public.menu_items where menu = 'header' and parent_id is null and href = ${T(parent.href)};\n`);
}

sql.push("-- 5. Pages and their sections.\n");
sql.push(insert("site_pages", { path: T, name: T, page_type: T, sort_order: String }, sitePageRows));
const sectionColumns = { page_path: T, section_key: T, label: T, sort_order: String, shared_key: T, collections: arr, content: json };

fs.writeFileSync(path.join(out, "seed-1-core.sql"), sql.join("\n"));
// Blogs and sections are large, so they go in their own files.
fs.writeFileSync(path.join(out, "seed-2-blogs.sql"), insert("blogs", { slug: T, title: T, excerpt: T, content: json, category: T, categories: arr, author_name: T, cover_image_url: T, cover_image_alt: T, images: json, status: S, published_at: T }, blogs));
const allSections = rows.page_sections;
const chunk = 40;
for (let start = 0, part = 1; start < allSections.length; start += chunk, part++) {
  fs.writeFileSync(path.join(out, `seed-3-sections-${part}.sql`), insert("page_sections", sectionColumns, allSections.slice(start, start + chunk)));
}

const counts = Object.fromEntries(Object.entries(rows).map(([name, list]) => [name, list.length]));
console.log(counts);
for (const file of fs.readdirSync(out).filter((name) => name.endsWith(".sql"))) console.log(file, Math.round(fs.statSync(path.join(out, file)).size / 1024) + "KB");
