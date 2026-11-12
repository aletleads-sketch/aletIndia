"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Spinner } from "@/components/admin/loader";
import { loadSeoSetting, publicUrl, saveSeoSetting } from "@/lib/seo-admin";
import { callSeoSync, loadLastSync, type GoogleSettings, type GoogleStatus, type SyncRun } from "@/lib/seo-google";
import { BASE_PATH } from "@/lib/site-path";

const input = "w-full rounded-lg border border-[#d4dbe7] px-3 py-2 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20";

const when = (value: string) => new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** "Last synced …" line plus a Sync now button, shown at the top of the Google-data screens. */
export function SyncBar({ onSynced }: { onSynced: () => void }) {
  const [run, setRun] = useState<SyncRun | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => setRun(await loadLastSync()), []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const sync = async () => {
    setBusy(true);
    setError(null);
    try {
      await callSeoSync({ action: "sync" });
      onSynced();
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "The sync failed.");
    }
    await load();
    setBusy(false);
  };

  if (run === undefined) return null;
  if (run === null) {
    return (
      <div className="mb-5 rounded-2xl border border-[#cfe0fb] bg-[#eef4ff] p-4 text-sm text-[#14213d]">
        <p className="font-semibold">Google is not connected yet</p>
        <p className="mt-1 text-[#4a5a75]">
          These numbers come from Google Search Console and Google Analytics. Connect them once in{" "}
          <Link href="/admin/seo/settings#google" className="font-semibold text-[#0b57d0] hover:underline">
            SEO Settings → Google connection
          </Link>
          , then the website copies the numbers every night.
        </p>
      </div>
    );
  }
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-[#5b6b85]">
      <span>
        {run.ok === false ? (
          <span className="font-semibold text-[#a12020]">Last sync failed {when(run.started_at)}: {run.message}</span>
        ) : (
          <>Google numbers last copied {when(run.finished_at ?? run.started_at)}{run.ok === null ? " (still running)" : ""}. They update every night.</>
        )}
      </span>
      <button type="button" onClick={sync} disabled={busy} className="ml-auto inline-flex items-center gap-2 rounded-lg border border-[#d4dbe7] bg-white px-3 py-1.5 text-sm font-semibold text-[#14213d] disabled:opacity-50">
        {busy ? <Spinner /> : null}
        {busy ? "Syncing…" : "Sync now"}
      </button>
      {error ? <p className="w-full rounded-lg bg-[#fdecec] px-3 py-2 text-[#a12020]">{error}</p> : null}
    </div>
  );
}

