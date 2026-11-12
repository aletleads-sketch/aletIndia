"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { Loader } from "@/components/admin/loader";
import { StatTile } from "@/components/admin/seo-charts";
import { SyncBar } from "@/components/admin/seo-google-connection";
import { siteHref } from "@/lib/seo-admin";
import { downloadCsv, loadQuerySummary, number, pageLabel, periods, RANGES, type QuerySummary } from "@/lib/seo-google";
import { BASE_PATH } from "@/lib/site-path";
import { getSupabase } from "@/lib/supabase-browser";

type Keyword = { id: string; keyword: string; tags: string[]; created_at: string };
type Row = Keyword & { now: QuerySummary | null; before: QuerySummary | null };

const input = "w-full rounded-lg border border-[#d4dbe7] px-3 py-2 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20";
const clean = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

/** Position change: positive = moved up in Google (a smaller number). */
const moved = (row: Row) => (row.now?.position != null && row.before?.position != null ? row.before.position - row.now.position : null);

/** A site path from Google as a link through this admin's origin. */
const pageHref = (page: string) => siteHref(BASE_PATH && page.startsWith(BASE_PATH) ? page.slice(BASE_PATH.length) || "/" : page);

export function SeoKeywordsWorkspace() {
  const { profile } = useAdmin();
  const isAdmin = profile.role === "admin";
  const [days, setDays] = useState(28);
  const [keywords, setKeywords] = useState<Keyword[] | null>(null);
  const [now, setNow] = useState<Map<string, QuerySummary>>(new Map());
  const [before, setBefore] = useState<Map<string, QuerySummary>>(new Map());
  const [untracked, setUntracked] = useState<QuerySummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ words: "", tags: "" });
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");

  const load = useCallback(async () => {
    const range = periods(days);
    try {
      const { data, error: listError } = await getSupabase().from("seo_keywords").select("id,keyword,tags,created_at").order("keyword");
      if (listError) throw new Error(listError.message);
      const list = (data ?? []) as Keyword[];
      const words = list.map((item) => item.keyword);
      const [current, previous, top] = await Promise.all([
        words.length ? loadQuerySummary(range.from, range.to, words, 5000) : Promise.resolve([]),
        words.length ? loadQuerySummary(range.prevFrom, range.prevTo, words, 5000) : Promise.resolve([]),
        loadQuerySummary(range.from, range.to, undefined, 40),
      ]);
      const tracked = new Set(words);
      setKeywords(list);
      setNow(new Map(current.map((row) => [row.query, row])));
      setBefore(new Map(previous.map((row) => [row.query, row])));
      setUntracked(top.filter((row) => !tracked.has(row.query)).slice(0, 10));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load keywords.");
      setKeywords((current) => current ?? []);
    }
  }, [days]);

  useEffect(() => {
    if (!isAdmin) return;
    // Loading on open (and when the range changes) is the point of this screen.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [isAdmin, load]);

  const rows: Row[] = useMemo(
    () => (keywords ?? []).map((item) => ({ ...item, now: now.get(item.keyword) ?? null, before: before.get(item.keyword) ?? null })),
    [keywords, now, before],
  );
  const allTags = useMemo(() => [...new Set(rows.flatMap((row) => row.tags))].sort(), [rows]);
  const shown = rows
    .filter((row) => (!tag || row.tags.includes(tag)) && (!search || row.keyword.includes(clean(search))))
    .sort((a, b) => (a.now?.position ?? 999) - (b.now?.position ?? 999) || a.keyword.localeCompare(b.keyword));

  if (!isAdmin) return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins can manage SEO.</div>;

  const add = async (words: string[], tags: string[]) => {
    const fresh = [...new Set(words.map(clean).filter(Boolean))].filter((word) => word.length <= 200 && !keywords?.some((item) => item.keyword === word));
    if (!fresh.length) return setError("Those keywords are already tracked.");
    setAdding(true);
    const { error: addError } = await getSupabase()
      .from("seo_keywords")
      .insert(fresh.map((keyword) => ({ keyword, tags })));
    setAdding(false);
    if (addError) return setError(addError.message);
    setDraft({ words: "", tags: "" });
    await load();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const tags = [...new Set(draft.tags.split(",").map(clean).filter(Boolean))].slice(0, 10);
    void add(draft.words.split(/\n|,/), tags);
  };

  const remove = async (row: Row) => {
    const { error: removeError } = await getSupabase().from("seo_keywords").delete().eq("id", row.id);
    if (removeError) return setError(removeError.message);
    setKeywords((current) => (current ?? []).filter((item) => item.id !== row.id));
  };

  const ranked = rows.filter((row) => row.now?.position != null);
  const top3 = ranked.filter((row) => row.now!.position! <= 3.5).length;
  const top10 = ranked.filter((row) => row.now!.position! <= 10.5).length;
  const average = ranked.length ? ranked.reduce((total, row) => total + row.now!.position!, 0) / ranked.length : null;

  const exportCsv = () =>
    downloadCsv(
      `keywords-last-${days}-days.csv`,
      ["Keyword", "Tags", "Position", "Change", "Clicks", "Impressions", "Ranking page"],
      shown.map((row) => [row.keyword, row.tags.join(" "), row.now?.position ?? null, moved(row), row.now?.clicks ?? 0, row.now?.impressions ?? 0, row.now?.page ? pageLabel(row.now.page) : null]),
    );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">Keywords Tracking</h1>
          <p className="text-sm text-[#5b6b85]">Where the website shows in Google for the searches you care about</p>
        </div>
        <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-lg border border-[#d4dbe7] bg-white px-3 py-2 text-sm font-semibold" aria-label="Date range">
          {RANGES.slice(0, 3).map((range) => (
            <option key={range.days} value={range.days}>
              {range.label}
            </option>
          ))}
        </select>
        <UserMenu />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        <SyncBar onSynced={() => void load()} />
        {error ? <p className="mb-4 rounded-xl border border-[#f3c2c2] bg-[#fdecec] p-4 text-sm text-[#a12020]">{error}</p> : null}
        {!keywords ? (
          <Loader />
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile label="Tracked keywords" value={number(rows.length)} delta={null} hint={`${ranked.length} showing in Google`} />
              <StatTile label="In top 3" value={number(top3)} delta={null} hint="Positions 1 to 3" />
              <StatTile label="In top 10" value={number(top10)} delta={null} hint="First page of Google" />
              <StatTile label="Avg. position" value={average === null ? "—" : average.toFixed(1)} delta={null} hint="Of the keywords showing in Google" />
            </div>

            <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-[#dfe5ef] bg-white p-5 md:grid-cols-[minmax(0,1fr)_14rem_auto] md:items-end">
              <label className="block">
                <span className="text-sm font-semibold">Add keywords</span>
                <textarea value={draft.words} onChange={(event) => setDraft({ ...draft, words: event.target.value })} rows={2} placeholder={"web development company in lucknow\nsalesforce consulting india"} className={`${input} mt-1 resize-y`} />
                <span className="mt-1 block text-xs text-[#5b6b85]">One per line. Use the words people type in Google.</span>
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Tags (optional)</span>
                <input value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} placeholder="services, brand" className={`${input} mt-1`} />
                <span className="mt-1 block text-xs text-[#5b6b85]">Comma separated</span>
              </label>
              <button type="submit" disabled={adding || !draft.words.trim()} className="rounded-xl bg-[#1a63e8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 md:mb-6">
                {adding ? "Adding…" : "Add"}
              </button>
            </form>

            <section className="rounded-2xl border border-[#dfe5ef] bg-white">
              <div className="flex flex-wrap items-center gap-3 border-b border-[#eef1f6] px-5 py-3">
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search keywords" className={`${input} max-w-64`} aria-label="Search keywords" />
                {allTags.length ? (
                  <select value={tag} onChange={(event) => setTag(event.target.value)} className="rounded-lg border border-[#d4dbe7] bg-white px-3 py-2 text-sm" aria-label="Filter by tag">
                    <option value="">All tags</option>
                    {allTags.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                ) : null}
                <button type="button" onClick={exportCsv} disabled={!shown.length} className="ml-auto rounded-lg border border-[#d4dbe7] px-3 py-2 text-sm font-semibold disabled:opacity-40">
                  Export CSV
                </button>
              </div>
              {shown.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="bg-[#f7f9fc] text-left text-xs tracking-wide text-[#5b6b85] uppercase">
                      <tr>
                        <th className="px-5 py-2.5 font-semibold">Keyword</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Position</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Change</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Clicks</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Impressions</th>
                        <th className="px-3 py-2.5 font-semibold">Ranking page</th>
                        <th className="px-5 py-2.5" aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((row) => {
                        const delta = moved(row);
                        return (
                          <tr key={row.id} className="border-t border-[#eef1f6]">
                            <td className="px-5 py-2.5">
                              <span className="font-semibold">{row.keyword}</span>
                              {row.tags.map((item) => (
                                <span key={item} className="ml-2 rounded-full bg-[#eef2f8] px-2 py-0.5 text-[11px] text-[#4a5a75]">
                                  {item}
                                </span>
                              ))}
                            </td>
                            <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{row.now?.position != null ? row.now.position.toFixed(1) : <span className="font-normal text-[#8a97ad]">Not in Google yet</span>}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">
                              {delta === null || Math.abs(delta) < 0.05 ? (
                                <span className="text-[#8a97ad]">—</span>
                              ) : (
                                <span className={delta > 0 ? "font-semibold text-[#1c7a3e]" : "font-semibold text-[#a12020]"}>
                                  {delta > 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums">{number(row.now?.clicks ?? 0)}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">{number(row.now?.impressions ?? 0)}</td>
                            <td className="max-w-56 truncate px-3 py-2.5">
                              {row.now?.page ? (
                                <a href={pageHref(row.now.page)} target="_blank" rel="noreferrer" className="text-[#0b57d0] hover:underline">
                                  {pageLabel(row.now.page)}
                                </a>
                              ) : (
                                <span className="text-[#8a97ad]">—</span>
                              )}
                            </td>
                            <td className="px-5 py-2.5 text-right">
                              <button type="button" onClick={() => void remove(row)} className="text-xs font-semibold text-[#a12020] hover:underline">
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-5 py-10 text-center text-sm text-[#5b6b85]">{rows.length ? "No keywords match." : "No keywords tracked yet. Add the searches you want to follow above."}</p>
              )}
              <p className="border-t border-[#eef1f6] px-5 py-3 text-xs text-[#5b6b85]">
                Positions are Google&apos;s average for the period, from Search Console. Google only reports searches where the website already appears, so a new keyword shows &quot;Not in Google yet&quot; until it does. Monthly search volume needs a paid keyword tool and is not shown.
              </p>
            </section>

            {untracked.length ? (
              <section className="rounded-2xl border border-[#dfe5ef] bg-white p-5">
                <h2 className="font-bold">Searches already bringing people that you do not track</h2>
                <ul className="mt-3 divide-y divide-[#eef1f6] text-sm">
                  {untracked.map((row) => (
                    <li key={row.query} className="flex flex-wrap items-center gap-3 py-2">
                      <span className="mr-auto font-semibold">{row.query}</span>
                      <span className="text-[#5b6b85] tabular-nums">
                        {number(row.clicks)} {row.clicks === 1 ? "click" : "clicks"} · {number(row.impressions)} {row.impressions === 1 ? "impression" : "impressions"} · position {row.position?.toFixed(1) ?? "—"}
                      </span>
                      <button type="button" onClick={() => void add([row.query], [])} className="rounded-lg border border-[#d4dbe7] px-2.5 py-1 text-xs font-semibold">
                        Track
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
