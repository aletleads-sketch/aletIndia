"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { Loader } from "@/components/admin/loader";
import { CHART_BLUE, LineChart, StatTile } from "@/components/admin/seo-charts";
import { change, compact, downloadCsv, number, pageLabel, percent } from "@/lib/seo-google";
import {
  DAY_NAMES,
  SITES,
  VISITOR_RANGES,
  duration,
  gaDayLabel,
  label,
  loadRealtime,
  loadVisitors,
  num,
  period,
  rangeDays,
  text,
  type GaRow,
  type Realtime,
  type VisitorReports,
  type VisitorSite,
} from "@/lib/visitor-analytics";

type TrendMetric = "activeUsers" | "sessions" | "screenPageViews";
const TREND: { key: TrendMetric; label: string }[] = [
  { key: "activeUsers", label: "Visitors" },
  { key: "sessions", label: "Visits" },
  { key: "screenPageViews", label: "Page views" },
];
type Place = "countries" | "regions" | "cities";
const PLACES: { key: Place; label: string }[] = [
  { key: "countries", label: "Country" },
  { key: "regions", label: "State / region" },
  { key: "cities", label: "City" },
];
const DEVICE_NAMES: Record<string, string> = { desktop: "Desktop", mobile: "Mobile", tablet: "Tablet", "smart tv": "Smart TV" };
const REALTIME_EVERY_MS = 60_000;

const card = "rounded-2xl border border-[#dfe5ef] bg-white p-5";

/** A "top N" list with each row's share of the total, e.g. Mobile · 1,204 · 61.3%. */
function ShareList({ rows: all, empty = "No visits for this period yet.", format = number }: { rows: { key: string; label: ReactNode; value: number }[]; empty?: string; format?: (value: number) => string }) {
  const rows = all.filter((row) => row.value > 0);
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const max = Math.max(1, ...rows.map((row) => row.value));
  if (!rows.length || !total) return <p className="py-6 text-center text-sm text-[#5b6b85]">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.key} className="grid grid-cols-[minmax(0,1fr)_auto_3.5rem] items-center gap-3 text-sm">
          <div className="min-w-0">
            <div className="truncate text-[#14213d]">{row.label}</div>
            <div className="mt-1 h-2 rounded-full bg-[#eef2f8]">
              <div className="h-2 rounded-full" style={{ width: `${Math.max(2, (row.value / max) * 100)}%`, background: CHART_BLUE }} />
            </div>
          </div>
          <span className="font-semibold tabular-nums">{format(row.value)}</span>
          <span className="text-right text-xs text-[#5b6b85] tabular-nums">{percent(row.value / total)}</span>
        </li>
      ))}
    </ul>
  );
}

