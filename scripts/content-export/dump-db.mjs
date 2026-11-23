// Reads the website content tables back from Supabase (public read) into out/db-dump.json.
import fs from "node:fs";
import path from "node:path";
const URL = "https://seegtwkfeolpjlgjlbyd.supabase.co/rest/v1";
const KEY = "sb_publishable_AB_9PH5k_kHBDsXIr2IhAA_6VznqX81";
const tables = ["site_pages", "page_sections", "services", "projects", "case_studies", "blogs", "faqs", "testimonials", "client_logos", "industries", "careers", "menu_items"];
const dump = {};
for (const table of tables) {
  const response = await fetch(`${URL}/${table}?select=*`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  dump[table] = await response.json();
  console.log(table, Array.isArray(dump[table]) ? dump[table].length : dump[table]);
}
fs.writeFileSync(path.join(import.meta.dirname, "out/db-dump.json"), JSON.stringify(dump, null, 2));
