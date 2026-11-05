"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { XIcon } from "@/components/admin/icons";
import { Loader, ProgressLoader } from "@/components/admin/loader";
import {
  loadOverrides,
  loadPageMeta,
  loadSitemapPaths,
  mapLimit,
  metaIssues,
  publishSeoChanges,
  SEO_LIMITS,
  siteHref,
  type PageKind,
  type PageMeta,
  type SeoOverride,
} from "@/lib/seo-admin";
import { pageUrl } from "@/lib/seo";
import { getSupabase } from "@/lib/supabase-browser";

const field = "rounded-lg border border-[#d4dbe7] px-3 py-2 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20";
const input = `w-full ${field}`;
const button = "rounded-xl px-4 py-2.5 text-sm font-semibold";
const KINDS: ("All" | PageKind)[] = ["All", "Page", "Service", "Case study", "Blog"];
const STATUSES = ["All", "Optimized", "Needs update", "Edited in admin"] as const;
type StatusFilter = (typeof STATUSES)[number];

export function SeoMetaTagsWorkspace() {
  const { profile } = useAdmin();
  const isAdmin = profile.role === "admin";
  const [pages, setPages] = useState<PageMeta[] | null>(null);
  const [overrides, setOverrides] = useState<Map<string, SeoOverride>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [editing, setEditing] = useState<PageMeta | null>(null);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    try {
      const [paths, saved] = await Promise.all([loadSitemapPaths(), loadOverrides()]);
      if (saved.error) setError(saved.error);
      setOverrides(new Map(saved.rows.map((row) => [row.path, row])));
      setTotal(paths.length);
      // Show each page as soon as it is read, in sitemap order.
      const found: (PageMeta | undefined)[] = new Array(paths.length);
      setPages([]);
      await mapLimit(paths.map((path, index) => ({ path, index })), 6, async ({ path, index }) => {
        found[index] = await loadPageMeta(path);
        setPages(found.filter((page): page is PageMeta => Boolean(page)));
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load the pages.");
      setPages([]);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    // Loading on open is the point of this screen; the state updates happen after the fetches resolve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [isAdmin, load]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (pages ?? []).filter((page) => {
      if (kind !== "All" && page.kind !== kind) return false;
      const issues = metaIssues(page.title, page.description);
      if (status === "Optimized" && issues.length) return false;
      if (status === "Needs update" && !issues.length) return false;
      if (status === "Edited in admin" && !overrides.has(page.path)) return false;
      return !term || [page.path, page.title, page.description].some((value) => value.toLowerCase().includes(term));
    });
  }, [pages, search, kind, status, overrides]);

  const needsUpdate = (pages ?? []).filter((page) => metaIssues(page.title, page.description).length).length;

  if (!isAdmin) {
    return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins can manage SEO.</div>;
  }

  async function afterSave(path: string, message: string) {
    setEditing(null);
    setNotice(message);
    const saved = await loadOverrides();
    setOverrides(new Map(saved.rows.map((row) => [row.path, row])));
    const fresh = await loadPageMeta(path);
    setPages((current) => current?.map((page) => (page.path === path ? fresh : page)) ?? current);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">Meta Tags & SEO</h1>
          <p className="text-sm text-[#5b6b85]">Manage each page&apos;s Google title, description and share preview</p>
        </div>
        <UserMenu />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        {error ? <p className="mb-4 rounded-xl border border-[#f3c2c2] bg-[#fdecec] p-4 text-sm text-[#a12020]">{error}</p> : null}
        {notice ? <p className="mb-4 rounded-xl border border-[#bfe5cc] bg-[#eaf7ef] p-4 text-sm text-[#1c7a3e]">{notice}</p> : null}

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Pages" value={pages && total ? total : "…"} />
          <Stat label="Need an update" value={pages && total && pages.length === total ? needsUpdate : "…"} tone={needsUpdate ? "warn" : "ok"} />
          <Stat label="Edited in admin" value={pages ? overrides.size : "…"} />
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search pages (e.g. /services, career)"
            aria-label="Search pages"
            className={`${input} min-w-[14rem] flex-1 bg-white`}
          />
          <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} aria-label="Status" className={`${field} bg-white`}>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value === "All" ? "All statuses" : value}
              </option>
            ))}
          </select>
          <select value={kind} onChange={(event) => setKind(event.target.value as (typeof KINDS)[number])} aria-label="Page type" className={`${field} bg-white`}>
            {KINDS.map((value) => (
              <option key={value} value={value}>
                {value === "All" ? "All types" : value}
              </option>
            ))}
          </select>
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#dfe5ef] bg-white">
          {!pages || (!rows.length && pages.length < total) ? (
            <Loader label={total ? `Reading every page on the website… ${pages?.length ?? 0} of ${total}` : "Loading pages…"} />
          ) : pages.length < total ? (
            <div className="border-b border-[#eef1f6]">
              <ProgressLoader label="Reading every page on the website…" done={pages.length} total={total} />
            </div>
          ) : null}
          {pages && total && pages.length === total && !rows.length ? <p className="p-5 text-sm text-[#5b6b85]">No pages match these filters.</p> : null}
          {rows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] text-left text-sm">
                <thead className="bg-[#f6f8fc] text-xs font-semibold tracking-wide text-[#5b6b85] uppercase">
                  <tr>
                    <th className="px-4 py-3">Page</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Meta description</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef1f6]">
                  {rows.map((page) => {
                    const issues = metaIssues(page.title, page.description);
                    return (
                      <tr key={page.path} className="align-top">
                        <td className="px-4 py-3">
                          <a href={siteHref(page.path)} target="_blank" rel="noreferrer" className="font-semibold text-[#0b57d0] hover:underline">
                            {page.path}
                          </a>
                          <p className="mt-0.5 text-xs text-[#5b6b85]">{page.kind}</p>
                        </td>
                        <td className="max-w-[18rem] px-4 py-3">{page.title || <span className="text-[#a12020]">Missing</span>}</td>
                        <td className="max-w-[24rem] px-4 py-3 text-[#334155]">
                          <span className="line-clamp-3">{page.description || <span className="text-[#a12020]">Missing</span>}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            title={issues.join("\n") || undefined}
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${issues.length ? "bg-[#fff3d9] text-[#8a5a00]" : "bg-[#eaf7ef] text-[#1c7a3e]"}`}
                          >
                            {issues.length ? "Needs update" : "Optimized"}
                          </span>
                          {overrides.has(page.path) ? <p className="mt-1 text-xs text-[#5b6b85]">Edited in admin</p> : null}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setNotice(null);
                              setError(null);
                              setEditing(page);
                            }}
                            className="rounded-lg border border-[#d4dbe7] px-3 py-1.5 text-sm font-semibold hover:border-[#b9c6db]"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
        <p className="mt-4 text-sm text-[#5b6b85]">
          Status follows Google&apos;s usual limits: title {SEO_LIMITS.title.min}–{SEO_LIMITS.title.max} characters, description {SEO_LIMITS.description.min}–
          {SEO_LIMITS.description.max}. Hover a status to see why a page needs an update.
        </p>
      </div>

      {editing ? (
        <EditDialog
          page={editing}
          override={overrides.get(editing.path) ?? null}
          onClose={() => setEditing(null)}
          onSaved={(message) => afterSave(editing.path, message)}
        />
      ) : null}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: "ok" | "warn" }) {
  const color = tone === "warn" ? "text-[#8a5a00]" : tone === "ok" ? "text-[#1c7a3e]" : "text-[#0f1b33]";
  return (
    <div className="rounded-2xl border border-[#dfe5ef] bg-white px-5 py-4">
      <p className="text-sm text-[#5b6b85]">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function Counter({ value, min, max }: { value: string; min: number; max: number }) {
  const length = value.trim().length;
  const ok = length >= min && length <= max;
  return (
    <span className={`text-xs font-normal tabular-nums ${!length ? "text-[#5b6b85]" : ok ? "text-[#1c7a3e]" : "text-[#8a5a00]"}`}>
      {length} / {min}–{max}
    </span>
  );
}

function EditDialog({
  page,
  override,
  onClose,
  onSaved,
}: {
  page: PageMeta;
  override: SeoOverride | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [title, setTitle] = useState(override?.title ?? page.title);
  const [description, setDescription] = useState(override?.description ?? page.description);
  const [ogTitle, setOgTitle] = useState(override?.og_title ?? "");
  const [ogDescription, setOgDescription] = useState(override?.og_description ?? "");
  const [ogImage, setOgImage] = useState(override?.og_image ?? "");
  const [noindex, setNoindex] = useState(override?.noindex ?? false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const issues = metaIssues(title, description);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (ogImage.trim() && !/^https?:\/\//i.test(ogImage.trim())) {
      setError("The share image must be a full link starting with https://");
      return;
    }
    setBusy(true);
    setError(null);
    const clean = (value: string) => value.trim() || null;
    const { error: saveError } = await getSupabase()
      .from("seo_pages")
      .upsert({
        path: page.path,
        title: clean(title),
        description: clean(description),
        og_title: clean(ogTitle),
        og_description: clean(ogDescription),
        og_image: clean(ogImage),
        noindex,
      });
    if (saveError) {
      setBusy(false);
      setError(saveError.message);
      return;
    }
    const publishError = await publishSeoChanges();
    setBusy(false);
    onSaved(publishError ?? `Saved ${page.path}. The website shows the new tags from the next visit.`);
  }

  async function reset() {
    if (!override) return onClose();
    setBusy(true);
    setError(null);
    const { error: deleteError } = await getSupabase().from("seo_pages").delete().eq("path", page.path);
    if (deleteError) {
      setBusy(false);
      setError(deleteError.message);
      return;
    }
    const publishError = await publishSeoChanges();
    setBusy(false);
    onSaved(publishError ?? `${page.path} is back to its built-in title and description.`);
  }

  const previewTitle = title.trim() || page.title;
  const previewDescription = description.trim() || page.description;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={`Edit ${page.path}`}>
      <form onSubmit={save} className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#eef1f6] px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold">Edit meta tags</h2>
            <p className="truncate text-sm text-[#5b6b85]">{page.path}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 hover:bg-[#f1f4f9]">
            <XIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {error ? <p className="rounded-lg bg-[#fdecec] px-3 py-2 text-sm text-[#a12020]">{error}</p> : null}

          <div className="rounded-xl border border-[#e6ebf2] bg-[#fbfcfe] p-4">
            <p className="text-xs font-semibold tracking-wide text-[#5b6b85] uppercase">Google preview</p>
            <p className="mt-2 truncate text-xs text-[#1e6b34]">{pageUrl(page.path)}</p>
            <p className="mt-0.5 line-clamp-1 text-lg leading-6 text-[#1a0dab]">{previewTitle || "Page title"}</p>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#4d5156]">{previewDescription || "Page description"}</p>
          </div>

          <label className="block text-sm font-semibold">
            <span className="flex items-baseline justify-between gap-3">
              Title <Counter value={title} min={SEO_LIMITS.title.min} max={SEO_LIMITS.title.max} />
            </span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={SEO_LIMITS.title.hard} className={`${input} mt-1.5 font-normal`} />
          </label>

          <label className="block text-sm font-semibold">
            <span className="flex items-baseline justify-between gap-3">
              Meta description <Counter value={description} min={SEO_LIMITS.description.min} max={SEO_LIMITS.description.max} />
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={SEO_LIMITS.description.hard}
              rows={3}
              className={`${input} mt-1.5 font-normal`}
            />
          </label>

          {issues.length ? (
            <ul className="list-disc space-y-1 rounded-lg bg-[#fff8e6] py-2 pr-3 pl-7 text-sm text-[#8a5a00]">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}

          <fieldset className="space-y-4 rounded-xl border border-[#e6ebf2] p-4">
            <legend className="px-1 text-sm font-semibold">Share preview (WhatsApp, LinkedIn, Facebook)</legend>
            <p className="text-xs text-[#5b6b85]">Leave empty to use the title and description above.</p>
            <label className="block text-sm font-semibold">
              Share title
              <input value={ogTitle} onChange={(event) => setOgTitle(event.target.value)} maxLength={SEO_LIMITS.title.hard} placeholder={page.ogTitle || "Same as title"} className={`${input} mt-1.5 font-normal`} />
            </label>
            <label className="block text-sm font-semibold">
              Share description
              <textarea
                value={ogDescription}
                onChange={(event) => setOgDescription(event.target.value)}
                maxLength={SEO_LIMITS.description.hard}
                rows={2}
                placeholder={page.ogDescription || "Same as description"}
                className={`${input} mt-1.5 font-normal`}
              />
            </label>
            <label className="block text-sm font-semibold">
              Share image link
              <input
                value={ogImage}
                onChange={(event) => setOgImage(event.target.value)}
                maxLength={500}
                placeholder={page.ogImage || "https://aletindia.com/images/…"}
                className={`${input} mt-1.5 font-normal`}
              />
            </label>
          </fieldset>

          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={noindex} onChange={(event) => setNoindex(event.target.checked)} className="mt-0.5 h-4 w-4" />
            <span>
              <span className="font-semibold">Hide this page from Google</span>
              <span className="block text-[#5b6b85]">Use only for pages that should not appear in search results.</span>
            </span>
          </label>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-[#eef1f6] px-6 py-4">
          {override ? (
            <button type="button" onClick={reset} disabled={busy} className={`${button} mr-auto text-[#a12020] hover:bg-[#fdecec] disabled:opacity-60`}>
              Reset to built-in
            </button>
          ) : null}
          <button type="button" onClick={onClose} className={`${button} border border-[#d4dbe7] hover:border-[#b9c6db]`}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={`${button} bg-[#0b57d0] text-white hover:bg-[#0a4bb5] disabled:opacity-60`}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
