"use client";

import { getSupabase } from "@/lib/supabase-browser";

/** One GA4 row: dimension names hold text, metric names hold numbers (see the seo-sync edge function). */
export type GaRow = Record<string, string | number>;

export type VisitorReportName =
  | "totals"
  | "trend"
  | "countries"
  | "regions"
  | "cities"
  | "devices"
  | "os"
  | "browsers"
  | "brands"
  | "screens"
  | "languages"
  | "channels"
  | "sources"
  | "pages"
  | "landing"
  | "visitorType"
  | "hours"
  | "events";

export type VisitorReports = Record<VisitorReportName, GaRow[]>;
export type VisitorSite = "live" | "dev" | "all";
export type Realtime = { activeUsers: number; countries: GaRow[]; devices: GaRow[]; pages: GaRow[] };

/** Only the live website loads Google Analytics (the dev site is built without it); "all" also shows any other host, e.g. tests. */
export const SITES: { value: VisitorSite; label: string }[] = [
  { value: "live", label: "aletindia.com" },
  { value: "all", label: "All hosts" },
];

export const VISITOR_RANGES = [
  { days: 1, label: "Today" },
  { days: 7, label: "Last 7 days" },
  { days: 28, label: "Last 28 days" },
  { days: 90, label: "Last 3 months" },
  { days: 365, label: "Last 12 months" },
] as const;

async function call<T>(body: Record<string, unknown>) {
  const { data, error } = await getSupabase().functions.invoke("seo-sync", { body });
  if (error) {
    const detail = await (error as { context?: Response }).context?.json?.().catch(() => null);
    throw new Error((detail as { error?: string } | null)?.error ?? error.message);
  }
  return data as T;
}

export const loadVisitors = (days: number, site: VisitorSite) => call<{ days: number; site: VisitorSite; reports: VisitorReports }>({ action: "visitors", days, site });
export const loadRealtime = () => call<Realtime>({ action: "realtime" });

export const num = (row: GaRow | undefined, key: string) => Number(row?.[key] ?? 0) || 0;
export const text = (row: GaRow | undefined, key: string) => String(row?.[key] ?? "");

/** The totals row for this period or the one before (GA4 adds a `dateRange` column when two ranges are asked for). */
export const period = (rows: GaRow[], name: "current" | "previous") => rows.find((row) => row.dateRange === name) ?? (name === "current" && rows.length === 1 ? rows[0] : undefined);

/** "125" seconds → "2m 05s". */
export function duration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return minutes ? `${minutes}m ${String(rest).padStart(2, "0")}s` : `${rest}s`;
}

/** GA4's "(not set)" and empty values, in words people understand. */
export const label = (value: string, fallback = "Unknown") => (!value || value === "(not set)" || value === "(other)" ? fallback : value);

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** The days a range covers, oldest first, as GA4's YYYYMMDD (today included). */
export function rangeDays(days: number, offset = 0) {
  const list: string[] = [];
  for (let index = days - 1 + offset; index >= offset; index -= 1) {
    const date = new Date(Date.now() - index * 86_400_000);
    list.push(`${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`);
  }
  return list;
}

export const gaDayLabel = (value: string) => new Date(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1, Number(value.slice(6, 8))).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
