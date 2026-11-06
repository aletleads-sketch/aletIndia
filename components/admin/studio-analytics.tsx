"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { FieldShell } from "@/components/admin/content-fields";
import { SaveIcon } from "@/components/admin/icons";
import { Loader } from "@/components/admin/loader";
import { Notice, StudioHeader, card, primaryButton } from "@/components/admin/studio-ui";
import { SettingsTabs } from "@/components/admin/website-content";
import { GA_PATTERN, GTM_PATTERN, type AnalyticsSettings } from "@/lib/analytics-shared";
import { loadSeoSetting, publishSeoChanges, saveSeoSetting } from "@/lib/seo-admin";

const field = "w-full rounded-lg border border-[#d4dbe7] bg-white px-3 py-2 font-mono text-sm uppercase outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20 disabled:bg-[#f8fafd]";

/** Site Settings → Analytics: the Google Analytics and Tag Manager ids the website loads. */
export function StudioAnalytics() {
  const { profile } = useAdmin();
  const isAdmin = profile.role === "admin";
  const [form, setForm] = useState<{ gaId: string; gtmId: string } | null>(null);
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "good" | "bad"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSeoSetting<AnalyticsSettings>("analytics").then((result) => {
      if (cancelled) return;
      const value = { gaId: result.value?.gaId ?? "", gtmId: result.value?.gtmId ?? "" };
      setForm(value);
      setSaved(JSON.stringify(value));
      if (result.error) setMessage({ tone: "bad", text: result.error });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const changed = form !== null && JSON.stringify(form) !== saved;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    const gaId = form.gaId.trim().toUpperCase();
    const gtmId = form.gtmId.trim().toUpperCase();
    if (gaId && !GA_PATTERN.test(gaId)) return setMessage({ tone: "bad", text: "The Google Analytics id looks wrong. It starts with G-, e.g. G-AB12CD34EF." });
    if (gtmId && !GTM_PATTERN.test(gtmId)) return setMessage({ tone: "bad", text: "The Tag Manager id looks wrong. It starts with GTM-, e.g. GTM-ABC1234." });
    setBusy(true);
    setMessage(null);
    const value = { ...(gaId ? { gaId } : {}), ...(gtmId ? { gtmId } : {}) };
    const error = await saveSeoSetting("analytics", value);
    if (error) {
      setBusy(false);
      return setMessage({ tone: "bad", text: error });
    }
    const next = { gaId, gtmId };
    setForm(next);
    setSaved(JSON.stringify(next));
    const publishError = await publishSeoChanges();
    setBusy(false);
    setMessage(publishError ? { tone: "bad", text: publishError } : { tone: "good", text: gaId || gtmId ? "Saved. The live website now sends visits to Google." : "Saved. The website no longer loads analytics." });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <StudioHeader crumbs={[{ label: "CMS", href: "/admin" }, { label: "Site Settings", href: "/admin/settings" }, { label: "Analytics" }]} title="Site Settings" subtitle="Configure your website settings and preferences." />
        <div className="grid gap-6 px-4 pt-5 pb-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:px-8">
          <SettingsTabs active="Analytics" />
          {!form ? (
            <Loader label="Loading…" />
          ) : (
            <form onSubmit={submit} className={`${card} space-y-5 p-6`}>
              <div>
                <h2 className="text-[22px] font-extrabold">Analytics</h2>
                <p className="mt-1 max-w-2xl text-[15px] text-[#5b6b85]">
                  Connect Google Analytics to see how many people visit the website, which pages they read and where they come from. Fill in one or both ids; leave a box empty to switch it off.
                </p>
              </div>
              {!isAdmin ? <Notice tone="warn">Only admins can change analytics.</Notice> : null}
              <div className="grid gap-5 md:grid-cols-2">
                <FieldShell label="Google Analytics 4 measurement id" hint="Google Analytics → Admin → Data streams → your website. Starts with G-.">
                  <input value={form.gaId} disabled={!isAdmin} onChange={(event) => setForm({ ...form, gaId: event.target.value })} placeholder="G-XXXXXXXXXX" className={field} />
                </FieldShell>
                <FieldShell label="Google Tag Manager container id (optional)" hint="Only if your marketing team uses Tag Manager. Starts with GTM-.">
                  <input value={form.gtmId} disabled={!isAdmin} onChange={(event) => setForm({ ...form, gtmId: event.target.value })} placeholder="GTM-XXXXXXX" className={field} />
                </FieldShell>
              </div>
              <p className="rounded-lg bg-[#f5f7fb] px-3 py-2 text-xs text-[#5b6b85]">
                Analytics runs only on the live website (aletindia.com), not on the dev or test sites, so test visits do not count. Use Tag Manager or Analytics, not both for the same tracking, or visits are counted twice.
              </p>
              {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
              {isAdmin ? (
                <button type="submit" disabled={!changed || busy} className={primaryButton}>
                  <SaveIcon className="h-4 w-4" /> {busy ? "Saving…" : "Save Changes"}
                </button>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
