"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { Loader } from "@/components/admin/loader";
import { BarList, LineChart, StatTile } from "@/components/admin/seo-charts";
import { SyncBar } from "@/components/admin/seo-google-connection";
import {
  change,
  compact,
  eachDay,
  loadDaily,
  loadPageSummary,
  loadQuerySummary,
  number,
  pageLabel,
  periods,
  RANGES,
  shortDay,
  totals,
  type DayRow,
  type PageSummary,
  type QuerySummary,
} from "@/lib/seo-google";
import { getSupabase } from "@/lib/supabase-browser";

type Metric = "sessions" | "clicks" | "impressions";
const METRICS: { key: Metric; label: string }[] = [
  { key: "sessions", label: "Organic sessions" },
  { key: "clicks", label: "Clicks" },
  { key: "impressions", label: "Impressions" },
];

type Data = { current: DayRow[]; previous: DayRow[]; queries: QuerySummary[]; pages: PageSummary[]; audit: { score: number; created_at: string } | null };

function healthTone(score: number) {
  if (score >= 90) return { color: "#1c8a4a", label: "Good" };
  if (score >= 70) return { color: "#c98a00", label: "Needs work" };
  return { color: "#d93025", label: "Poor" };
}

export function SeoDashboardWorkspace() {
  const { profile } = useAdmin();
  const isAdmin = profile.role === "admin";
  const [days, setDays] = useState(28);
  const [metric, setMetric] = useState<Metric>("sessions");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const range = periods(days);
    try {
      const [current, previous, queries, pages, audit] = await Promise.all([
        loadDaily(range.from, range.to),
        loadDaily(range.prevFrom, range.prevTo),
        loadQuerySummary(range.from, range.to, undefined, 5),
        loadPageSummary(range.from, range.to, 5),
        getSupabase().from("seo_audits").select("score,created_at").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      setData({ current, previous, queries, pages, audit: (audit.data as Data["audit"]) ?? null });
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load the numbers.");
    }
  }, [days]);

  useEffect(() => {
    if (!isAdmin) return;
    // Loading on open (and when the range changes) is the point of this screen.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [isAdmin, load]);

  const chart = (() => {
    if (!data) return [];
    const range = periods(days);
    const byDay = new Map(data.current.map((row) => [row.day, row]));
    const before = new Map(data.previous.map((row) => [row.day, row]));
    const previousDays = eachDay(range.prevFrom, range.prevTo);
    return eachDay(range.from, range.to).map((day, index) => ({
      label: shortDay(day),
      value: byDay.get(day)?.[metric] ?? 0,
      previous: before.get(previousDays[index])?.[metric] ?? 0,
    }));
  })();

  if (!isAdmin) return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins can manage SEO.</div>;

  const now = data ? totals(data.current) : null;
  const before = data ? totals(data.previous) : null;
  const metricLabel = METRICS.find((item) => item.key === metric)!.label;
  const tone = data?.audit ? healthTone(data.audit.score) : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">SEO Dashboard</h1>
          <p className="text-sm text-[#5b6b85]">How the website is doing in Google search</p>
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
        {!data || !now || !before ? (
          <Loader />
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile label="Organic sessions" value={number(now.sessions)} delta={change(now.sessions, before.sessions)} />
              <StatTile label="Impressions" value={compact(now.impressions)} delta={change(now.impressions, before.impressions)} />
              <StatTile label="Clicks" value={number(now.clicks)} delta={change(now.clicks, before.clicks)} />
              <StatTile
                label="Avg. position"
                value={now.position === null ? "—" : now.position.toFixed(1)}
                delta={now.position !== null && before.position !== null ? change(now.position, before.position) : null}
                lowerIsBetter
                hint="Lower is better; 1 is the top of Google"
              />
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
              <section className="rounded-2xl border border-[#dfe5ef] bg-white p-5">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h2 className="mr-auto font-bold">{metricLabel}: this period vs the one before</h2>
                  <div className="flex rounded-lg border border-[#d4dbe7] p-0.5 text-sm" role="tablist" aria-label="Metric">
                    {METRICS.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        role="tab"
                        aria-selected={metric === item.key}
                        onClick={() => setMetric(item.key)}
                        className={`rounded-md px-3 py-1 font-semibold ${metric === item.key ? "bg-[#1a63e8] text-white" : "text-[#4a5a75]"}`}
                      >
                        {item.label === "Organic sessions" ? "Sessions" : item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <LineChart points={chart} format={compact} name={`Last ${days} days`} previousName={`${days} days before`} />
              </section>

              <section className="rounded-2xl border border-[#dfe5ef] bg-white p-5">
                <h2 className="font-bold">Site health</h2>
                {data.audit && tone ? (
                  <div className="mt-4 flex items-center gap-4">
                    <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${tone.color} ${data.audit.score * 3.6}deg, #e6ebf3 0deg)` }}>
                      <div className="grid h-[4.75rem] w-[4.75rem] place-items-center rounded-full bg-white text-center">
                        <p className="text-2xl leading-none font-extrabold">{data.audit.score}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold" style={{ color: tone.color }}>
                        {tone.label}
                      </p>
                      <p className="text-[#5b6b85]">From the SEO Audit of {new Date(data.audit.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[#5b6b85]">No audit yet.</p>
                )}
                <Link href="/admin/seo/audit" className="mt-4 inline-block text-sm font-semibold text-[#0b57d0] hover:underline">
                  Open SEO Audit →
                </Link>
              </section>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-2xl border border-[#dfe5ef] bg-white p-5">
                <div className="mb-4 flex items-center">
                  <h2 className="mr-auto font-bold">Top searches (clicks)</h2>
                  <Link href="/admin/seo/keywords" className="text-sm font-semibold text-[#0b57d0] hover:underline">
                    Keywords →
                  </Link>
                </div>
                <BarList rows={data.queries.map((row) => ({ key: row.query, label: row.query, value: row.clicks }))} format={number} empty="No searches from Google for this period yet." />
              </section>
              <section className="rounded-2xl border border-[#dfe5ef] bg-white p-5">
                <div className="mb-4 flex items-center">
                  <h2 className="mr-auto font-bold">Top pages (organic sessions)</h2>
                  <Link href="/admin/seo/reports" className="text-sm font-semibold text-[#0b57d0] hover:underline">
                    Reports →
                  </Link>
                </div>
                <BarList rows={data.pages.map((row) => ({ key: row.page, label: pageLabel(row.page), value: row.sessions }))} format={number} empty="No page visits from Google for this period yet." />
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
