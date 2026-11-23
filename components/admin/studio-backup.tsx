"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { DownloadIcon } from "@/components/admin/icons";
import { Notice, StudioHeader, card, primaryButton } from "@/components/admin/studio-ui";
import { SettingsTabs } from "@/components/admin/website-content";
import { CONTENT_ROLES } from "@/lib/content-admin";
import { getSupabase } from "@/lib/supabase-browser";

const TABLES = ["site_pages", "page_sections", "services", "projects", "case_studies", "blogs", "faqs", "testimonials", "client_logos", "industries", "careers", "menu_items"];

/** Site Settings → Backup: downloads every piece of website content as one file. */
export function StudioBackup() {
  const { profile } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "good" | "bad"; text: string } | null>(null);

  if (!CONTENT_ROLES.has(profile.role)) return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins, editors and marketing can change website content.</div>;

  const download = async () => {
    setBusy(true);
    setMessage(null);
    const supabase = getSupabase();
    const results = await Promise.all(TABLES.map(async (table) => [table, await supabase.from(table).select("*")] as const));
    setBusy(false);
    const failed = results.find(([, result]) => result.error);
    if (failed) return setMessage({ tone: "bad", text: `Could not read ${failed[0]}: ${failed[1].error?.message}` });
    const backup = { made_at: new Date().toISOString(), tables: Object.fromEntries(results.map(([table, result]) => [table, result.data])) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `aletindia-content-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    const rows = results.reduce((sum, [, result]) => sum + (result.data?.length ?? 0), 0);
    setMessage({ tone: "good", text: `Backup downloaded: ${rows} items from ${TABLES.length} tables.` });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <StudioHeader crumbs={[{ label: "CMS", href: "/admin" }, { label: "Site Settings", href: "/admin/settings" }, { label: "Backup" }]} title="Site Settings" subtitle="Configure your website settings and preferences." />
        <div className="grid gap-6 px-4 pt-5 pb-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:px-8">
          <SettingsTabs active="Backup" />
          <section className={`${card} space-y-4 p-6`}>
            <h2 className="text-[22px] font-extrabold">Backup</h2>
            <p className="max-w-2xl text-[15px] text-[#5b6b85]">
              Download a copy of all website content: pages, sections, services, portfolio, blogs, FAQs, testimonials, careers and menus. Pictures stay in the Media Library.
            </p>
            {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
            <button type="button" onClick={() => void download()} disabled={busy} className={primaryButton}>
              <DownloadIcon className="h-4 w-4" /> {busy ? "Preparing…" : "Download backup"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
