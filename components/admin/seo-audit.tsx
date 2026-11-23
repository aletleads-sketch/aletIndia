"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { Loader, ProgressLoader, Spinner } from "@/components/admin/loader";
import { loadSitePages, siteHref } from "@/lib/seo-admin";
import { AUDIT_CHECKS, runAudit, type AuditIssue, type AuditResult, type CheckId, type Severity } from "@/lib/seo-audit";
import { getSupabase } from "@/lib/supabase-browser";

type SavedAudit = AuditResult & { id: string; created_at: string };

const SEVERITY: Record<Severity, { label: string; badge: string; dot: string }> = {
  critical: { label: "Critical", badge: "bg-[#fdecec] text-[#a12020]", dot: "bg-[#d93025]" },
  warning: { label: "Warning", badge: "bg-[#fff3d9] text-[#8a5a00]", dot: "bg-[#e8a100]" },
  notice: { label: "Notice", badge: "bg-[#eef2f8] text-[#4a5a75]", dot: "bg-[#8a97ad]" },
};
const ORDER: Severity[] = ["critical", "warning", "notice"];
const META_TAG_CHECKS = new Set<CheckId>(["title_missing", "title_length", "duplicate_title", "description_missing", "description_length", "duplicate_description", "noindex", "og_image"]);

const when = (value: string) =>
  new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

function scoreTone(score: number) {
  if (score >= 90) return { color: "#1c8a4a", label: "Good" };
  if (score >= 70) return { color: "#c98a00", label: "Needs work" };
  return { color: "#d93025", label: "Poor" };
}

