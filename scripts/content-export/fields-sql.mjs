// SQL that stores the default fields of every wired section (lib/section-fields.ts) in
// public.page_sections.content.fields. A section that already has fields is left alone,
// so nothing an admin changed is overwritten. Missing section rows are created.
// Usage: node scripts/content-export/fields-sql.mjs > scripts/content-export/out/fields.sql
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const root = path.resolve(import.meta.dirname, "../..");
const jiti = createJiti(import.meta.url, { alias: { "@": root } });
const { SECTION_FIELDS, defaultFields } = await jiti.import(path.join(root, "lib/section-fields.ts"));
const { htmlTexts } = await jiti.import(path.join(root, "lib/html-texts.ts"));
const { aliDifferenceMarkup } = await jiti.import(path.join(root, "lib/ali-difference-html.ts"));

// Custom HTML designs: store their current words so the admin sees them in a list.
const designWords = {
  "/about-us#our_difference": () => htmlTexts(aliDifferenceMarkup),
  "/about-us#story_journey": () => htmlTexts(fs.readFileSync(path.join(root, "public/alet-india-our-journey.html"), "utf8")),
};

// Readable names for rows this script creates.
const LABELS = {
  hero_buttons: "Page header buttons and breadcrumb",
  service_page: "Service page layout (headings shared by all service pages)",
  inquire_form: "Inquire Now popup and form",
  policy_sidebar: "Policy pages: side box and notes",
  journal: "Articles list (filters and buttons)",
  article: "Article page (labels around every blog)",
  study: "Case study page (labels around every study)",
  job_board: "Job board (labels)",
  policy: "Policy text",
};

const lit = (value) => `'${String(value).replaceAll("'", "''")}'`;
const lines = [
  "-- Keys renamed when sections were wired.",
  "update public.page_sections set section_key = 'intro' where page_path = '/about-us' and section_key = 'building_digital_possibilities_since_201';",
  "update public.page_sections set section_key = 'policy' where page_path = '/privacy-policy' and section_key = 'objective';",
  "update public.page_sections set section_key = 'policy' where page_path = '/terms-conditions' and section_key = 'updates_to_the_site';",
  "update public.page_sections set section_key = 'policy' where page_path = '/refund-policy' and section_key = 'how_projects_are_agreed';",
  "update public.page_sections set section_key = 'journal' where page_path = '/blogs' and section_key = 'featured_mobile_application_development';",
  "update public.page_sections set section_key = 'article' where page_path = '/blogs/[slug]' and section_key = 'hero';",
  "update public.page_sections set section_key = 'study' where page_path = '/case-studies/[slug]' and section_key = 'hero';",
  "-- Home uses the shared process and contact blocks, like every other page.",
  "update public.page_sections set shared_key = 'process', content = '{}'::jsonb where page_path = '/' and section_key = 'process';",
  "update public.page_sections set shared_key = 'contact_form', content = '{}'::jsonb where page_path = '/' and section_key = 'contact_form';",
];

const jsonRows = [];
let order = 1000;
for (const id of Object.keys(SECTION_FIELDS)) {
  const [page, key] = id.split("#");
  const fields = defaultFields(id);
  if (designWords[id]) fields.texts = designWords[id]();
  const json = `${lit(JSON.stringify(fields))}::jsonb`;
  const label = LABELS[key] ?? key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
  order += 10;
  jsonRows.push({ page_path: page, section_key: key, label, sort_order: order, fields });
  lines.push(
    `insert into public.page_sections (page_path, section_key, label, sort_order, content) values (${lit(page)}, ${lit(key)}, ${lit(label)}, ${order}, jsonb_build_object('fields', ${json}))\n` +
      `  on conflict (page_path, section_key) do update set content = jsonb_build_object('fields', ${json}) || case when public.page_sections.content ? 'data' then jsonb_build_object('data', public.page_sections.content -> 'data') else '{}'::jsonb end\n` +
      `  where not (public.page_sections.content ? 'fields');`,
  );
}
// The same, as data for scripts/content-export/fields-runner.js (run in the signed-in admin).
const renames = [
  ["/about-us", "building_digital_possibilities_since_201", "intro"],
  ["/privacy-policy", "objective", "policy"],
  ["/terms-conditions", "updates_to_the_site", "policy"],
  ["/refund-policy", "how_projects_are_agreed", "policy"],
  ["/blogs", "featured_mobile_application_development", "journal"],
  ["/blogs/[slug]", "hero", "article"],
  ["/case-studies/[slug]", "hero", "study"],
];
const sharedRefs = [["/", "process", "process"], ["/", "contact_form", "contact_form"]];
fs.writeFileSync(path.join(import.meta.dirname, "out/fields.json"), JSON.stringify({ renames, sharedRefs, rows: jsonRows }));
console.log(lines.join("\n"));
