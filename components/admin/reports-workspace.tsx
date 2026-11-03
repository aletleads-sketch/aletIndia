"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { canManageLeads, UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { followUpState, leadTab, STATUS_LABELS, type Lead, type LeadStatus } from "@/lib/leads";
import { getSupabase } from "@/lib/supabase-browser";

type ReportLead = Pick<
  Lead,
  "id" | "status" | "deleted_at" | "created_at" | "won_at" | "owner_id" | "source" | "utm_source" | "service_name" | "lost_reason" | "next_follow_up_at" | "services"
>;
type ReportNote = { lead_id: string; kind: string; author_id: string | null; created_at: string };

const PERIODS = [
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "Last 90 days", days: 90 },
  { id: "365", label: "Last 12 months", days: 365 },
  { id: "all", label: "All time", days: null },
] as const;
type PeriodId = (typeof PERIODS)[number]["id"];

const BAR = "#1a63e8";
const FUNNEL: LeadStatus[] = ["new", "contacted", "qualified", "proposal", "won", "lost"];

async function fetchReportData() {
  const supabase = getSupabase();
  const [leads, notes, clients] = await Promise.all([
    supabase
      .from("leads")
      .select("id,status,deleted_at,created_at,won_at,owner_id,source,utm_source,service_name,lost_reason,next_follow_up_at,services(name)")
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase.from("lead_notes").select("lead_id,kind,author_id,created_at").order("created_at", { ascending: true }).limit(20000),
    supabase.from("clients").select("id", { count: "exact", head: true }),
  ]);
  return {
    leads: (leads.data as unknown as ReportLead[] | null) ?? [],
    notes: (notes.data as ReportNote[] | null) ?? [],
    clientCount: clients.count ?? null,
    // Figures are relative to when the data was loaded.
    loadedAt: Date.now(),
    error: leads.error?.message ?? notes.error?.message ?? null,
  };
}

const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "—");

