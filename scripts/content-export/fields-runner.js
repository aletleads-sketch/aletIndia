// Runs in the browser on the local admin (signed in), so writes follow the database's own rules.
// Stores the default section fields from out/fields.json (made by fields-sql.mjs).
// A section that already has fields is skipped, so admin changes are kept.
// Copy this file and out/fields.json to public/_seed/ to run it, then delete that folder.
window.__seedFields = async function seedFields(url) {
  const SUPABASE_URL = "https://seegtwkfeolpjlgjlbyd.supabase.co";
  const KEY = "sb_publishable_AB_9PH5k_kHBDsXIr2IhAA_6VznqX81";
  const sessionKey = Object.keys(localStorage).find((key) => key.startsWith("sb-") && key.endsWith("-auth-token"));
  const session = sessionKey && JSON.parse(localStorage.getItem(sessionKey));
  if (!session?.access_token) throw new Error("Not signed in to the admin.");
  const headers = { apikey: KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" };
  const call = async (method, query, body, prefer = "return=minimal") => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/page_sections${query}`, { method, headers: { ...headers, Prefer: prefer }, body: body && JSON.stringify(body) });
    if (!response.ok) throw new Error(`${method} ${query}: ${response.status} ${await response.text()}`);
    return prefer.includes("representation") || method === "GET" ? response.json() : null;
  };
  const enc = encodeURIComponent;
  const where = (page, key) => `?page_path=eq.${enc(page)}&section_key=eq.${enc(key)}`;
  const { renames, sharedRefs, rows } = await (await fetch(url, { cache: "no-store" })).json();
  const log = [];

  for (const [page, from, to] of renames) {
    const existing = await call("GET", `${where(page, to)}&select=id`);
    if (!existing.length) await call("PATCH", where(page, from), { section_key: to });
  }
  for (const [page, key, sharedKey] of sharedRefs) await call("PATCH", where(page, key), { shared_key: sharedKey, content: {} });

  const current = await call("GET", "?select=page_path,section_key,content");
  const byId = new Map(current.map((row) => [`${row.page_path}#${row.section_key}`, row]));
  let created = 0, filled = 0, kept = 0;
  for (const row of rows) {
    const existing = byId.get(`${row.page_path}#${row.section_key}`);
    if (existing?.content?.fields) { kept++; continue; }
    if (existing) {
      const content = { fields: row.fields, ...(existing.content?.data ? { data: existing.content.data } : {}) };
      await call("PATCH", where(row.page_path, row.section_key), { content });
      filled++;
    } else {
      await call("POST", "", { page_path: row.page_path, section_key: row.section_key, label: row.label, sort_order: row.sort_order, content: { fields: row.fields } });
      created++;
    }
  }
  log.push(`filled ${filled}, created ${created}, kept ${kept}`);
  const refresh = await fetch(`${location.pathname.startsWith("/aletindia") ? "/aletindia" : ""}/api/content/revalidate`, { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } });
  log.push(`cache refresh: ${refresh.status}`);
  return log;
};
