"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { Loader } from "@/components/admin/loader";
import { XIcon } from "@/components/admin/icons";
import { SITE_URL } from "@/lib/seo";
import { loadSitePages, publicUrl, siteHref } from "@/lib/seo-admin";
import { destinationProblem, normalizePath, sourceProblem, toSitePath, type SeoRedirect } from "@/lib/seo-redirects-shared";
import { getSupabase } from "@/lib/supabase-browser";

const input = "w-full rounded-lg border border-[#d4dbe7] px-3 py-2 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20";
const COLUMNS = "id,source,destination,status_code,enabled,note,updated_at";
const LIVE_NOTE = "Live on the website within a minute.";

type Draft = { id?: string; source: string; destination: string; status_code: 301 | 302; enabled: boolean; note: string };
const EMPTY: Draft = { source: "", destination: "", status_code: 301, enabled: true, note: "" };

const dateLabel = (value: string) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function Toggle({ checked, disabled, label, onChange }: { checked: boolean; disabled?: boolean; label: string; onChange: (value: boolean) => void }) {
  return (
    <label className={`inline-flex items-center ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
      <span className="sr-only">{label}</span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span className="relative h-6 w-11 rounded-full bg-[#cfd7e4] transition peer-checked:bg-[#1a63e8] peer-focus-visible:ring-2 peer-focus-visible:ring-[#1a63e8]/40 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
    </label>
  );
}

export function SeoRedirectsWorkspace() {
  const { profile } = useAdmin();
  const isAdmin = profile.role === "admin";
  const [rows, setRows] = useState<SeoRedirect[] | null>(null);
  const [sitePaths, setSitePaths] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data, error: loadError }, pages] = await Promise.all([
      getSupabase().from("seo_redirects").select(COLUMNS).order("updated_at", { ascending: false }),
      loadSitePages().catch(() => []),
    ]);
    if (loadError) setError(loadError.message);
    setRows((data as SeoRedirect[] | null) ?? []);
    setSitePaths(new Set(pages.map((page) => page.path)));
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    // Loading on open is the point of this screen; the state updates happen after the fetches resolve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [isAdmin, load]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (rows ?? []).filter((row) => !query || row.source.toLowerCase().includes(query) || row.destination.toLowerCase().includes(query) || row.note?.toLowerCase().includes(query));
  }, [rows, search]);

  const counts = useMemo(() => {
    const all = rows ?? [];
    return { total: all.length, active: all.filter((row) => row.enabled).length, permanent: all.filter((row) => row.status_code === 301).length };
  }, [rows]);

  const toggle = async (row: SeoRedirect, enabled: boolean) => {
    setBusyId(row.id);
    setError(null);
    setNotice(null);
    const { error: saveError } = await getSupabase().from("seo_redirects").update({ enabled }).eq("id", row.id);
    setBusyId(null);
    if (saveError) return setError(saveError.message);
    setRows((current) => current?.map((item) => (item.id === row.id ? { ...item, enabled } : item)) ?? null);
    setNotice(`${row.source} redirect is now ${enabled ? "on" : "off"}. ${LIVE_NOTE}`);
  };

  const remove = async (row: SeoRedirect) => {
    setBusyId(row.id);
    setError(null);
    setNotice(null);
    const { error: deleteError } = await getSupabase().from("seo_redirects").delete().eq("id", row.id);
    setBusyId(null);
    setConfirmDelete(null);
    if (deleteError) return setError(deleteError.message);
    setRows((current) => current?.filter((item) => item.id !== row.id) ?? null);
    setNotice(`Redirect from ${row.source} deleted. ${LIVE_NOTE}`);
  };

  if (!isAdmin) {
    return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins can manage SEO.</div>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">Redirects</h1>
          <p className="text-sm text-[#5b6b85]">Send visitors and Google from old or changed addresses to the right page</p>
        </div>
        <UserMenu />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        {error ? <p className="mb-4 rounded-xl border border-[#f3c2c2] bg-[#fdecec] p-4 text-sm text-[#a12020]">{error}</p> : null}
        {notice ? <p className="mb-4 rounded-xl border border-[#bfe5cc] bg-[#eaf7ef] p-4 text-sm text-[#1c7a3e]">{notice}</p> : null}

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Active", value: counts.active, note: "Redirecting visitors now" },
            { label: "Permanent (301)", value: counts.permanent, note: "Google moves the ranking to the new page" },
            { label: "Total", value: counts.total, note: "Including switched-off redirects" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[#dfe5ef] bg-white p-4">
              <p className="text-sm font-semibold text-[#5b6b85]">{stat.label}</p>
              <p className="mt-1 text-3xl font-extrabold">{rows ? stat.value : "–"}</p>
              <p className="text-xs text-[#5b6b85]">{stat.note}</p>
            </div>
          ))}
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#dfe5ef] bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#eef1f6] px-5 py-4">
            <h2 className="mr-auto font-bold">All redirects</h2>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search addresses" aria-label="Search redirects" className={input.replace("w-full", "w-56")} />
            <button type="button" onClick={() => setEditing({ ...EMPTY })} className="rounded-xl bg-[#1a63e8] px-4 py-2 text-sm font-semibold text-white">
              Add redirect
            </button>
          </div>

          {!rows ? <Loader /> : null}
          {rows && !rows.length ? (
            <div className="px-5 py-10 text-center">
              <p className="font-semibold">No redirects yet</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-[#5b6b85]">
                Add one when a page moves or is removed, so old links and Google results still reach the right place instead of a &quot;page not found&quot;.
              </p>
            </div>
          ) : null}

          {rows && rows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] text-left text-sm">
                <thead className="bg-[#f7f9fc] text-xs font-semibold tracking-wide text-[#5b6b85] uppercase">
                  <tr>
                    <th className="px-5 py-3">Old address</th>
                    <th className="px-3 py-3">New address</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">On</th>
                    <th className="px-3 py-3">Updated</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef1f6]">
                  {visible.map((row) => (
                    <tr key={row.id} className={row.enabled ? "" : "text-[#8a97ad]"}>
                      <td className="px-5 py-3">
                        <code className="font-semibold">{row.source}</code>
                        {row.note ? <span className="mt-0.5 block text-xs text-[#5b6b85]">{row.note}</span> : null}
                      </td>
                      <td className="max-w-[18rem] px-3 py-3">
                        <a
                          href={row.destination.startsWith("https://") ? row.destination : siteHref(row.destination)}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-[#0b57d0] hover:underline"
                        >
                          {row.destination}
                        </a>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${row.status_code === 301 ? "bg-[#e8f0fe] text-[#1a4fb4]" : "bg-[#fff3d9] text-[#8a5a00]"}`}>
                          {row.status_code === 301 ? "301 Permanent" : "302 Temporary"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Toggle checked={row.enabled} disabled={busyId === row.id} label={`Redirect from ${row.source} on`} onChange={(value) => void toggle(row, value)} />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-[#5b6b85]">{dateLabel(row.updated_at)}</td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        {confirmDelete === row.id ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#a12020]">Delete?</span>
                            <button type="button" disabled={busyId === row.id} onClick={() => void remove(row)} className="rounded-lg bg-[#c62828] px-3 py-1.5 text-sm font-semibold text-white">
                              Yes, delete
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-lg border border-[#d4dbe7] px-3 py-1.5 text-sm font-semibold">
                              No
                            </button>
                          </span>
                        ) : (
                          <span className="inline-flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditing({ id: row.id, source: row.source, destination: row.destination, status_code: row.status_code, enabled: row.enabled, note: row.note ?? "" })}
                              className="rounded-lg border border-[#d4dbe7] px-3 py-1.5 text-sm font-semibold hover:border-[#b9c6db]"
                            >
                              Edit
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(row.id)} className="rounded-lg border border-[#d4dbe7] px-3 py-1.5 text-sm font-semibold text-[#a12020] hover:border-[#e8b4b4]">
                              Delete
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!visible.length ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-[#5b6b85]">
                        No redirects match.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : null}

          <p className="border-t border-[#eef1f6] px-5 py-3 text-xs text-[#5b6b85]">
            Use 301 when a page has moved for good (Google passes its ranking to the new page). Use 302 only for short-term moves. Changes go live within a minute.
          </p>
        </section>
      </div>

      {editing ? (
        <RedirectDialog
          draft={editing}
          rows={rows ?? []}
          sitePaths={sitePaths}
          onClose={() => setEditing(null)}
          onSaved={(row, created) => {
            setRows((current) => (created ? [row, ...(current ?? [])] : current?.map((item) => (item.id === row.id ? row : item)) ?? [row]));
            setEditing(null);
            setError(null);
            setNotice(`Redirect from ${row.source} ${created ? "added" : "saved"}. ${LIVE_NOTE}`);
          }}
        />
      ) : null}
    </div>
  );
}

function RedirectDialog({
  draft,
  rows,
  sitePaths,
  onClose,
  onSaved,
}: {
  draft: Draft;
  rows: SeoRedirect[];
  sitePaths: Set<string>;
  onClose: () => void;
  onSaved: (row: SeoRedirect, created: boolean) => void;
}) {
  const [form, setForm] = useState<Draft>(draft);
  const [problem, setProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const source = normalizePath(toSitePath(form.source, SITE_URL));
  const destination = toSitePath(form.destination, SITE_URL).trim();
  const destinationPath = destination.startsWith("/") ? normalizePath(destination.split(/[?#]/)[0]) : null;
  const others = rows.filter((row) => row.id !== form.id);

  const warnings: string[] = [];
  if (source && sitePaths.has(source)) warnings.push(`${source} is a live page on the website. Visitors will no longer be able to open it.`);
  if (destinationPath && others.some((row) => row.enabled && normalizePath(row.source) === destinationPath)) {
    warnings.push("The new address is itself redirected somewhere else. Point straight to the final page to avoid a chain.");
  }
  if (destinationPath && !sitePaths.has(destinationPath) && !destinationPath.startsWith("/images") && !others.some((row) => normalizePath(row.source) === destinationPath)) {
    warnings.push(`${destinationPath} is not one of the website's pages. Open it to check it works before saving.`);
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const issue =
      sourceProblem(source) ??
      destinationProblem(destination, source) ??
      (others.some((row) => normalizePath(row.source) === source) ? "There is already a redirect from this address. Edit that one instead." : null) ??
      (form.note.length > 200 ? "Keep the note under 200 characters." : null);
    if (issue) return setProblem(issue);
    setSaving(true);
    setProblem(null);
    const values = { source, destination, status_code: form.status_code, enabled: form.enabled, note: form.note.trim() || null };
    const query = form.id
      ? getSupabase().from("seo_redirects").update(values).eq("id", form.id).select(COLUMNS).single()
      : getSupabase().from("seo_redirects").insert(values).select(COLUMNS).single();
    const { data, error } = await query;
    setSaving(false);
    if (error) return setProblem(error.code === "23505" ? "There is already a redirect from this address." : error.message);
    onSaved(data as SeoRedirect, !form.id);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f1b33]/45 p-4" role="dialog" aria-modal="true" aria-labelledby="redirect-title">
      <form onSubmit={submit} className="flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center gap-3 border-b border-[#eef1f6] px-5 py-4">
          <h2 id="redirect-title" className="mr-auto text-lg font-bold">
            {form.id ? "Edit redirect" : "Add redirect"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-[#5b6b85] hover:bg-[#f2f5fa]">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <label className="block">
            <span className="text-sm font-semibold">Old address</span>
            <input value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} placeholder="/old-page" className={`${input} mt-1`} autoFocus />
            <span className="mt-1 block text-xs text-[#5b6b85]">The path people or Google still visit, e.g. /default.php. You can paste the full link.</span>
          </label>
          <label className="block">
            <span className="text-sm font-semibold">New address</span>
            <input value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} placeholder="/new-page" className={`${input} mt-1`} />
            <span className="mt-1 block text-xs text-[#5b6b85]">A page on this site (/contact-us) or a full https:// link.</span>
          </label>

          <fieldset>
            <legend className="text-sm font-semibold">Type</legend>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              {([
                [301, "Permanent (301)", "The page has moved for good"],
                [302, "Temporary (302)", "Short-term, the old page comes back"],
              ] as const).map(([code, label, hint]) => (
                <label key={code} className={`cursor-pointer rounded-xl border p-3 text-sm ${form.status_code === code ? "border-[#1a63e8] bg-[#f4f8ff]" : "border-[#d4dbe7]"}`}>
                  <input type="radio" name="status" checked={form.status_code === code} onChange={() => setForm({ ...form, status_code: code })} className="sr-only" />
                  <span className="block font-semibold">{label}</span>
                  <span className="block text-xs text-[#5b6b85]">{hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-semibold">Note (optional)</span>
            <input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} maxLength={200} placeholder="Why this redirect exists" className={`${input} mt-1`} />
          </label>

          <label className="flex items-center gap-3 text-sm">
            <Toggle checked={form.enabled} label="Redirect on" onChange={(value) => setForm({ ...form, enabled: value })} />
            <span>{form.enabled ? "On: visitors are redirected" : "Off: saved but not used"}</span>
          </label>

          {source && destination && !sourceProblem(source) && !destinationProblem(destination, source) ? (
            <p className="rounded-xl bg-[#f7f9fc] p-3 text-xs break-all text-[#5b6b85]">
              {publicUrl(source)} → {destination.startsWith("https://") ? destination : publicUrl(destination)}
            </p>
          ) : null}
          {warnings.map((warning) => (
            <p key={warning} className="rounded-xl border border-[#f1d9a6] bg-[#fff8e8] p-3 text-sm text-[#8a5a00]">
              {warning}
            </p>
          ))}
          {problem ? <p className="rounded-xl border border-[#f3c2c2] bg-[#fdecec] p-3 text-sm text-[#a12020]">{problem}</p> : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-[#eef1f6] px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-[#d4dbe7] px-4 py-2.5 text-sm font-semibold">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#1a63e8] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? "Saving…" : form.id ? "Save redirect" : "Add redirect"}
          </button>
        </div>
      </form>
    </div>
  );
}