function ScoreRing({ score }: { score: number }) {
  const tone = scoreTone(score);
  return (
    <div className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${tone.color} ${score * 3.6}deg, #e6ebf3 0deg)` }}>
      <div className="grid h-[6.5rem] w-[6.5rem] place-items-center rounded-full bg-white text-center">
        <div>
          <p className="text-4xl leading-none font-extrabold">{score}</p>
          <p className="mt-1 text-xs font-semibold" style={{ color: tone.color }}>
            {tone.label}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SeoAuditWorkspace() {
  const { profile } = useAdmin();
  const isAdmin = profile.role === "admin";
  const [history, setHistory] = useState<SavedAudit[] | null>(null);
  const [current, setCurrent] = useState<SavedAudit | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number; stage: "pages" | "links" } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Severity | "all">("all");

  const load = useCallback(async () => {
    const { data, error: loadError } = await getSupabase()
      .from("seo_audits")
      .select("id,created_at,score,pages,critical,warnings,notices,issues")
      .order("created_at", { ascending: false })
      .limit(10);
    if (loadError) setError(loadError.message);
    const rows = (data as SavedAudit[] | null) ?? [];
    setHistory(rows);
    setCurrent(rows[0] ?? null);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    // Loading on open is the point of this screen; the state updates happen after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [isAdmin, load]);

  const start = async () => {
    setError(null);
    setProgress({ done: 0, total: 0, stage: "pages" });
    try {
      const pages = await loadSitePages();
      const result = await runAudit(pages, (done, total, stage) => setProgress({ done, total, stage }));
      const { data, error: saveError } = await getSupabase()
        .from("seo_audits")
        .insert(result)
        .select("id,created_at,score,pages,critical,warnings,notices,issues")
        .single();
      const saved = (data as SavedAudit | null) ?? { ...result, id: "unsaved", created_at: new Date().toISOString() };
      if (saveError) setError(`The audit ran but could not be saved: ${saveError.message}`);
      setCurrent(saved);
      if (data) setHistory((rows) => [saved, ...(rows ?? [])].slice(0, 10));
      setFilter("all");
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "The audit could not run.");
    }
    setProgress(null);
  };

  const groups = useMemo(() => {
    if (!current) return [];
    const byCheck = new Map<CheckId, AuditIssue[]>();
    for (const issue of current.issues) byCheck.set(issue.check, [...(byCheck.get(issue.check) ?? []), issue]);
    return [...byCheck.entries()]
      .map(([check, issues]) => ({ check, info: AUDIT_CHECKS[check], issues }))
      .filter((group) => group.info && (filter === "all" || group.info.severity === filter))
      .sort((a, b) => ORDER.indexOf(a.info.severity) - ORDER.indexOf(b.info.severity) || b.issues.length - a.issues.length);
  }, [current, filter]);

  if (!isAdmin) {
    return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins can manage SEO.</div>;
  }

  const running = progress !== null;
  const previous = current && history ? history[history.findIndex((row) => row.id === current.id) + 1] : undefined;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">SEO Audit</h1>
          <p className="text-sm text-[#5b6b85]">Checks every page the way Google reads it and lists what to fix</p>
        </div>
        <UserMenu />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        {error ? <p className="mb-4 rounded-xl border border-[#f3c2c2] bg-[#fdecec] p-4 text-sm text-[#a12020]">{error}</p> : null}

        <section className="mb-5 flex flex-wrap items-center gap-6 rounded-2xl border border-[#dfe5ef] bg-white p-5">
          {current ? <ScoreRing score={current.score} /> : null}
          <div className="min-w-0 flex-1">
            {current ? (
              <>
                <p className="text-sm font-semibold text-[#5b6b85]">Website SEO score</p>
                <p className="mt-1 text-sm text-[#5b6b85]">
                  {current.pages} pages checked {current.id === "unsaved" ? "just now" : `on ${when(current.created_at)}`}
                  {previous ? (
                    <span className={`ml-2 font-semibold ${current.score >= previous.score ? "text-[#1c7a3e]" : "text-[#a12020]"}`}>
                      {current.score >= previous.score ? "▲" : "▼"} {Math.abs(current.score - previous.score)} since last audit
                    </span>
                  ) : null}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ORDER.map((severity) => {
                    const value = severity === "critical" ? current.critical : severity === "warning" ? current.warnings : current.notices;
                    return (
                      <span key={severity} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${SEVERITY[severity].badge}`}>
                        <span className={`h-2 w-2 rounded-full ${SEVERITY[severity].dot}`} aria-hidden="true" />
                        {value} {SEVERITY[severity].label}
                      </span>
                    );
                  })}
                </div>
              </>
            ) : history ? (
              <>
                <p className="font-bold">No audit yet</p>
                <p className="mt-1 text-sm text-[#5b6b85]">Run the first audit to get the website&apos;s SEO score and a list of fixes. It takes about a minute.</p>
              </>
            ) : (
              <Loader />
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              disabled={running || !history}
              onClick={() => void start()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1a63e8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {running ? <Spinner className="h-4 w-4" light /> : null}
              {running ? "Running…" : current ? "Run audit again" : "Run audit"}
            </button>
          </div>
          {progress ? (
            <div className="w-full rounded-xl border border-[#eef1f6] bg-[#f9fbfe]">
              <ProgressLoader
                label={progress.stage === "pages" ? "Reading every page on the website…" : "Checking links on the pages…"}
                done={progress.done}
                total={progress.total}
              />
            </div>
          ) : null}
        </section>

        {current ? (
          <section className="mb-5 overflow-hidden rounded-2xl border border-[#dfe5ef] bg-white">
            <div className="flex flex-wrap items-center gap-2 border-b border-[#eef1f6] px-5 py-4">
              <h2 className="mr-auto font-bold">Issues to fix</h2>
              {(["all", ...ORDER] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${filter === value ? "bg-[#1a63e8] text-white" : "bg-[#f2f5fa] text-[#4a5a75] hover:bg-[#e8edf5]"}`}
                >
                  {value === "all" ? "All" : SEVERITY[value].label}
                </button>
              ))}
            </div>
            {!groups.length ? (
              <p className="px-5 py-10 text-center text-sm text-[#5b6b85]">{current.issues.length ? "Nothing in this group." : "No issues found. Every page passed."}</p>
            ) : (
              <ul className="divide-y divide-[#eef1f6]">
                {groups.map((group) => (
                  <li key={group.check}>
                    <details className="group">
                      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-[#f9fbfe]">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${SEVERITY[group.info.severity].badge}`}>{SEVERITY[group.info.severity].label}</span>
                        <span className="mr-auto font-semibold">{group.info.label}</span>
                        <span className="text-sm text-[#5b6b85]">
                          {group.issues.length} {group.issues.length === 1 ? "page" : "pages"}
                        </span>
                        <span className="text-[#5b6b85] transition group-open:rotate-90" aria-hidden="true">
                          ›
                        </span>
                      </summary>
                      <div className="border-t border-[#eef1f6] bg-[#fbfcfe] px-5 py-3">
                        <p className="mb-3 flex flex-wrap items-center gap-3 text-sm text-[#4a5a75]">
                          <span>{group.info.fix}</span>
                          {META_TAG_CHECKS.has(group.check) ? (
                            <Link href="/admin/seo/meta-tags" className="font-semibold text-[#0b57d0] hover:underline">
                              Open Meta Tags →
                            </Link>
                          ) : null}
                        </p>
                        <ul className="space-y-1.5">
                          {group.issues.map((issue) => (
                            <li key={`${issue.path}-${issue.detail}`} className="text-sm">
                              <a href={siteHref(issue.path)} target="_blank" rel="noreferrer" className="font-semibold text-[#0b57d0] hover:underline">
                                {issue.path}
                              </a>
                              <span className="ml-2 break-words text-[#5b6b85]">{issue.detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {history && history.length > 1 ? (
          <section className="overflow-hidden rounded-2xl border border-[#dfe5ef] bg-white">
            <h2 className="border-b border-[#eef1f6] px-5 py-4 font-bold">Past audits</h2>
            <ul className="divide-y divide-[#eef1f6]">
              {history.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrent(row);
                      setFilter("all");
                    }}
                    className={`flex w-full flex-wrap items-center gap-4 px-5 py-3 text-left text-sm hover:bg-[#f9fbfe] ${current?.id === row.id ? "bg-[#f4f8ff]" : ""}`}
                  >
                    <span className="w-12 text-lg font-extrabold" style={{ color: scoreTone(row.score).color }}>
                      {row.score}
                    </span>
                    <span className="mr-auto text-[#4a5a75]">{when(row.created_at)}</span>
                    <span className="text-[#5b6b85]">
                      {row.critical} critical · {row.warnings} warnings · {row.notices} notices
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