function StatusLine({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${ok ? "bg-[#1c8a4a]" : "bg-[#c7cfdc]"}`} aria-hidden="true">
        {ok ? "✓" : "!"}
      </span>
      <span>
        <span className="font-semibold">{label}:</span> <span className={ok ? "text-[#1c7a3e]" : "text-[#5b6b85]"}>{detail}</span>
      </span>
    </li>
  );
}

/** SEO Settings card: which Search Console site and GA4 property to read, connection status, sync and sitemap submit. */
export function GoogleConnectionCard() {
  const [form, setForm] = useState<GoogleSettings | null>(null);
  const [saved, setSaved] = useState<GoogleSettings | null>(null);
  const [status, setStatus] = useState<GoogleStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState<"save" | "sync" | "sitemap" | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      setStatus(await callSeoSync<GoogleStatus>({ action: "status" }));
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not check the connection." });
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    void (async () => {
      const { value } = await loadSeoSetting<GoogleSettings>("google");
      const next = { searchConsoleSite: value.searchConsoleSite ?? publicUrl("/").replace(/\/?$/, "/"), ga4PropertyId: value.ga4PropertyId ?? "", pathPrefix: value.pathPrefix ?? BASE_PATH };
      setForm(next);
      setSaved(value.searchConsoleSite || value.ga4PropertyId ? next : null);
      await check();
    })();
  }, [check]);

  const set = (key: keyof GoogleSettings, value: string) => {
    setMessage(null);
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    const site = (form.searchConsoleSite ?? "").trim();
    const property = (form.ga4PropertyId ?? "").trim();
    const prefix = (form.pathPrefix ?? "").trim().replace(/\/+$/, "");
    if (site && !/^(https?:\/\/[^\s]+|sc-domain:[a-z0-9.-]+)$/i.test(site)) return setMessage({ ok: false, text: "The Search Console site must be a full link (https://…) or sc-domain:yourdomain.com." });
    if (property && !/^\d{6,12}$/.test(property)) return setMessage({ ok: false, text: "The GA4 property ID is the number in GA4 → Admin → Property details (not the G-… measurement ID)." });
    if (prefix && !prefix.startsWith("/")) return setMessage({ ok: false, text: "The page prefix starts with /, for example /aletindia." });
    const value: GoogleSettings = {};
    if (site) value.searchConsoleSite = site;
    if (property) value.ga4PropertyId = property;
    if (prefix) value.pathPrefix = prefix;
    setBusy("save");
    const error = await saveSeoSetting("google", value);
    setBusy(null);
    if (error) return setMessage({ ok: false, text: error });
    setSaved(form);
    setMessage({ ok: true, text: "Saved. Checking the connection…" });
    await check();
  };

  const run = async (action: "sync" | "submit_sitemap") => {
    setBusy(action === "sync" ? "sync" : "sitemap");
    setMessage(null);
    try {
      if (action === "sync") {
        const result = await callSeoSync<{ days: number; rows: number }>({ action: "sync" });
        setMessage({ ok: true, text: `Copied ${result.rows.toLocaleString("en-IN")} rows covering the last ${result.days} days. Open the SEO Dashboard to see them.` });
      } else {
        const result = await callSeoSync<{ sitemap: string }>({ action: "submit_sitemap" });
        setMessage({ ok: true, text: `Sitemap sent to Google: ${result.sitemap}` });
      }
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "That did not work." });
    }
    setBusy(null);
  };

  const connected = Boolean(status?.signIn.ok && (status.searchConsole.ok || status.analytics.ok));

  return (
    <section id="google" className="mx-auto mt-5 max-w-4xl scroll-mt-4 rounded-2xl border border-[#dfe5ef] bg-white">
      <div className="border-b border-[#eef1f6] px-5 py-4">
        <h2 className="font-bold">Google connection</h2>
        <p className="mt-0.5 text-sm text-[#5b6b85]">Feeds the SEO Dashboard, Keywords Tracking and Reports. The website copies the numbers from Google once a night.</p>
      </div>
      {!form ? (
        <div className="p-5">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={save} className="space-y-4 px-5 py-4">
          <ul className="space-y-2 rounded-xl bg-[#f7f9fc] p-4 text-sm">
            {checking && !status ? (
              <li className="flex items-center gap-2 text-[#5b6b85]">
                <Spinner /> Checking…
              </li>
            ) : status ? (
              <>
                <StatusLine label="Google service account" ok={status.signIn.ok} detail={status.signIn.ok ? "signed in" : (status.signIn.error ?? "not set up")} />
                <StatusLine
                  label="Search Console"
                  ok={status.searchConsole.ok}
                  detail={status.searchConsole.ok ? `connected (${status.searchConsole.permission ?? "access"})` : (status.searchConsole.error ?? "not checked")}
                />
                <StatusLine label="Google Analytics (GA4)" ok={status.analytics.ok} detail={status.analytics.ok ? "connected" : (status.analytics.error ?? "not checked")} />
              </>
            ) : null}
          </ul>

          {status?.serviceAccountEmail ? (
            <div className="rounded-xl border border-[#dfe5ef] p-4 text-sm">
              <p className="font-semibold">Give this email access in Google</p>
              <p className="mt-1 font-mono text-[13px] break-all select-all">{status.serviceAccountEmail}</p>
              <p className="mt-2 text-[#5b6b85]">
                Search Console → Settings → Users and permissions → Add user → <b>Full</b>. Google Analytics → Admin → Property access management → Add users → <b>Viewer</b>.
              </p>
            </div>
          ) : null}

          <label className="block">
            <span className="text-sm font-semibold">Search Console site</span>
            <input value={form.searchConsoleSite ?? ""} onChange={(event) => set("searchConsoleSite", event.target.value)} placeholder="https://aletindia.com/aletindia/" className={`${input} mt-1 font-mono`} />
            <span className="mt-1 block text-xs text-[#5b6b85]">Exactly as the property is named in Search Console: a full link ending in /, or sc-domain:aletindia.com for a domain property.</span>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold">GA4 property ID</span>
              <input value={form.ga4PropertyId ?? ""} onChange={(event) => set("ga4PropertyId", event.target.value)} placeholder="123456789" inputMode="numeric" className={`${input} mt-1 font-mono`} />
              <span className="mt-1 block text-xs text-[#5b6b85]">GA4 → Admin → Property details. A number, not the G-… ID.</span>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Only count pages starting with</span>
              <input value={form.pathPrefix ?? ""} onChange={(event) => set("pathPrefix", event.target.value)} placeholder="/aletindia" className={`${input} mt-1 font-mono`} />
              <span className="mt-1 block text-xs text-[#5b6b85]">Keeps the WordPress pages of aletindia.com out of the Analytics numbers. Empty = all pages.</span>
            </label>
          </div>

          {message ? <p className={`rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-[#eaf7ef] text-[#1c7a3e]" : "bg-[#fdecec] text-[#a12020]"}`}>{message.text}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button type="button" onClick={() => void check()} disabled={checking} className="mr-auto text-sm font-semibold text-[#0b57d0] hover:underline disabled:opacity-50">
              {checking ? "Checking…" : "Check connection"}
            </button>
            <button type="button" onClick={() => void run("submit_sitemap")} disabled={!connected || !status?.searchConsole.ok || busy !== null} className="rounded-xl border border-[#d4dbe7] px-4 py-2.5 text-sm font-semibold disabled:opacity-40">
              {busy === "sitemap" ? "Sending…" : "Send sitemap to Google"}
            </button>
            <button type="button" onClick={() => void run("sync")} disabled={!connected || busy !== null} className="rounded-xl border border-[#d4dbe7] px-4 py-2.5 text-sm font-semibold disabled:opacity-40">
              {busy === "sync" ? "Syncing…" : "Sync now"}
            </button>
            <button type="submit" disabled={busy !== null || JSON.stringify(form) === JSON.stringify(saved)} className="rounded-xl bg-[#1a63e8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
              {busy === "save" ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
