"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { Loader } from "@/components/admin/loader";
import { XIcon } from "@/components/admin/icons";
import { loadOverrides, loadSeoSetting, loadSitePages, publicUrl, publishSeoChanges, saveSeoSetting, siteHref } from "@/lib/seo-admin";
import {
  applySitemapChoice,
  CHANGE_FREQUENCIES,
  cleanDisallow,
  PRIORITIES,
  ROBOTS_BUILT_IN_DISALLOW,
  robotsPathProblem,
  robotsText,
  type ChangeFrequency,
  type RobotsSettings,
  type SitemapPageChoice,
  type SitemapSettings,
  type SitePage,
  type SitePageKind,
} from "@/lib/seo-sitemap-shared";

const input = "rounded-lg border border-[#d4dbe7] px-3 py-2 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20";
const select = "rounded-lg border border-[#d4dbe7] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20 disabled:opacity-50";
const KINDS: ("All" | SitePageKind)[] = ["All", "Page", "Service", "Case study", "Blog"];
const FREQUENCY_LABEL: Record<ChangeFrequency, string> = {
  always: "Always",
  hourly: "Hourly",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  never: "Never",
};

type Choices = Record<string, SitemapPageChoice>;

/** Keeps only what differs from the page's built-in values, so "no choice" stays the default. */
function tidy(pages: SitePage[], choices: Choices): Choices {
  const result: Choices = {};
  for (const page of pages) {
    const choice = choices[page.path];
    if (!choice) continue;
    const kept: SitemapPageChoice = {};
    if (choice.exclude) kept.exclude = true;
    if (typeof choice.priority === "number" && choice.priority !== page.priority) kept.priority = choice.priority;
    if (choice.changeFrequency && choice.changeFrequency !== page.changeFrequency) kept.changeFrequency = choice.changeFrequency;
    if (Object.keys(kept).length) result[page.path] = kept;
  }
  return result;
}

