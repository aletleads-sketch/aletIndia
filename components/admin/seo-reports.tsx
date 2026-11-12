"use client";

import { useCallback, useEffect, useState } from "react";
import { UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { Loader } from "@/components/admin/loader";
import { BarList, LineChart, StatTile } from "@/components/admin/seo-charts";
import { SyncBar } from "@/components/admin/seo-google-connection";
import {
  addDays,
  change,
  compact,
  downloadCsv,
  eachDay,
  loadDaily,
  loadPageSummary,
  loadQuerySummary,
  longDay,
  number,
  pageLabel,
  percent,
  periods,
  RANGES,
  shortDay,
  totals,
  type DayRow,
  type PageSummary,
  type QuerySummary,
} from "@/lib/seo-google";

type Tab = "performance" | "keywords" | "pages";
type Metric = "sessions" | "clicks" | "impressions" | "ctr" | "position";
const METRICS: { key: Metric; label: string }[] = [
  { key: "sessions", label: "Sessions" },
  { key: "clicks", label: "Clicks" },
  { key: "impressions", label: "Impressions" },
  { key: "ctr", label: "CTR" },
  { key: "position", label: "Position" },
];

type Data = { current: DayRow[]; previous: DayRow[]; queries: QuerySummary[]; pages: PageSummary[] };

/** Long ranges read better week by week; each point covers 7 days starting on that date. */
function buckets(rows: DayRow[], from: string, to: string, size: number) {
  const byDay = new Map(rows.map((row) => [row.day, row]));
  const days = eachDay(from, to);
  const out: { label: string; rows: DayRow[] }[] = [];
  for (let index = 0; index < days.length; index += size) {
    const chunk = days.slice(index, index + size);
    out.push({ label: shortDay(chunk[0]), rows: chunk.map((day) => byDay.get(day)).filter((row): row is DayRow => Boolean(row)) });
  }
  return out;
}

function valueOf(rows: DayRow[], metric: Metric) {
  const sum = totals(rows);
  if (metric === "ctr") return sum.ctr * 100;
  if (metric === "position") return sum.position ?? Number.NaN;
  return sum[metric];
}

export function SeoReportsWorkspace() {
  const { profile } = useAdmin();
  const isAdmin = profile.role === "admin";
  const [days, setDays] = useState(90);
  const [tab, setTab] = useState<Tab>("performance");
  const [metric, setMetric] = useState<Metric>("sessions");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const range = periods(days);
    try {
      const [current, previous, queries, pages] = await Promise.all([
        loadDaily(range.from, range.to),
        loadDaily(range.prevFrom, range.prevTo),
        loadQuerySummary(range.from, range.to, undefined, 500),
        loadPageSummary(range.from, range.to, 500),
      ]);
      setData({ current, previous, queries, pages });
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load the report.");
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
    const size = days > 90 ? 7 : 1;
    const current = buckets(data.current, range.from, range.to, size);
    const previous = buckets(data.previous, range.prevFrom, range.prevTo, size);
    return current.map((bucket, index) => ({
      label: bucket.label,
      value: valueOf(bucket.rows, metric),
      previous: previous[index] ? valueOf(previous[index].rows, metric) : null,
    }));
  })();

  if (!isAdmin) return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins can manage SEO.</div>;

  const range = periods(days);
  const now = data ? totals(data.current) : null;
  const before = data ? totals(data.previous) : null;
  const format = metric === "ctr" ? (value: number) => `${value.toFixed(1)}%` : metric === "position" ? (value: number) => value.toFixed(1) : compact;

  const exportCurrent = () => {
    if (!data) return;
    const suffix = `${range.from}-to-${range.to}`;
    if (tab === "keywords") {
      downloadCsv(`seo-searches-${suffix}.csv`, ["Search", "Clicks", "Impressions", "CTR %", "Position", "Top page"], data.queries.map((row) => [row.query, row.clicks, row.impressions, row.impressions ? Math.round((row.clicks / row.impressions) * 1000) / 10 : 0, row.position, pageLabel(row.page)]));
    } else if (tab === "pages") {
      downloadCsv(`seo-pages-${suffix}.csv`, ["Page", "Organic sessions", "Clicks", "Impressions", "Position"], data.pages.map((row) => [pageLabel(row.page), row.sessions, row.clicks, row.impressions, row.position]));
    } else {
      const byDay = new Map(data.current.map((row) => [row.day, row]));
      downloadCsv(
        `seo-daily-${suffix}.csv`,
        ["Date", "Organic sessions", "Users", "Clicks", "Impressions", "CTR %", "Position"],
        eachDay(range.from, range.to).map((day) => {
          const row = byDay.get(day);
          return [day, row?.sessions ?? 0, row?.users ?? 0, row?.clicks ?? 0, row?.impressions ?? 0, row?.impressions ? Math.round((row.clicks / row.impressions) * 1000) / 10 : 0, row?.position ?? null];
        }),
      );
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "performance", label: "Performance" },
    { key: "keywords", label: "Searches" },
    { key: "pages", label: "Pages" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">SEO Reports</h1>
          <p className="text-sm text-[#5b6b85]">
            {longDay(range.from)} – {longDay(range.to)}, compared with the {days} days before
          </p>
        </div>
        <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-lg border border-[#d4dbe7] bg-white px-3 py-2 text-sm font-semibold" aria-label="Date range">
          {RANGES.slice(1).map((item) => (
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
        {!data || !now || !before ? (
          <Loader />
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile label="Organic sessions" value={number(now.sessions)} delta={change(now.sessions, before.sessions)} />
              <StatTile label="Impressions" value={compact(now.impressions)} delta={change(now.impressions, before.impressions)} />
              <StatTile label="Clicks" value={number(now.clicks)} delta={change(now.clicks, before.clicks)} />
              <StatTile label="CTR" value={percent(now.ctr)} delta={change(now.ctr, before.ctr)} hint="Clicks ÷ impressions" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-xl border border-[#d4dbe7] bg-white p-1 text-sm" role="tablist" aria-label="Report">
                {tabs.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === item.key}
                    onClick={() => setTab(item.key)}
                    className={`rounded-lg px-4 py-1.5 font-semibold ${tab === item.key ? "bg-[#1a63e8] text-white" : "text-[#4a5a75]"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={exportCurrent} className="ml-auto rounded-lg border border-[#d4dbe7] bg-white px-3 py-2 text-sm font-semibold">
                Export CSV (Excel)
              </button>
            </div>

            {tab === "performance" ? (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <section className="rounded-2xl border border-[#dfe5ef] bg-white p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h2 className="mr-auto font-bold">Trend{days > 90 ? " by week" : " by day"}</h2>
                    <div className="flex flex-wrap rounded-lg border border-[#d4dbe7] p-0.5 text-sm" role="tablist" aria-label="Metric">
                      {METRICS.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          role="tab"
                          aria-selected={metric === item.key}
                          onClick={() => setMetric(item.key)}
                          className={`rounded-md px-3 py-1 font-semibold ${metric === item.key ? "bg-[#1a63e8] text-white" : "text-[#4a5a75]"}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <LineChart points={chart} format={format} name={`Last ${days} days`} previousName={`${days} days before`} invert={metric === "position"} />
                  {metric === "position" ? <p className="mt-2 text-xs text-[#5b6b85]">Higher on the chart is better: position 1 is the top of Google.</p> : null}
                </section>
                <section className="rounded-2xl border border-[#dfe5ef] bg-white p-5">
                  <h2 className="mb-4 font-bold">Organic sessions by page</h2>
                  <BarList
                    rows={(() => {
                      const top = data.pages.slice(0, 7);
                      const rest = data.pages.slice(7).reduce((total, row) => total + row.sessions, 0);
                      const items = top.map((row) => ({ key: row.page, label: pageLabel(row.page), value: row.sessions }));
                      return rest > 0 ? [...items, { key: "__others", label: "All other pages", value: rest }] : items;
                    })()}
                    format={number}
                    empty="No page visits from Google for this period yet."
                  />
                </section>
              </div>
            ) : null}

            {tab === "keywords" ? (
              <Table
                empty="No searches from Google for this period yet."
                head={["Search", "Clicks", "Impressions", "CTR", "Position", "Top page"]}
                rows={data.queries.map((row) => [row.query, number(row.clicks), number(row.impressions), row.impressions ? percent(row.clicks / row.impressions) : "—", row.position?.toFixed(1) ?? "—", pageLabel(row.page)])}
              />
            ) : null}

            {tab === "pages" ? (
              <Table
                empty="No pages from Google for this period yet."
                head={["Page", "Organic sessions", "Clicks", "Impressions", "Position"]}
                rows={data.pages.map((row) => [pageLabel(row.page), number(row.sessions), number(row.clicks), number(row.impressions), row.position?.toFixed(1) ?? "—"])}
              />
            ) : null}

            <p className="text-xs text-[#5b6b85]">
              Sessions come from Google Analytics (organic search only). Clicks, impressions, CTR and position come from Search Console. Google usually adds the last 2–3 days late; the
              numbers up to {longDay(addDays(range.to, -3))} are final.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Table({ head, rows, empty }: { head: string[]; rows: string[][]; empty: string }) {
  if (!rows.length) return <p className="rounded-2xl border border-[#dfe5ef] bg-white px-5 py-10 text-center text-sm text-[#5b6b85]">{empty}</p>;
  return (
    <section className="overflow-x-auto rounded-2xl border border-[#dfe5ef] bg-white">
      <table className="w-full min-w-[700px] text-sm">
        <thead className="bg-[#f7f9fc] text-left text-xs tracking-wide text-[#5b6b85] uppercase">
          <tr>
            {head.map((cell, index) => (
              <th key={cell} className={`px-4 py-2.5 font-semibold ${index > 0 && index < head.length - (head[head.length - 1] === "Top page" ? 1 : 0) ? "text-right" : ""}`}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("|")} className="border-t border-[#eef1f6]">
              {row.map((cell, index) => (
                <td key={index} className={`px-4 py-2 ${index === 0 ? "max-w-80 truncate font-semibold" : index < row.length - (head[head.length - 1] === "Top page" ? 1 : 0) ? "text-right tabular-nums" : "max-w-56 truncate"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
