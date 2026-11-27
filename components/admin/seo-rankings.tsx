"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { Loader } from "@/components/admin/loader";
import { CHART_BLUE, EmptyChart, LineChart, StatTile } from "@/components/admin/seo-charts";
import { SyncBar } from "@/components/admin/seo-google-connection";
import { siteHref } from "@/lib/seo-admin";
import { addDays, downloadCsv, eachDay, number, pageLabel, periods, RANGES, shortDay } from "@/lib/seo-google";
import { BASE_PATH } from "@/lib/site-path";
import { getSupabase } from "@/lib/supabase-browser";

type Keyword = { keyword: string; tags: string[] };
type DailyRow = { day: string; query: string; page: string; clicks: number; impressions: number; position: number | null };
/** One keyword's Google position per day (impression-weighted across the pages that showed for it). */
type Series = Map<string, number>;
type Ranked = {
  keyword: string;
  tags: string[];
  series: Series;
  latest: number | null;
  latestDay: string | null;
  weekAgo: number | null;
  first: number | null;
  best: number | null;
  clicks: number;
  impressions: number;
  page: string | null;
};

const BANDS = [
  { key: "top3", label: "Top 3", hint: "Positions 1-3", max: 3.5, color: "#1c7a3e", bg: "#e3f4e8" },
  { key: "page1", label: "Page 1", hint: "Positions 4-10", max: 10.5, color: "#1a63e8", bg: "#e6efff" },
  { key: "page2", label: "Page 2", hint: "Positions 11-20", max: 20.5, color: "#a15c00", bg: "#fff1dc" },
  { key: "beyond", label: "Beyond page 2", hint: "Position 21+", max: Infinity, color: "#a12020", bg: "#fdecec" },
] as const;
const band = (position: number | null) => (position === null ? null : BANDS.find((item) => position <= item.max) ?? BANDS[3]);

const fmt = (value: number) => (Number.isFinite(value) ? value.toFixed(1) : "—");
/** Position change: positive = moved up in Google (a smaller number). */
const gain = (from: number | null, to: number | null) => (from === null || to === null ? null : from - to);
const pageHref = (page: string) => siteHref(BASE_PATH && page.startsWith(BASE_PATH) ? page.slice(BASE_PATH.length) || "/" : page);

/** Reads the tracked keywords' daily Search Console rows for the range (admins only, by row-level security). */
async function loadDaily(words: string[], from: string, to: string) {
  const rows: DailyRow[] = [];
  const pageSize = 1000;
  for (let start = 0; ; start += pageSize) {
    const { data, error } = await getSupabase()
      .from("seo_query_daily")
      .select("day,query,page,clicks,impressions,position")
      .in("query", words)
      .gte("day", from)
      .lte("day", to)
      .order("day")
      .range(start, start + pageSize - 1);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as DailyRow[]).map((row) => ({ ...row, clicks: Number(row.clicks), impressions: Number(row.impressions), position: row.position === null ? null : Number(row.position) })));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

/** Folds the rows into one weighted position per keyword per day, plus totals and the page that showed most. */
function rank(keywords: Keyword[], rows: DailyRow[], to: string): Ranked[] {
  const byWord = new Map<string, DailyRow[]>();
  for (const row of rows) byWord.set(row.query, [...(byWord.get(row.query) ?? []), row]);
  return keywords.map(({ keyword, tags }) => {
    const list = byWord.get(keyword) ?? [];
    const perDay = new Map<string, { weighted: number; impressions: number }>();
    const perPage = new Map<string, number>();
    let clicks = 0;
    let impressions = 0;
    for (const row of list) {
      clicks += row.clicks;
      impressions += row.impressions;
      perPage.set(row.page, (perPage.get(row.page) ?? 0) + row.impressions);
      if (row.position === null || row.impressions <= 0) continue;
      const day = perDay.get(row.day) ?? { weighted: 0, impressions: 0 };
      day.weighted += row.position * row.impressions;
      day.impressions += row.impressions;
      perDay.set(row.day, day);
    }
    const series: Series = new Map([...perDay].sort(([a], [b]) => a.localeCompare(b)).map(([day, value]) => [day, value.weighted / value.impressions]));
    const days = [...series.keys()];
    const latestDay = days.at(-1) ?? null;
    const latest = latestDay ? series.get(latestDay)! : null;
    // "A week ago" = the last day with data on or before 7 days before the end of the range.
    const weekCut = addDays(to, -7);
    const weekDay = days.filter((day) => day <= weekCut).at(-1);
    return {
      keyword,
      tags,
      series,
      latest,
      latestDay,
      weekAgo: weekDay ? series.get(weekDay)! : null,
      first: days.length ? series.get(days[0])! : null,
      best: days.length ? Math.min(...series.values()) : null,
      clicks,
      impressions,
      page: [...perPage].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    };
  });
}

