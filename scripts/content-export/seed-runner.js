// Runs in the browser on the local admin (signed in as an admin), so every write goes
// through the database's own permission rules. It replaces the website content tables
// with out/rows.json.
// WARNING: it deletes every page section first, so anything changed in the admin is lost.
// Only for the first fill, before the client starts editing. Copy both files to public/_seed/ to run, then delete that folder.
window.__seedSite = async function seedSite(rowsUrl) {
  const SUPABASE_URL = "https://seegtwkfeolpjlgjlbyd.supabase.co";
  const KEY = "sb_publishable_AB_9PH5k_kHBDsXIr2IhAA_6VznqX81";
  const sessionKey = Object.keys(localStorage).find((key) => key.startsWith("sb-") && key.endsWith("-auth-token"));
  const session = sessionKey && JSON.parse(localStorage.getItem(sessionKey));
  if (!session?.access_token) throw new Error("Not signed in to the admin.");
  const headers = { apikey: KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" };
  const rows = await (await fetch(rowsUrl, { cache: "no-store" })).json();
  const log = [];

  async function call(method, table, query = "", body, prefer = "return=minimal") {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
      method,
      headers: { ...headers, Prefer: prefer },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`${method} ${table}: ${response.status} ${await response.text()}`);
    return prefer.includes("representation") ? response.json() : null;
  }
  const pick = (list, columns) => list.map((row) => Object.fromEntries(columns.map((column) => [column, row[column] ?? null])));
  async function insert(table, list, columns) {
    for (let start = 0; start < list.length; start += 25) {
      await call("POST", table, "", pick(list.slice(start, start + 25), columns));
    }
    log.push(`${table}: ${list.length}`);
  }

  // 1. Old website content out (leads, clients, team and SEO stay).
  for (const table of ["page_sections", "site_pages", "case_studies", "site_sections", "menu_items", "blogs", "projects", "faqs", "testimonials", "client_logos", "industries", "careers"]) {
    const key = table === "site_pages" ? "path" : "id";
    await call("DELETE", table, `?${key}=not.is.null`);
  }
  log.push("old content removed");

  // 2. Services: update in place by slug so leads keep their link.
  const now = new Date().toISOString();
  await call(
    "POST",
    "services",
    "?on_conflict=slug",
    pick(rows.services.map((row) => ({ ...row, published_at: now })), ["slug", "service_key", "name", "nav_label", "group_name", "summary", "hero_image_url", "hero_image_alt", "channels", "body", "visual", "status", "sort_order", "published_at"]),
    "resolution=merge-duplicates,return=minimal",
  );
  log.push(`services: ${rows.services.length} updated`);

  // 3. Lists.
  await insert("projects", rows.projects.map((row) => ({ ...row, published_at: now })), ["name", "slug", "project_type", "industry", "summary", "platforms", "logo_url", "theme", "cover_image_url", "gallery", "display", "featured", "status", "sort_order", "published_at"]);
  await insert("case_studies", rows.case_studies, ["slug", "client", "industry", "title", "summary", "cover_image_url", "data", "preview", "status", "sort_order"]);
  await insert("blogs", rows.blogs, ["slug", "title", "excerpt", "content", "category", "categories", "author_name", "cover_image_url", "cover_image_alt", "images", "status", "published_at"]);
  await insert("faqs", rows.faqs, ["question", "answer", "topic", "status", "sort_order"]);
  await insert("testimonials", rows.testimonials, ["quote", "client_name", "client_role", "company", "image_url", "image_fit", "status", "sort_order"]);
  await insert("client_logos", rows.client_logos, ["client_name", "logo_url", "logo_alt", "status", "sort_order"]);
  await insert("industries", rows.industries, ["name", "image_url", "image_alt", "status", "sort_order"]);
  await insert("careers", rows.careers, ["slug", "title", "department", "employment_type", "location", "experience", "image_url", "summary", "description", "application_url", "status", "published_at", "sort_order"]);

  // 4. Menus: top level first, then the Services submenu linked to its parent.
  const top = rows.menu_items.filter((item) => !item.parent);
  const created = await call("POST", "menu_items", "", pick(top, ["menu", "label", "href", "sort_order", "visible"]), "return=representation");
  const parentId = (key) => {
    const parent = rows.menu_items.find((item) => item.key === key);
    return created.find((row) => row.menu === "header" && row.href === parent.href).id;
  };
  const children = rows.menu_items.filter((item) => item.parent).map((item) => ({ ...item, parent_id: parentId(item.parent) }));
  await call("POST", "menu_items", "", pick(children, ["menu", "label", "href", "sort_order", "visible", "parent_id"]));
  log.push(`menu_items: ${top.length + children.length}`);

  // 5. Pages and sections.
  await insert("site_pages", rows.site_pages, ["path", "name", "page_type", "sort_order"]);
  await insert("page_sections", rows.page_sections, ["page_path", "section_key", "label", "sort_order", "shared_key", "collections", "content"]);
  return log;
};