function Tabs<T extends string>({ items, value, onChange, name }: { items: { key: T; label: string }[]; value: T; onChange: (value: T) => void; name: string }) {
  return (
    <div className="flex flex-wrap rounded-lg border border-[#d4dbe7] p-0.5 text-sm" role="tablist" aria-label={name}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={value === item.key}
          onClick={() => onChange(item.key)}
          className={`rounded-md px-3 py-1 font-semibold ${value === item.key ? "bg-[#1a63e8] text-white" : "text-[#4a5a75]"}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function Section({ title, hint, action, children }: { title: string; hint?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={card}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h2 className="font-bold">{title}</h2>
          {hint ? <p className="text-xs text-[#5b6b85]">{hint}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Two-letter country code as a small badge (flag emoji do not show on Windows). */
const CountryCode = ({ code }: { code: string }) =>
  code && code !== "(not set)" ? <span className="mr-2 inline-block w-7 rounded bg-[#eef2f8] py-0.5 text-center text-[10px] font-bold text-[#4a5a75]">{code}</span> : null;

/** Visits by weekday and hour: one hue, darker = more visits. */
function HourGrid({ rows }: { rows: GaRow[] }) {
  const cells = new Map(rows.map((row) => [`${text(row, "dayOfWeek")}-${Number(text(row, "hour"))}`, num(row, "sessions")]));
  const max = Math.max(0, ...cells.values());
  if (!max) return <p className="py-6 text-center text-sm text-[#5b6b85]">No visits for this period yet.</p>;
  const order = [1, 2, 3, 4, 5, 6, 0]; // Monday first
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[440px] table-fixed border-separate border-spacing-[2px] text-[10px] text-[#5b6b85]">
        <thead>
          <tr>
            <th className="w-9" />
            {Array.from({ length: 24 }, (_, hour) => (
              <th key={hour} className="overflow-visible text-left font-medium whitespace-nowrap">
                {hour % 6 === 0 ? `${hour}:00` : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {order.map((day) => (
            <tr key={day}>
              <th className="pr-1 text-left font-semibold">{DAY_NAMES[day]}</th>
              {Array.from({ length: 24 }, (_, hour) => {
                const value = cells.get(`${day}-${hour}`) ?? 0;
                return (
                  <td
                    key={hour}
                    title={`${DAY_NAMES[day]} ${hour}:00–${hour + 1}:00 · ${number(value)} visit${value === 1 ? "" : "s"}`}
                    className="h-6 rounded-sm"
                    style={{ background: value ? `rgba(26, 99, 232, ${(0.12 + 0.88 * (value / max)).toFixed(2)})` : "#f1f4f9" }}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex items-center justify-end gap-2 text-xs text-[#5b6b85]">
        Fewer
        <span className="h-3 w-24 rounded" style={{ background: "linear-gradient(to right, rgba(26,99,232,0.12), rgba(26,99,232,1))" }} />
        More visits
      </div>
    </div>
  );
}

function RealtimeCard() {
  const [now, setNow] = useState<Realtime | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [at, setAt] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      setNow(await loadRealtime());
      setAt(new Date());
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load live visitors.");
    }
  }, []);

  useEffect(() => {
    // Live numbers: load on open, then every minute while the screen is open.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const timer = window.setInterval(() => void refresh(), REALTIME_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return (
    <section className={`${card} xl:row-span-2`}>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1c8a4a] opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#1c8a4a]" />
        </span>
        <h2 className="mr-auto font-bold">Right now</h2>
        <button type="button" onClick={() => void refresh()} className="text-xs font-semibold text-[#0b57d0] hover:underline">
          Refresh
        </button>
      </div>
      <p className="text-xs text-[#5b6b85]">Visitors in the last 30 minutes, all sites{at ? ` · ${at.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}</p>
      {error ? <p className="mt-3 text-sm text-[#a12020]">{error}</p> : null}
      {!now ? (
        !error ? <Loader className="h-40" /> : null
      ) : (
        <>
          <p className="mt-3 text-5xl font-extrabold tracking-tight tabular-nums">{number(now.activeUsers)}</p>
          <p className="text-sm text-[#5b6b85]">active visitor{now.activeUsers === 1 ? "" : "s"}</p>
          <div className="mt-5 space-y-5">
            <div>
              <h3 className="mb-2 text-xs font-bold tracking-wide text-[#5b6b85] uppercase">Where from</h3>
              <ShareList rows={now.countries.map((row) => ({ key: text(row, "country"), label: label(text(row, "country")), value: num(row, "activeUsers") }))} empty="Nobody on the site right now." />
            </div>
            <div>
              <h3 className="mb-2 text-xs font-bold tracking-wide text-[#5b6b85] uppercase">Device</h3>
              <ShareList rows={now.devices.map((row) => ({ key: text(row, "deviceCategory"), label: DEVICE_NAMES[text(row, "deviceCategory")] ?? label(text(row, "deviceCategory")), value: num(row, "activeUsers") }))} empty="—" />
            </div>
            <div>
              <h3 className="mb-2 text-xs font-bold tracking-wide text-[#5b6b85] uppercase">Pages open</h3>
              <ShareList rows={now.pages.map((row) => ({ key: text(row, "unifiedScreenName"), label: label(text(row, "unifiedScreenName")), value: num(row, "activeUsers") }))} empty="—" />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export function VisitorAnalyticsWorkspace() {
  const { profile } = useAdmin();
  const allowed = profile.role === "admin" || profile.role === "marketing";
  const [days, setDays] = useState(28);
  const [site, setSite] = useState<VisitorSite>("live");
  const [trend, setTrend] = useState<TrendMetric>("activeUsers");
  const [place, setPlace] = useState<Place>("countries");
  const [reports, setReports] = useState<VisitorReports | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadVisitors(days, site);
      setReports(data.reports);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load the numbers.");
    } finally {
      setLoading(false);
    }
  }, [days, site]);

  useEffect(() => {
    if (!allowed) return;
    // Loading on open (and when the range or site changes) is the point of this screen.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [allowed, load]);

  if (!allowed) return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only Admin and Marketing can see visitor analytics.</div>;

  const rangeLabel = VISITOR_RANGES.find((range) => range.days === days)?.label ?? `Last ${days} days`;
  const now = reports ? period(reports.totals, "current") : undefined;
  const before = reports ? period(reports.totals, "previous") : undefined;
  const delta = (key: string) => (before ? change(num(now, key), num(before, key)) : null);
  const visitors = num(now, "activeUsers");
  const visits = num(now, "sessions");

  const chart = (() => {
    if (!reports) return [];
    const current = new Map(reports.trend.filter((row) => row.dateRange !== "previous").map((row) => [text(row, "date"), num(row, trend)]));
    const earlier = new Map(reports.trend.filter((row) => row.dateRange === "previous").map((row) => [text(row, "date"), num(row, trend)]));
    const previousDays = rangeDays(days, days);
    return rangeDays(days).map((day, index) => ({ label: gaDayLabel(day), value: current.get(day) ?? 0, previous: earlier.get(previousDays[index]) ?? 0 }));
  })();

  const placeRows = (() => {
    if (!reports) return [];
    if (place === "countries") return reports.countries.map((row) => ({ key: text(row, "countryId") || text(row, "country"), label: <><CountryCode code={text(row, "countryId")} />{label(text(row, "country"))}</>, value: num(row, "activeUsers") }));
    const key = place === "regions" ? "region" : "city";
    return reports[place].slice(0, 25).map((row, index) => ({ key: `${text(row, key)}-${text(row, "country")}-${index}`, label: `${label(text(row, key))}, ${label(text(row, "country"))}`, value: num(row, "activeUsers") }));
  })();

  const exportCountries = () =>
    reports &&
    downloadCsv(
      `visitors-by-country-${days}d.csv`,
      ["Country", "Code", "Visitors", "New visitors", "Visits"],
      reports.countries.map((row) => [label(text(row, "country")), text(row, "countryId"), num(row, "activeUsers"), num(row, "newUsers"), num(row, "sessions")]),
    );
  const exportPages = () =>
    reports &&
    downloadCsv(
      `pages-${days}d.csv`,
      ["Page", "Page views", "Visitors", "Avg. time (seconds)"],
      reports.pages.map((row) => [text(row, "pagePath"), num(row, "screenPageViews"), num(row, "activeUsers"), Math.round(num(row, "userEngagementDuration") / Math.max(1, num(row, "activeUsers")))]),
    );

  const simpleRows = (rows: GaRow[], key: string, metric = "activeUsers", names: Record<string, string> = {}) =>
    rows.map((row, index) => ({ key: `${text(row, key)}-${index}`, label: names[text(row, key)] ?? label(text(row, key)), value: num(row, metric) }));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">Visitor Analytics</h1>
          <p className="text-sm text-[#5b6b85]">Who visits the website, from where, and on which device · from Google Analytics</p>
        </div>
        <select value={site} onChange={(event) => setSite(event.target.value as VisitorSite)} className="rounded-lg border border-[#d4dbe7] bg-white px-3 py-2 text-sm font-semibold" aria-label="Website">
          {SITES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-lg border border-[#d4dbe7] bg-white px-3 py-2 text-sm font-semibold" aria-label="Date range">
          {VISITOR_RANGES.map((range) => (
            <option key={range.days} value={range.days}>
              {range.label}
            </option>
          ))}
        </select>
        <UserMenu />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        {error ? <p className="mb-4 rounded-xl border border-[#f3c2c2] bg-[#fdecec] p-4 text-sm text-[#a12020]">{error}</p> : null}
        {reports && !visitors && !loading ? (
          <p className="mb-4 rounded-xl border border-[#cfe0fb] bg-[#eef4ff] p-4 text-sm text-[#1d3f7a]">
            No visits recorded for this website and period yet. Google Analytics counts visits once the website with the tracking code is live: new visitors show in “Right now” within a minute, and in these reports within a few hours.
          </p>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-5">
            {!reports ? (
              <Loader />
            ) : (
              <>
                <div className={`grid gap-4 sm:grid-cols-2 2xl:grid-cols-4 ${loading ? "opacity-60" : ""}`}>
                  <StatTile label="Visitors" value={number(visitors)} delta={delta("activeUsers")} />
                  <StatTile label="New visitors" value={number(num(now, "newUsers"))} delta={delta("newUsers")} />
                  <StatTile label="Visits (sessions)" value={number(visits)} delta={delta("sessions")} />
                  <StatTile label="Page views" value={compact(num(now, "screenPageViews"))} delta={delta("screenPageViews")} />
                  <StatTile label="Pages per visit" value={visits ? (num(now, "screenPageViews") / visits).toFixed(1) : "0"} delta={null} hint="Page views ÷ visits" />
                  <StatTile label="Avg. visit time" value={duration(num(now, "averageSessionDuration"))} delta={delta("averageSessionDuration")} />
                  <StatTile label="Engaged visits" value={percent(num(now, "engagementRate"))} delta={delta("engagementRate")} hint="Stayed 10s+, saw 2+ pages or acted" />
                  <StatTile label="Bounce rate" value={percent(num(now, "bounceRate"))} delta={delta("bounceRate")} lowerIsBetter hint="Left without engaging; lower is better" />
                </div>

                <Section title={`${TREND.find((item) => item.key === trend)!.label}: this period vs the one before`} action={<Tabs items={TREND} value={trend} onChange={setTrend} name="Metric" />}>
                  <LineChart points={chart} format={compact} name={rangeLabel} previousName="Period before" />
                </Section>
              </>
            )}
          </div>
          <RealtimeCard />
        </div>

        {reports ? (
          <div className={`mt-5 space-y-5 ${loading ? "opacity-60" : ""}`}>
            <div className="grid gap-5 lg:grid-cols-2">
              <Section
                title="Where visitors come from"
                hint="Visitors by location (from their internet connection)"
                action={
                  <div className="flex items-center gap-3">
                    <Tabs items={PLACES} value={place} onChange={setPlace} name="Location" />
                    {place === "countries" ? (
                      <button type="button" onClick={exportCountries} className="text-xs font-semibold text-[#0b57d0] hover:underline">
                        CSV
                      </button>
                    ) : null}
                  </div>
                }
              >
                <div className="max-h-[26rem] overflow-y-auto pr-1">
                  <ShareList rows={placeRows} />
                </div>
              </Section>

              <Section title="Device type" hint="Desktop, mobile or tablet">
                <ShareList rows={simpleRows(reports.devices, "deviceCategory", "activeUsers", DEVICE_NAMES)} />
                <h3 className="mt-6 mb-3 text-sm font-bold">New vs returning</h3>
                <ShareList rows={simpleRows(reports.visitorType, "newVsReturning", "activeUsers", { new: "New visitors", returning: "Returning visitors" })} />
              </Section>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Section title="Operating system" hint="Android, iOS, Windows, macOS…">
                <ShareList rows={simpleRows(reports.os.slice(0, 10), "operatingSystem")} />
              </Section>
              <Section title="Browser">
                <ShareList rows={simpleRows(reports.browsers.slice(0, 10), "browser")} />
              </Section>
              <Section title="Phone / device brand" hint="Apple, Samsung, Xiaomi…">
                <ShareList rows={simpleRows(reports.brands.slice(0, 10), "mobileDeviceBranding")} />
              </Section>
              <Section title="Screen size">
                <ShareList rows={simpleRows(reports.screens.slice(0, 10), "screenResolution")} />
              </Section>
              <Section title="Language" hint="Browser language">
                <ShareList rows={simpleRows(reports.languages.slice(0, 10), "language")} />
              </Section>
              <Section title="How they found the site" hint="Visits by channel">
                <ShareList rows={simpleRows(reports.channels, "sessionDefaultChannelGroup", "sessions")} />
              </Section>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Section title="Top sources" hint="Visits by source / medium">
                <ShareList
                  rows={reports.sources.slice(0, 15).map((row, index) => ({
                    key: `${text(row, "sessionSource")}-${text(row, "sessionMedium")}-${index}`,
                    label: `${label(text(row, "sessionSource"), "(direct)")} / ${label(text(row, "sessionMedium"), "(none)")}`,
                    value: num(row, "sessions"),
                  }))}
                />
              </Section>
              <Section title="Landing pages" hint="First page of a visit">
                <ShareList rows={reports.landing.slice(0, 15).map((row, index) => ({ key: `${text(row, "landingPage")}-${index}`, label: pageLabel(label(text(row, "landingPage"), "/")), value: num(row, "sessions") }))} />
              </Section>
            </div>

            <Section
              title="Most viewed pages"
              action={
                <button type="button" onClick={exportPages} className="text-xs font-semibold text-[#0b57d0] hover:underline">
                  CSV
                </button>
              }
            >
              {reports.pages.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-[#e6ebf3] text-left text-xs text-[#5b6b85]">
                        <th className="py-2 pr-3 font-semibold">Page</th>
                        <th className="py-2 pr-3 text-right font-semibold">Page views</th>
                        <th className="py-2 pr-3 text-right font-semibold">Visitors</th>
                        <th className="py-2 text-right font-semibold">Avg. time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.pages.slice(0, 25).map((row, index) => (
                        <tr key={`${text(row, "pagePath")}-${index}`} className="border-b border-[#f0f3f8] last:border-0">
                          <td className="max-w-[24rem] truncate py-2 pr-3">{pageLabel(text(row, "pagePath"))}</td>
                          <td className="py-2 pr-3 text-right font-semibold tabular-nums">{number(num(row, "screenPageViews"))}</td>
                          <td className="py-2 pr-3 text-right tabular-nums">{number(num(row, "activeUsers"))}</td>
                          <td className="py-2 text-right tabular-nums">{duration(num(row, "userEngagementDuration") / Math.max(1, num(row, "activeUsers")))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-[#5b6b85]">No visits for this period yet.</p>
              )}
            </Section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <Section title="When people visit" hint="Visits by weekday and hour (website's time zone)">
                <HourGrid rows={reports.hours} />
              </Section>
              <Section title="Actions on the site" hint="Google Analytics events">
                <ShareList rows={simpleRows(reports.events.slice(0, 12), "eventName", "eventCount")} />
              </Section>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
