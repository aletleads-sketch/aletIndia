"use client";

import { getSupabase } from "@/lib/supabase-browser";
import { BASE_PATH } from "@/lib/site-path";

/** seo_settings key 'google': which Search Console site and GA4 property the nightly sync reads. */
export type GoogleSettings = { searchConsoleSite?: string; ga4PropertyId?: string; pathPrefix?: string };

export type DayRow = { day: string; clicks: number; impressions: number; position: number | null; sessions: number; users: number };
export type QuerySummary = { query: string; clicks: number; impressions: number; position: number | null; page: string | null };
export type PageSummary = { page: string; clicks: number; impressions: number; position: number | null; sessions: number };
export type SyncRun = { id: string; started_at: string; finished_at: string | null; trigger: "schedule" | "admin"; ok: boolean | null; row_count: number | null; message: string | null };
export type GoogleStatus = {
  serviceAccountEmail: string | null;
  signIn: { ok: boolean; error?: string | null };
  searchConsole: { ok: boolean; error?: string | null; permission?: string | null };
  analytics: { ok: boolean; error?: string | null };
};

export const RANGES = [
  { days: 7, label: "Last 7 days" },
  { days: 28, label: "Last 28 days" },
  { days: 90, label: "Last 3 months" },
  { days: 180, label: "Last 6 months" },
  { days: 365, label: "Last 12 months" },
] as const;

const DAY_MS = 86_400_000;
export const isoDay = (date: Date) => date.toISOString().slice(0, 10);
export const addDays = (day: string, days: number) => isoDay(new Date(Date.parse(day) + days * DAY_MS));

/** This period ends yesterday (today's numbers are not complete yet); the previous period is the same length just before it. */
export function periods(days: number) {
  const to = isoDay(new Date(Date.now() - DAY_MS));
  const from = addDays(to, -(days - 1));
  return { from, to, prevFrom: addDays(from, -days), prevTo: addDays(from, -1) };
}

/** Every day from `from` to `to`, so a chart has no gaps where Google sent nothing. */
export function eachDay(from: string, to: string) {
  const days: string[] = [];
  for (let day = from; day <= to; day = addDays(day, 1)) days.push(day);
  return days;
}

export const number = (value: number) => Math.round(value).toLocaleString("en-IN");
export const compact = (value: number) => (Math.abs(value) >= 1000 ? new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value) : number(value));
export const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
export const shortDay = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
export const longDay = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** A page path from Google without the site's base path, for display ("/aletindia/web-application" → "/web-application"). */
export const pageLabel = (page: string | null) => {
  if (!page) return "—";
  const path = BASE_PATH && page.startsWith(BASE_PATH) ? page.slice(BASE_PATH.length) || "/" : page;
  return path;
};

/** % change from `before` to `now`; null when there is nothing to compare with. */
export const change = (now: number, before: number) => (before > 0 ? (now - before) / before : null);

export function totals(rows: DayRow[]) {
  const sum = (key: "clicks" | "impressions" | "sessions" | "users") => rows.reduce((total, row) => total + row[key], 0);
  const impressions = sum("impressions");
  const weighted = rows.reduce((total, row) => total + (row.position ?? 0) * row.impressions, 0);
  const clicks = sum("clicks");
  return {
    clicks,
    impressions,
    sessions: sum("sessions"),
    users: sum("users"),
    ctr: impressions ? clicks / impressions : 0,
    position: impressions ? weighted / impressions : null,
  };
}

export async function loadDaily(from: string, to: string) {
  const { data, error } = await getSupabase()
    .from("seo_daily")
    .select("day,clicks,impressions,position,sessions,users")
    .gte("day", from)
    .lte("day", to)
    .order("day");
  if (error) throw new Error(error.message);
  return ((data ?? []) as DayRow[]).map((row) => ({ ...row, position: row.position === null ? null : Number(row.position) }));
}

export async function loadQuerySummary(from: string, to: string, queries?: string[], limit = 500) {
  const { data, error } = await getSupabase().rpc("seo_query_summary", { p_from: from, p_to: to, p_queries: queries ?? null, p_limit: limit });
  if (error) throw new Error(error.message);
  return ((data ?? []) as QuerySummary[]).map((row) => ({ ...row, clicks: Number(row.clicks), impressions: Number(row.impressions), position: row.position === null ? null : Number(row.position) }));
}

export async function loadPageSummary(from: string, to: string, limit = 200) {
  const { data, error } = await getSupabase().rpc("seo_page_summary", { p_from: from, p_to: to, p_limit: limit });
  if (error) throw new Error(error.message);
  return ((data ?? []) as PageSummary[]).map((row) => ({
    ...row,
    clicks: Number(row.clicks),
    impressions: Number(row.impressions),
    sessions: Number(row.sessions),
    position: row.position === null ? null : Number(row.position),
  }));
}

export async function loadLastSync() {
  const { data } = await getSupabase().from("seo_sync_runs").select("id,started_at,finished_at,trigger,ok,row_count,message").order("started_at", { ascending: false }).limit(1).maybeSingle();
  return (data as SyncRun | null) ?? null;
}

/** Calls the seo-sync edge function as the signed-in admin. */
export async function callSeoSync<T>(body: { action: "status" } | { action: "sync"; days?: number } | { action: "submit_sitemap" }) {
  const { data, error } = await getSupabase().functions.invoke("seo-sync", { body });
  if (error) {
    const detail = await (error as { context?: Response }).context?.json?.().catch(() => null);
    throw new Error((detail as { error?: string } | null)?.error ?? error.message);
  }
  return data as T;
}

/** Turns rows into a CSV file and downloads it. */
export function downloadCsv(name: string, header: string[], rows: (string | number | null)[][]) {
  const cell = (value: string | number | null) => {
    const text = value === null ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = [header, ...rows].map((row) => row.map(cell).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}