/** A tiny position line for a table row: higher on the chart = better position. */
function Sparkline({ series, days }: { series: Series; days: string[] }) {
  const values = days.map((day) => series.get(day) ?? null);
  const known = values.filter((value): value is number => value !== null);
  if (known.length < 2) return <span className="text-xs text-[#8a97ad]">{known.length ? "1 day" : "—"}</span>;
  const w = 96;
  const h = 26;
  const lo = Math.min(...known);
  const hi = Math.max(...known);
  const x = (i: number) => (days.length === 1 ? w / 2 : (i / (days.length - 1)) * w);
  const y = (v: number) => (hi === lo ? h / 2 : 2 + ((v - lo) / (hi - lo)) * (h - 4));
  let d = "";
  values.forEach((value, i) => {
    if (value !== null) d += `${d ? "L" : "M"}${x(i).toFixed(1)} ${y(value).toFixed(1)}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={d} fill="none" stroke={CHART_BLUE} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Change({ value }: { value: number | null }) {
  if (value === null || Math.abs(value) < 0.05) return <span className="text-[#8a97ad]">—</span>;
  return (
    <span className={value > 0 ? "font-semibold text-[#1c7a3e]" : "font-semibold text-[#a12020]"}>
      {value > 0 ? "▲" : "▼"} {Math.abs(value).toFixed(1)}
    </span>
  );
}

export function SeoRankingsWorkspace() {
  const { profile } = useAdmin();
  const isAdmin = profile.role === "admin";
  const [days, setDays] = useState(28);
  const [ranked, setRanked] = useState<Ranked[] | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const range = useMemo(() => periods(days), [days]);
  const dayList = useMemo(() => eachDay(range.from, range.to), [range]);

  const load = useCallback(async () => {
    try {
      const { data, error: listError } = await getSupabase().from("seo_keywords").select("keyword,tags").order("keyword");
      if (listError) throw new Error(listError.message);
      const keywords = (data ?? []) as Keyword[];
      const rows = keywords.length ? await loadDaily(keywords.map((item) => item.keyword), range.from, range.to) : [];
      setRanked(rank(keywords, rows, range.to));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load rankings.");
      setRanked((current) => current ?? []);
    }
  }, [range]);

  useEffect(() => {
    if (!isAdmin) return;
    // Loading on open (and when the range changes) is the point of this screen.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [isAdmin, load]);

  const showing = useMemo(() => (ranked ?? []).filter((row) => row.latest !== null), [ranked]);
  const notYet = useMemo(() => (ranked ?? []).filter((row) => row.latest === null), [ranked]);
  const ordered = useMemo(() => [...showing].sort((a, b) => a.latest! - b.latest!), [showing]);
  const focus = useMemo(() => ordered.find((row) => row.keyword === selected) ?? ordered[0] ?? null, [ordered, selected]);

  /** Average position of the ranking keywords per day (only days where at least one ranks). */
  const overall = useMemo(
    () =>
      dayList.map((day) => {
        const values = showing.map((row) => row.series.get(day)).filter((value): value is number => value !== undefined);
        return { label: shortDay(day), value: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : Number.NaN };
      }),
    [dayList, showing],
  );
  const movers = useMemo(
    () =>
      showing
        .map((row) => ({ row, moved: gain(row.weekAgo, row.latest) }))
        .filter((item): item is { row: Ranked; moved: number } => item.moved !== null && Math.abs(item.moved) >= 0.5)
        .sort((a, b) => b.moved - a.moved),
    [showing],
  );

  if (!isAdmin) return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins can see rankings.</div>;

  const counts = BANDS.map((item) => ({ ...item, count: showing.filter((row) => band(row.latest)?.key === item.key).length }));
  const average = showing.length ? showing.reduce((sum, row) => sum + row.latest!, 0) / showing.length : null;
  const improved = movers.filter((item) => item.moved > 0).length;
  const dropped = movers.filter((item) => item.moved < 0).length;
  const hasOverall = overall.some((point) => Number.isFinite(point.value));

  const exportCsv = () =>
    downloadCsv(
      `rankings-last-${days}-days.csv`,
      ["Keyword", "Latest position", "Latest day", "Week ago", "Change (week)", "Start of range", "Best", "Status", "Clicks", "Impressions", "Ranking page"],
      [...ordered, ...notYet].map((row) => [
        row.keyword,
        row.latest === null ? null : Number(row.latest.toFixed(1)),
        row.latestDay,
        row.weekAgo === null ? null : Number(row.weekAgo.toFixed(1)),
        gain(row.weekAgo, row.latest) === null ? null : Number(gain(row.weekAgo, row.latest)!.toFixed(1)),
        row.first === null ? null : Number(row.first.toFixed(1)),
        row.best === null ? null : Number(row.best.toFixed(1)),
        band(row.latest)?.label ?? "Not in Google yet",
        row.clicks,
        row.impressions,
        row.page ? pageLabel(row.page) : null,
      ]),
    );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">Ranking Monitor</h1>
          <p className="text-sm text-[#5b6b85]">How the website&apos;s Google position moves, day by day, for the keywords you track</p>
        </div>
        <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-lg border border-[#d4dbe7] bg-white px-3 py-2 text-sm font-semibold" aria-label="Date range">
          {RANGES.slice(0, 3).map((item) => (
            <option key={item.days} value={item.days}>
              {item.label}
            </option>
          ))}
        </select>
        <UserMenu />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        <SyncBar onSynced={() => void load()} />
        {error ? <p className="mb-4 rounded-xl border border-[#f3c2c2] bg-[#fdecec] p-4 text-sm text-[#a12020]">{error}</p> : null}
        {!ranked ? (
          <Loader />
        ) : !ranked.length ? (
          <p className="rounded-2xl border border-[#dfe5ef] bg-white p-10 text-center text-sm text-[#5b6b85]">
            No keywords tracked yet. Add them in{" "}
            <Link href="/admin/seo/keywords" className="font-semibold text-[#0b57d0] hover:underline">
              Keywords Tracking
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile label="Ranking in Google" value={`${showing.length} / ${ranked.length}`} delta={null} hint="Tracked keywords Google showed the site for" />
              <StatTile label="On page 1" value={number(counts[0].count + counts[1].count)} delta={null} hint="Positions 1-10, latest day" />
              <StatTile label="Avg. position" value={average === null ? "—" : average.toFixed(1)} delta={null} hint="Of the ranking keywords, latest day" />
              <StatTile label="Moved this week" value={`▲ ${improved}  ▼ ${dropped}`} delta={null} hint="Up or down by half a place or more" />
            </div>

            <section className="rounded-2xl border border-[#dfe5ef] bg-white p-5">
              <h2 className="font-bold">Where the keywords stand</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {counts.map((item) => (
                  <div key={item.key} className="rounded-xl p-3" style={{ background: item.bg }}>
                    <p className="text-xs font-semibold" style={{ color: item.color }}>
                      {item.label}
                    </p>
                    <p className="text-2xl font-extrabold tabular-nums" style={{ color: item.color }}>
                      {item.count}
                    </p>
                    <p className="text-[11px] text-[#5b6b85]">{item.hint}</p>
                  </div>
                ))}
                <div className="rounded-xl bg-[#f1f3f7] p-3">
                  <p className="text-xs font-semibold text-[#5b6b85]">Not in Google yet</p>
                  <p className="text-2xl font-extrabold tabular-nums text-[#5b6b85]">{notYet.length}</p>
                  <p className="text-[11px] text-[#5b6b85]">No impressions in this range</p>
                </div>
              </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-2">
              <section className="rounded-2xl border border-[#dfe5ef] bg-white p-5">
                <h2 className="font-bold">Average position over time</h2>
                <p className="mb-3 text-xs text-[#5b6b85]">Higher on the chart is better (position 1 is the top of Google).</p>
                {hasOverall ? <LineChart points={overall} format={fmt} name="Avg. position" invert /> : <EmptyChart text="None of the tracked keywords showed in Google in this period yet." />}
              </section>
              <section className="rounded-2xl border border-[#dfe5ef] bg-white p-5">
                <div className="mb-1 flex flex-wrap items-center gap-3">
                  <h2 className="mr-auto font-bold">One keyword</h2>
                  {ordered.length ? (
                    <select value={focus?.keyword ?? ""} onChange={(event) => setSelected(event.target.value)} className="max-w-72 rounded-lg border border-[#d4dbe7] bg-white px-3 py-1.5 text-sm" aria-label="Keyword">
                      {ordered.map((row) => (
                        <option key={row.keyword} value={row.keyword}>
                          {row.keyword}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
                <p className="mb-3 text-xs text-[#5b6b85]">Daily Google position for the chosen keyword.</p>
                {focus ? (
                  <LineChart points={dayList.map((day) => ({ label: shortDay(day), value: focus.series.get(day) ?? Number.NaN }))} format={fmt} name={focus.keyword} invert />
                ) : (
                  <EmptyChart text="No tracked keyword showed in Google in this period yet." />
                )}
              </section>
            </div>

            <section className="rounded-2xl border border-[#dfe5ef] bg-white">
              <div className="flex flex-wrap items-center gap-3 border-b border-[#eef1f6] px-5 py-3">
                <h2 className="mr-auto font-bold">All tracked keywords</h2>
                <button type="button" onClick={exportCsv} className="rounded-lg border border-[#d4dbe7] px-3 py-2 text-sm font-semibold">
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-[#f7f9fc] text-left text-xs tracking-wide text-[#5b6b85] uppercase">
                    <tr>
                      <th className="px-5 py-2.5 font-semibold">Keyword</th>
                      <th className="px-3 py-2.5 font-semibold">Status</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Position now</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Week ago</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Change</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Best</th>
                      <th className="px-3 py-2.5 font-semibold">Trend</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Clicks</th>
                      <th className="px-3 py-2.5 font-semibold">Ranking page</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...ordered, ...notYet].map((row) => {
                      const status = band(row.latest);
                      return (
                        <tr key={row.keyword} className="border-t border-[#eef1f6]">
                          <td className="px-5 py-2.5">
                            <button type="button" onClick={() => row.latest !== null && setSelected(row.keyword)} className="text-left font-semibold hover:text-[#0b57d0]" disabled={row.latest === null}>
                              {row.keyword}
                            </button>
                          </td>
                          <td className="px-3 py-2.5">
                            {status ? (
                              <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ color: status.color, background: status.bg }}>
                                {status.label}
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#f1f3f7] px-2 py-0.5 text-xs font-semibold text-[#5b6b85]">Not in Google yet</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold tabular-nums" title={row.latestDay ? `Latest day with data: ${shortDay(row.latestDay)}` : undefined}>
                            {row.latest === null ? "—" : row.latest.toFixed(1)}
                            {row.latestDay && row.latestDay < addDays(range.to, -3) ? (
                              <span className="block text-[11px] font-normal text-[#8a97ad]">as of {shortDay(row.latestDay)}</span>
                            ) : null}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{row.weekAgo === null ? "—" : row.weekAgo.toFixed(1)}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums">
                            <Change value={gain(row.weekAgo, row.latest)} />
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{row.best === null ? "—" : row.best.toFixed(1)}</td>
                          <td className="px-3 py-2.5">
                            <Sparkline series={row.series} days={dayList} />
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{number(row.clicks)}</td>
                          <td className="max-w-56 truncate px-3 py-2.5">
                            {row.page ? (
                              <a href={pageHref(row.page)} target="_blank" rel="noreferrer" className="text-[#0b57d0] hover:underline">
                                {pageLabel(row.page)}
                              </a>
                            ) : (
                              <span className="text-[#8a97ad]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-[#eef1f6] px-5 py-3 text-xs text-[#5b6b85]">
                Positions are Google&apos;s daily averages from Search Console, copied every night. Google reports a keyword only on days the website showed for it,
                so a keyword can skip days, and a new keyword stays &quot;Not in Google yet&quot; until the site starts to appear. Add or remove keywords in{" "}
                <Link href="/admin/seo/keywords" className="font-semibold text-[#0b57d0] hover:underline">
                  Keywords Tracking
                </Link>
                .
              </p>
            </section>

            {movers.length ? (
              <section className="rounded-2xl border border-[#dfe5ef] bg-white p-5">
                <h2 className="font-bold">Biggest moves this week</h2>
                <ul className="mt-3 divide-y divide-[#eef1f6] text-sm">
                  {movers.slice(0, 10).map(({ row, moved }) => (
                    <li key={row.keyword} className="flex flex-wrap items-center gap-3 py-2">
                      <span className="mr-auto font-semibold">{row.keyword}</span>
                      <span className="text-[#5b6b85] tabular-nums">
                        {row.weekAgo!.toFixed(1)} → {row.latest!.toFixed(1)}
                      </span>
                      <Change value={moved} />
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