function hoursLabel(hours: number | null) {
  if (hours == null) return "—";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} days`;
}

export function ReportsWorkspace() {
  const { profile, team } = useAdmin();
  const allowed = canManageLeads(profile);
  const [period, setPeriod] = useState<PeriodId>("90");
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchReportData>> | null>(null);

  useEffect(() => {
    if (allowed) fetchReportData().then(setData);
  }, [allowed]);

  const report = useMemo(() => {
    if (!data) return null;
    const days = PERIODS.find((p) => p.id === period)?.days ?? null;
    const now = new Date(data.loadedAt);
    const since = days ? data.loadedAt - days * 86400000 : 0;
    // Trash and spam are left out of every figure.
    const leads = data.leads.filter((lead) => leadTab(lead) !== "trash" && new Date(lead.created_at).getTime() >= since);
    const won = leads.filter((lead) => lead.status === "won");
    const lost = leads.filter((lead) => lead.status === "lost");
    const open = leads.filter((lead) => !["won", "lost"].includes(lead.status));

    // First response: the first comment, call, email, meeting or status change by a teammate.
    const firstTouch = new Map<string, number>();
    for (const note of data.notes) {
      if (!note.author_id || note.kind === "system" || firstTouch.has(note.lead_id)) continue;
      firstTouch.set(note.lead_id, new Date(note.created_at).getTime());
    }
    const responseHours = leads
      .filter((lead) => firstTouch.has(lead.id))
      .map((lead) => ((firstTouch.get(lead.id) as number) - new Date(lead.created_at).getTime()) / 3600000)
      .filter((hours) => hours >= 0);
    const avgResponse = responseHours.length ? responseHours.reduce((a, b) => a + b, 0) / responseHours.length : null;

    const months: { key: string; label: string; total: number; won: number }[] = [];
    const span = days ? Math.min(12, Math.max(6, Math.ceil(days / 30))) : 12;
    for (let i = span - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }), total: 0, won: 0 });
    }
    for (const lead of data.leads) {
      if (leadTab(lead) === "trash") continue;
      const d = new Date(lead.created_at);
      const month = months.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (month) {
        month.total += 1;
        if (lead.status === "won") month.won += 1;
      }
    }

    const group = (keyOf: (lead: ReportLead) => string) => {
      const rows = new Map<string, { name: string; total: number; won: number; open: number }>();
      for (const lead of leads) {
        const name = keyOf(lead);
        const row = rows.get(name) ?? { name, total: 0, won: 0, open: 0 };
        row.total += 1;
        if (lead.status === "won") row.won += 1;
        if (!["won", "lost"].includes(lead.status)) row.open += 1;
        rows.set(name, row);
      }
      return [...rows.values()].sort((a, b) => b.total - a.total);
    };
    const names = new Map(team.map((member) => [member.id, member.full_name || member.email]));

    const lostReasons = new Map<string, number>();
    for (const lead of lost) {
      const reason = lead.lost_reason?.trim() || "No reason given";
      lostReasons.set(reason, (lostReasons.get(reason) ?? 0) + 1);
    }

    return {
      total: leads.length,
      won: won.length,
      lost: lost.length,
      open: open.length,
      overdue: data.leads.filter((lead) => followUpState(lead, now) === "overdue").length,
      avgResponse,
      responded: responseHours.length,
      months,
      funnel: FUNNEL.map((status) => ({ status, count: leads.filter((lead) => lead.status === status).length })),
      sources: group((lead) => lead.utm_source || lead.source || "Direct / untagged"),
      services: group((lead) => lead.services?.name || lead.service_name || "Not specified"),
      owners: group((lead) => (lead.owner_id && names.get(lead.owner_id)) || "Unassigned"),
      lostReasons: [...lostReasons.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [data, period, team]);

  if (!allowed) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <h1 className="text-xl font-bold">Reports are for admin and sales users</h1>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">Reports</h1>
          <p className="text-sm text-[#5b6b85]">How leads arrive, move and convert</p>
        </div>
        <div className="flex rounded-xl border border-[#d4dbe7] bg-white p-1" role="group" aria-label="Time range">
          {PERIODS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={period === option.id}
              onClick={() => setPeriod(option.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${period === option.id ? "bg-[#0b57d0] text-white" : "text-[#334155] hover:bg-[#f1f4f9]"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <UserMenu />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        {!data ? <p className="p-6 text-sm text-[#5b6b85]">Loading reports…</p> : null}
        {data?.error ? <p className="mb-4 rounded-xl bg-[#fdecec] p-4 text-sm text-[#a12020]">Couldn’t load everything: {data.error}</p> : null}
        {report ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <Stat label="Leads received" value={String(report.total)} />
              <Stat label="Won" value={String(report.won)} hint={`${report.lost} lost`} />
              <Stat label="Win rate" value={pct(report.won, report.won + report.lost)} hint="of closed leads" />
              <Stat label="Avg first response" value={hoursLabel(report.avgResponse)} hint={`${report.responded} leads answered`} />
              <Stat label="Open pipeline" value={String(report.open)} hint="New + in conversation" />
              <Stat label="Clients" value={data?.clientCount == null ? "—" : String(data.clientCount)} hint={`${report.overdue} follow-ups overdue`} />
            </div>

            <Panel title="Leads per month" subtitle="All stages except Trash. Hover a bar for details.">
              <MonthChart months={report.months} />
            </Panel>

            <div className="grid gap-5 xl:grid-cols-2">
              <Panel title="Pipeline" subtitle="Where leads from this period are now">
                <ul className="space-y-2.5">
                  {report.funnel.map(({ status, count }) => {
                    const max = Math.max(1, ...report.funnel.map((row) => row.count));
                    return (
                      <li key={status} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-3 text-sm">
                        <span className="text-[#334155]">{STATUS_LABELS[status]}</span>
                        <span className="h-3 rounded-r bg-[#eef2f8]">
                          <span className="block h-3 rounded-r" style={{ width: `${(count / max) * 100}%`, background: BAR }} title={`${STATUS_LABELS[status]}: ${count}`} />
                        </span>
                        <span className="text-right font-semibold tabular-nums">{count}</span>
                      </li>
                    );
                  })}
                </ul>
              </Panel>
              <Panel title="Lost reasons" subtitle="Why closed leads didn’t convert">
                {report.lostReasons.length ? (
                  <ul className="divide-y divide-[#e6ebf2] text-sm">
                    {report.lostReasons.map(([reason, count]) => (
                      <li key={reason} className="flex justify-between gap-4 py-2">
                        <span className="text-[#334155]">{reason}</span>
                        <span className="font-semibold tabular-nums">{count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#5b6b85]">No lost leads in this period.</p>
                )}
              </Panel>
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
              <Panel title="Sources" subtitle="UTM source, else the form source">
                <GroupTable rows={report.sources} firstColumn="Source" />
              </Panel>
              <Panel title="Services asked for">
                <GroupTable rows={report.services} firstColumn="Service" />
              </Panel>
              <Panel title="Team" subtitle="By assigned owner">
                <GroupTable rows={report.owners} firstColumn="Owner" />
              </Panel>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[#dfe5ef] bg-white p-4">
      <p className="text-xs font-semibold tracking-wide text-[#5b6b85] uppercase">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#5b6b85]">{hint}</p> : null}
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#dfe5ef] bg-white p-5">
      <h2 className="font-bold">{title}</h2>
      {subtitle ? <p className="text-xs text-[#5b6b85]">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MonthChart({ months }: { months: { key: string; label: string; total: number; won: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...months.map((month) => month.total));
  const ticks = [max, Math.round(max / 2), 0].filter((value, index, all) => all.indexOf(value) === index);
  const active = hover == null ? null : months[hover];

  return (
    <div>
      <div className="relative grid h-52 grid-cols-[2rem_1fr] gap-2">
        <div className="relative text-right text-[11px] text-[#8090a8] tabular-nums">
          {ticks.map((tick) => (
            <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - (tick / max) * 100}%` }}>
              {tick}
            </span>
          ))}
        </div>
        <div className="relative">
          {ticks.map((tick) => (
            <span key={tick} className="absolute inset-x-0 border-t border-[#eef2f8]" style={{ top: `${100 - (tick / max) * 100}%` }} />
          ))}
          <div className="relative flex h-full items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
            {months.map((month, index) => (
              <button
                key={month.key}
                type="button"
                aria-label={`${month.label}: ${month.total} leads, ${month.won} won`}
                onMouseEnter={() => setHover(index)}
                onFocus={() => setHover(index)}
                className="flex h-full flex-1 items-end justify-center"
              >
                <span
                  className="block w-full max-w-10 rounded-t-[4px]"
                  style={{ height: `${(month.total / max) * 100}%`, minHeight: month.total ? 4 : 0, background: BAR, opacity: hover == null || hover === index ? 1 : 0.45 }}
                />
              </button>
            ))}
          </div>
          {active ? (
            <div className="pointer-events-none absolute top-0 right-0 rounded-lg bg-[#0b1f3f] px-3 py-2 text-xs text-white shadow-lg">
              <p className="font-semibold">{active.label}</p>
              <p>
                {active.total} leads · {active.won} won
              </p>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-[2rem_1fr] gap-2">
        <span />
        <div className="flex gap-[2px] text-center text-[11px] text-[#8090a8]">
          {months.map((month) => (
            <span key={month.key} className="flex-1 truncate">
              {month.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GroupTable({ rows, firstColumn }: { rows: { name: string; total: number; won: number; open: number }[]; firstColumn: string }) {
  if (!rows.length) return <p className="text-sm text-[#5b6b85]">No leads in this period.</p>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-[#5b6b85] uppercase">
          <th className="pb-2 font-semibold">{firstColumn}</th>
          <th className="pb-2 text-right font-semibold">Leads</th>
          <th className="pb-2 text-right font-semibold">Open</th>
          <th className="pb-2 text-right font-semibold">Won</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#e6ebf2]">
        {rows.slice(0, 10).map((row) => (
          <tr key={row.name}>
            <td className="max-w-[12rem] truncate py-2 text-[#334155]" title={row.name}>
              {row.name}
            </td>
            <td className="py-2 text-right font-semibold tabular-nums">{row.total}</td>
            <td className="py-2 text-right tabular-nums">{row.open}</td>
            <td className="py-2 text-right tabular-nums">{row.won}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