function Toggle({ checked, disabled, label, onChange }: { checked: boolean; disabled?: boolean; label: string; onChange: (value: boolean) => void }) {
  return (
    <label className={`inline-flex items-center ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
      <span className="sr-only">{label}</span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span className="relative h-6 w-11 rounded-full bg-[#cfd7e4] transition peer-checked:bg-[#1a63e8] peer-focus-visible:ring-2 peer-focus-visible:ring-[#1a63e8]/40 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
    </label>
  );
}

export function SeoSitemapWorkspace() {
  const { profile } = useAdmin();
  const isAdmin = profile.role === "admin";
  const [pages, setPages] = useState<SitePage[] | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Choices>({});
  const [draft, setDraft] = useState<Choices>({});
  const [savedDisallow, setSavedDisallow] = useState<string[]>([]);
  const [disallow, setDisallow] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"sitemap" | "robots" | null>(null);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("All");
  const [newPath, setNewPath] = useState("");
  const [pathError, setPathError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [sitePages, overrides, sitemap, robots] = await Promise.all([
        loadSitePages(),
        loadOverrides(),
        loadSeoSetting<SitemapSettings>("sitemap"),
        loadSeoSetting<RobotsSettings>("robots"),
      ]);
      const problem = overrides.error ?? sitemap.error ?? robots.error;
      if (problem) setError(problem);
      setPages(sitePages);
      setHidden(new Set(overrides.rows.filter((row) => row.noindex).map((row) => row.path)));
      const choices = tidy(sitePages, sitemap.value.pages ?? {});
      setSaved(choices);
      setDraft(choices);
      const paths = cleanDisallow(robots.value.disallow);
      setSavedDisallow(paths);
      setDisallow(paths);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load the pages.");
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    // Loading on open is the point of this screen; the state updates happen after the fetches resolve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [isAdmin, load]);

  const tidyDraft = useMemo(() => (pages ? tidy(pages, draft) : {}), [pages, draft]);
  const changedPaths = useMemo(() => {
    const paths = new Set([...Object.keys(tidyDraft), ...Object.keys(saved)]);
    return [...paths].filter((path) => JSON.stringify(tidyDraft[path] ?? {}) !== JSON.stringify(saved[path] ?? {}));
  }, [tidyDraft, saved]);
  const robotsChanged = JSON.stringify(disallow) !== JSON.stringify(savedDisallow);

  const counts = useMemo(() => {
    if (!pages) return { listed: 0, leftOut: 0, hidden: 0 };
    const listed = pages.filter((page) => applySitemapChoice(page, tidyDraft[page.path], hidden.has(page.path))).length;
    const hiddenCount = pages.filter((page) => hidden.has(page.path)).length;
    return { listed, hidden: hiddenCount, leftOut: pages.length - listed - hiddenCount };
  }, [pages, tidyDraft, hidden]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (pages ?? []).filter((page) => (kind === "All" || page.kind === kind) && (!query || page.path.toLowerCase().includes(query)));
  }, [pages, kind, search]);

  const update = (path: string, patch: SitemapPageChoice) => {
    setNotice(null);
    setDraft((current) => ({ ...current, [path]: { ...current[path], ...patch } }));
  };

  const saveSitemap = async () => {
    setBusy("sitemap");
    setError(null);
    setNotice(null);
    const saveError = await saveSeoSetting("sitemap", { pages: tidyDraft });
    if (saveError) {
      setBusy(null);
      setError(saveError);
      return;
    }
    setSaved(tidyDraft);
    setDraft(tidyDraft);
    const publishError = await publishSeoChanges();
    setBusy(null);
    setNotice(publishError ?? "Sitemap saved. Google will see the new list the next time it reads sitemap.xml.");
  };

  const saveRobots = async (paths: string[]) => {
    setBusy("robots");
    setError(null);
    setNotice(null);
    const saveError = await saveSeoSetting("robots", { disallow: paths });
    if (saveError) {
      setBusy(null);
      setError(saveError);
      return;
    }
    setSavedDisallow(paths);
    setDisallow(paths);
    const publishError = await publishSeoChanges();
    setBusy(null);
    setNotice(publishError ?? "robots.txt saved.");
  };

  const addPath = (event: FormEvent) => {
    event.preventDefault();
    const path = newPath.trim();
    const problem = robotsPathProblem(path);
    if (problem) return setPathError(`This path ${problem}.`);
    if (ROBOTS_BUILT_IN_DISALLOW.includes(path) || disallow.includes(path)) return setPathError("This path is already blocked.");
    if (disallow.length >= 50) return setPathError("You can block up to 50 paths.");
    setPathError(null);
    setNewPath("");
    setDisallow([...disallow, path]);
  };

  if (!isAdmin) {
    return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins can manage SEO.</div>;
  }

  const sitemapUrl = publicUrl("/sitemap.xml");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">Sitemap &amp; Robots</h1>
          <p className="text-sm text-[#5b6b85]">Choose which pages Google is told about, and which paths it should not visit</p>
        </div>
        <UserMenu />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        {error ? <p className="mb-4 rounded-xl border border-[#f3c2c2] bg-[#fdecec] p-4 text-sm text-[#a12020]">{error}</p> : null}
        {notice ? <p className="mb-4 rounded-xl border border-[#bfe5cc] bg-[#eaf7ef] p-4 text-sm text-[#1c7a3e]">{notice}</p> : null}
        {!pages && !error ? <Loader /> : null}

        {pages ? (
          <>
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "In sitemap", value: counts.listed, note: "Pages Google is told about" },
                { label: "Left out", value: counts.leftOut, note: "Switched off on this screen" },
                { label: "Hidden from Google", value: counts.hidden, note: "Marked in Meta Tags" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-[#dfe5ef] bg-white p-4">
                  <p className="text-sm font-semibold text-[#5b6b85]">{stat.label}</p>
                  <p className="mt-1 text-3xl font-extrabold">{stat.value}</p>
                  <p className="text-xs text-[#5b6b85]">{stat.note}</p>
                </div>
              ))}
            </div>

            <section className="mb-5 overflow-hidden rounded-2xl border border-[#dfe5ef] bg-white">
              <div className="flex flex-wrap items-center gap-3 border-b border-[#eef1f6] px-5 py-4">
                <h2 className="mr-auto font-bold">Sitemap pages</h2>
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search pages" aria-label="Search pages" className={`${input} w-48`} />
                <select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} aria-label="Page type" className={select}>
                  {KINDS.map((item) => (
                    <option key={item} value={item}>
                      {item === "All" ? "All types" : item}
                    </option>
                  ))}
                </select>
                <a href={siteHref("/sitemap.xml")} target="_blank" rel="noreferrer" className="rounded-lg border border-[#d4dbe7] px-3 py-1.5 text-sm font-semibold hover:border-[#b9c6db]">
                  View sitemap.xml
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[46rem] text-left text-sm">
                  <thead className="bg-[#f7f9fc] text-xs font-semibold tracking-wide text-[#5b6b85] uppercase">
                    <tr>
                      <th className="px-5 py-3">Page</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">In sitemap</th>
                      <th className="px-3 py-3">Priority</th>
                      <th className="px-3 py-3">Updates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef1f6]">
                    {visible.map((page) => {
                      const choice = draft[page.path] ?? {};
                      const isHidden = hidden.has(page.path);
                      const included = !isHidden && !choice.exclude;
                      const changed = changedPaths.includes(page.path);
                      return (
                        <tr key={page.path} className={changed ? "bg-[#fff9e8]" : ""}>
                          <td className="px-5 py-2.5">
                            <a href={siteHref(page.path)} target="_blank" rel="noreferrer" className="font-semibold text-[#0b57d0] hover:underline">
                              {page.path}
                            </a>
                            {isHidden ? <span className="ml-2 rounded-full bg-[#eef2f8] px-2 py-0.5 text-xs font-semibold text-[#5b6b85]">Hidden in Meta Tags</span> : null}
                          </td>
                          <td className="px-3 py-2.5 text-[#5b6b85]">{page.kind}</td>
                          <td className="px-3 py-2.5">
                            <Toggle checked={included} disabled={isHidden || busy === "sitemap"} label={`${page.path} in sitemap`} onChange={(value) => update(page.path, { exclude: !value })} />
                          </td>
                          <td className="px-3 py-2.5">
                            <select
                              value={choice.priority ?? page.priority}
                              disabled={!included || busy === "sitemap"}
                              onChange={(event) => update(page.path, { priority: Number(event.target.value) })}
                              aria-label={`${page.path} priority`}
                              className={select}
                            >
                              {PRIORITIES.map((value) => (
                                <option key={value} value={value}>
                                  {value.toFixed(1)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2.5">
                            <select
                              value={choice.changeFrequency ?? page.changeFrequency}
                              disabled={!included || busy === "sitemap"}
                              onChange={(event) => update(page.path, { changeFrequency: event.target.value as ChangeFrequency })}
                              aria-label={`${page.path} update frequency`}
                              className={select}
                            >
                              {CHANGE_FREQUENCIES.map((value) => (
                                <option key={value} value={value}>
                                  {FREQUENCY_LABEL[value]}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                    {!visible.length ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-[#5b6b85]">
                          No pages match.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-[#eef1f6] px-5 py-3">
                <p className="mr-auto text-xs text-[#5b6b85]">
                  New blogs, services and case studies are added automatically. Priority tells Google which pages matter most (1.0 is highest).
                </p>
                {changedPaths.length ? <span className="text-sm font-semibold text-[#8a5a00]">{changedPaths.length} unsaved {changedPaths.length === 1 ? "change" : "changes"}</span> : null}
                <button type="button" disabled={!changedPaths.length || busy !== null} onClick={() => setDraft(saved)} className="rounded-xl border border-[#d4dbe7] px-4 py-2 text-sm font-semibold disabled:opacity-40">
                  Discard
                </button>
                <button type="button" disabled={!changedPaths.length || busy !== null} onClick={() => void saveSitemap()} className="rounded-xl bg-[#1a63e8] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
                  {busy === "sitemap" ? "Saving…" : "Save sitemap"}
                </button>
              </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <section className="rounded-2xl border border-[#dfe5ef] bg-white">
                <div className="border-b border-[#eef1f6] px-5 py-4">
                  <h2 className="font-bold">Paths Google should not visit</h2>
                  <p className="mt-1 text-sm text-[#5b6b85]">For pages that should stay out of search, prefer &quot;Hide from Google&quot; in Meta Tags. Use this for whole folders or files.</p>
                </div>
                <ul className="divide-y divide-[#eef1f6]">
                  {ROBOTS_BUILT_IN_DISALLOW.map((path) => (
                    <li key={path} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                      <code className="mr-auto font-semibold">{path}</code>
                      <span className="text-xs text-[#5b6b85]">Always blocked (admin panel)</span>
                    </li>
                  ))}
                  {disallow.map((path) => (
                    <li key={path} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                      <code className="mr-auto font-semibold">{path}</code>
                      <button
                        type="button"
                        onClick={() => setDisallow(disallow.filter((item) => item !== path))}
                        disabled={busy !== null}
                        aria-label={`Remove ${path}`}
                        className="rounded-lg p-1.5 text-[#5b6b85] hover:bg-[#f2f5fa] hover:text-[#a12020]"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={addPath} className="border-t border-[#eef1f6] px-5 py-4">
                  <div className="flex gap-2">
                    <input
                      value={newPath}
                      onChange={(event) => {
                        setNewPath(event.target.value);
                        setPathError(null);
                      }}
                      placeholder="/old-folder/"
                      aria-label="Path to block"
                      className={`${input} min-w-0 flex-1`}
                    />
                    <button type="submit" className="rounded-xl border border-[#d4dbe7] px-4 py-2 text-sm font-semibold hover:border-[#b9c6db]">
                      Add
                    </button>
                  </div>
                  {pathError ? <p className="mt-2 text-sm text-[#a12020]">{pathError}</p> : null}
                  <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                    {robotsChanged ? <span className="mr-auto text-sm font-semibold text-[#8a5a00]">Unsaved changes</span> : null}
                    <button type="button" disabled={!robotsChanged || busy !== null} onClick={() => setDisallow(savedDisallow)} className="rounded-xl border border-[#d4dbe7] px-4 py-2 text-sm font-semibold disabled:opacity-40">
                      Discard
                    </button>
                    <button type="button" disabled={!robotsChanged || busy !== null} onClick={() => void saveRobots(disallow)} className="rounded-xl bg-[#1a63e8] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
                      {busy === "robots" ? "Saving…" : "Save robots.txt"}
                    </button>
                  </div>
                </form>
              </section>

              <section className="flex min-w-0 flex-col rounded-2xl border border-[#dfe5ef] bg-white">
                <div className="flex flex-wrap items-center gap-3 border-b border-[#eef1f6] px-5 py-4">
                  <h2 className="mr-auto font-bold">robots.txt preview</h2>
                  <a href={siteHref("/robots.txt")} target="_blank" rel="noreferrer" className="rounded-lg border border-[#d4dbe7] px-3 py-1.5 text-sm font-semibold hover:border-[#b9c6db]">
                    Open
                  </a>
                </div>
                <pre className="min-h-0 flex-1 overflow-auto bg-[#0f1b33] p-5 text-xs leading-5 text-[#d9e4ff]">{robotsText(disallow, sitemapUrl, false)}</pre>
                <p className="border-t border-[#eef1f6] px-5 py-3 text-xs text-[#5b6b85]">
                  Google only reads robots.txt at the root of the domain. Check that{" "}
                  <a href={publicUrl("/robots.txt")} target="_blank" rel="noreferrer" className="font-semibold text-[#0b57d0] hover:underline">
                    {publicUrl("/robots.txt")}
                  </a>{" "}
                  shows the rules above.
                </p>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
