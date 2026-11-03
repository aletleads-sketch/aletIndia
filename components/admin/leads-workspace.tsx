"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { canManageLeads, UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { LeadDetail } from "@/components/admin/lead-detail";
import { LeadForm } from "@/components/admin/lead-form";
import { ChatIcon, ChevronDownIcon, ClockIcon, PlusIcon, SearchIcon, TrashIcon, TrophyIcon, UsersIcon, XCircleIcon } from "@/components/admin/icons";
import {
  followUpState,
  LEAD_COLUMNS,
  LEAD_SORTS,
  LEAD_TABS,
  leadTab,
  listTime,
  matchesSearch,
  sortLeads,
  type Lead,
  type LeadSort,
  type LeadTab,
} from "@/lib/leads";
import { getSupabase } from "@/lib/supabase-browser";

const TAB_STYLE: Record<LeadTab, { icon: typeof UsersIcon; tone: string; badge: string }> = {
  new: { icon: UsersIcon, tone: "text-[#1a63e8]", badge: "bg-[#e3ecfd] text-[#1a4fb8]" },
  conversation: { icon: ChatIcon, tone: "text-[#334155]", badge: "bg-[#eceff4] text-[#334155]" },
  won: { icon: TrophyIcon, tone: "text-[#1c8a43]", badge: "bg-[#dcf5e4] text-[#1c7a3e]" },
  lost: { icon: XCircleIcon, tone: "text-[#a4520f]", badge: "bg-[#fde9d7] text-[#a4520f]" },
  trash: { icon: TrashIcon, tone: "text-[#d32f2f]", badge: "bg-[#fde4e4] text-[#c62828]" },
};

async function fetchLeads() {
  const { data, error } = await getSupabase()
    .from("leads")
    .select(LEAD_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(1000);
  return { rows: (data as unknown as Lead[] | null) ?? null, error: error?.message ?? null };
}

/** Reads `?lead=<id>` once so a lead can be linked to directly. */
function initialLeadId() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("lead");
}

export function LeadsWorkspace() {
  const { profile } = useAdmin();
  const allowed = canManageLeads(profile);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<LeadTab>("new");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<LeadSort>("latest");
  const [selectedId, setSelectedId] = useState<string | null>(initialLeadId);
  const [form, setForm] = useState<{ mode: "add" } | { mode: "edit"; lead: Lead } | null>(null);
  // "Follow-ups due" shows every open lead due today or overdue, across the stage tabs.
  const [dueOnly, setDueOnly] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ids already in the list, so a live INSERT can tell a brand-new lead from our own echo.
  const knownIds = useRef(new Set<string>());

  useEffect(() => {
    knownIds.current = new Set(leads.map((lead) => lead.id));
  }, [leads]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }, []);

  const applyRows = useCallback((rows: Lead[] | null, loadError: string | null) => {
    setLoading(false);
    if (loadError) return setError(loadError);
    setError(null);
    setLeads(rows ?? []);
    // Opened from a `?lead=` link: show the tab that lead lives in.
    const linked = rows?.find((lead) => lead.id === initialLeadId());
    if (linked) setTab(leadTab(linked));
  }, []);

  useEffect(() => {
    if (!allowed) return;
    fetchLeads().then(({ rows, error: loadError }) => applyRows(rows, loadError));
  }, [allowed, applyRows]);

  // Live updates: new website enquiries and teammates' changes appear without a refresh.
  useEffect(() => {
    if (!allowed) return;
    const supabase = getSupabase();
    const channel = supabase
      .channel("leads-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, async (payload) => {
        if (payload.eventType === "DELETE") {
          const id = (payload.old as { id?: string }).id;
          if (id) setLeads((current) => current.filter((lead) => lead.id !== id));
          return;
        }
        const id = (payload.new as { id: string }).id;
        const { data } = await supabase.from("leads").select(LEAD_COLUMNS).eq("id", id).maybeSingle();
        if (!data) return;
        const row = data as unknown as Lead;
        const isNew = !knownIds.current.has(row.id);
        knownIds.current.add(row.id);
        setLeads((current) =>
          current.some((lead) => lead.id === row.id)
            ? current.map((lead) => (lead.id === row.id ? row : lead))
            : [row, ...current],
        );
        if (isNew && payload.eventType === "INSERT" && row.owner_id !== profile.id) {
          showToast(`New lead: ${row.company_name || row.full_name}`);
        }
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [allowed, profile.id, showToast]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedId) url.searchParams.set("lead", selectedId);
    else url.searchParams.delete("lead");
    window.history.replaceState(null, "", url);
  }, [selectedId]);

  const counts = useMemo(() => {
    const result: Record<LeadTab, number> = { new: 0, conversation: 0, won: 0, lost: 0, trash: 0 };
    for (const lead of leads) result[leadTab(lead)] += 1;
    return result;
  }, [leads]);

  const dueCount = useMemo(() => leads.filter((lead) => {
    const state = followUpState(lead);
    return state === "overdue" || state === "today";
  }).length, [leads]);

  const visible = useMemo(() => {
    const inView = (lead: Lead) => {
      if (query) return true;
      if (dueOnly) {
        const state = followUpState(lead);
        return state === "overdue" || state === "today";
      }
      return leadTab(lead) === tab;
    };
    const rows = leads.filter((lead) => inView(lead) && matchesSearch(lead, query) && (!mineOnly || lead.owner_id === profile.id));
    return sortLeads(rows, dueOnly && !query ? "follow_up" : sort);
  }, [leads, tab, query, sort, dueOnly, mineOnly, profile.id]);

  const selected = leads.find((lead) => lead.id === selectedId) ?? null;

  const replaceLead = useCallback((next: Lead) => {
    setLeads((current) => current.map((lead) => (lead.id === next.id ? next : lead)));
  }, []);

  if (!allowed) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold">Leads are for admin and sales users</h1>
          <p className="mt-2 text-sm text-[#5b6b85]">Your role is “{profile.role}”. Ask an admin to change it if you need lead access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">Leads</h1>
          <p className="text-sm text-[#5b6b85]">Manage and track all your business leads</p>
        </div>
        <label className="order-last flex w-full items-center gap-2 rounded-xl border border-[#d4dbe7] bg-white px-3 py-2.5 md:order-none md:w-80">
          <SearchIcon className="h-4 w-4 text-[#5b6b85]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search leads (name, company, email)"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setDueOnly((on) => !on);
          }}
          aria-pressed={dueOnly}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${dueOnly ? "border-[#d97706] bg-[#fff7e6] text-[#8a5a00]" : "border-[#d4dbe7] bg-white hover:border-[#b9c6db]"}`}
        >
          <ClockIcon className="h-4 w-4" />
          Follow-ups due
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${dueCount ? "bg-[#d97706] text-white" : "bg-[#eceff4] text-[#334155]"}`}>{dueCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setForm({ mode: "add" })}
          className="flex items-center gap-2 rounded-xl bg-[#0b57d0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0a4bb5]"
        >
          <PlusIcon className="h-4 w-4" />
          Add Lead
        </button>
        <UserMenu />
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:p-6">
        <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {LEAD_TABS.map(({ id, label }) => {
            const { icon: Icon, tone, badge } = TAB_STYLE[id];
            const active = !query && !dueOnly && tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setQuery("");
                  setDueOnly(false);
                  setTab(id);
                }}
                className={`flex items-center justify-center gap-3 rounded-xl border bg-white px-4 py-3.5 text-sm font-semibold transition ${active ? "border-[#1a63e8] bg-[#f3f7ff] ring-1 ring-[#1a63e8]" : "border-[#dfe5ef] hover:border-[#b9c6db]"}`}
              >
                <Icon className={`h-5 w-5 ${tone}`} />
                {label}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badge}`}>{counts[id]}</span>
              </button>
            );
          })}
        </div>

        {error ? (
          <p className="rounded-xl border border-[#f3c2c2] bg-[#fdecec] p-4 text-sm text-[#a12020]">
            Couldn’t load leads: {error}
          </p>
        ) : null}

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(18rem,24rem)_1fr]">
          <section className={`flex min-h-0 flex-col rounded-2xl border border-[#dfe5ef] bg-white ${selected ? "hidden lg:flex" : "flex"}`}>
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="font-bold">
                {visible.length} {query ? "results" : dueOnly ? "due" : visible.length === 1 ? "Lead" : "Leads"}
              </h2>
              <label className="ml-auto mr-4 flex cursor-pointer items-center gap-1.5 text-sm text-[#5b6b85]">
                <input type="checkbox" checked={mineOnly} onChange={(event) => setMineOnly(event.target.checked)} className="h-4 w-4 accent-[#0b57d0]" />
                Mine
              </label>
              <label className={`flex items-center gap-1 text-sm text-[#5b6b85] ${dueOnly && !query ? "hidden" : ""}`}>
                Sort:
                <span className="relative">
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as LeadSort)}
                    className="appearance-none bg-transparent pr-5 font-semibold text-[#0f1b33] outline-none"
                  >
                    {LEAD_SORTS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute top-0.5 right-0 h-4 w-4" />
                </span>
              </label>
            </div>
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
              {loading ? <li className="p-5 text-sm text-[#5b6b85]">Loading leads…</li> : null}
              {!loading && !visible.length ? (
                <li className="p-5 text-sm text-[#5b6b85]">
                  {query ? "No leads match your search." : dueOnly ? "Nothing due today. Nice work." : "No leads here yet."}
                </li>
              ) : null}
              {visible.map((lead) => {
                const when = listTime(lead.created_at);
                const active = lead.id === selectedId;
                const due = followUpState(lead);
                return (
                  <li key={lead.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(lead.id)}
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${active ? "bg-[#e6eefc]" : "hover:bg-[#f4f7fb]"}`}
                    >
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${lead.first_viewed_at ? "bg-[#c3cad6]" : "bg-[#1a63e8]"}`}
                        title={lead.first_viewed_at ? "Opened" : "Not opened yet"}
                      />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate ${lead.first_viewed_at ? "font-semibold" : "font-extrabold"}`}>
                          {lead.company_name || lead.full_name}
                        </span>
                        <span className="block truncate text-sm text-[#5b6b85]">
                          {lead.company_name ? lead.full_name : lead.business_email}
                        </span>
                        {due === "overdue" || due === "today" ? (
                          <span
                            className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${due === "overdue" ? "bg-[#fde4e4] text-[#c62828]" : "bg-[#fff4d6] text-[#8a5a00]"}`}
                          >
                            <ClockIcon className="h-3 w-3" />
                            {due === "overdue" ? "Overdue" : "Due today"} · {listTime(lead.next_follow_up_at as string).day === "Today" ? listTime(lead.next_follow_up_at as string).time : listTime(lead.next_follow_up_at as string).day}
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-right text-xs text-[#5b6b85]">
                        <span className="block">{when.day}</span>
                        <span className="block">{when.time}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={`min-h-0 rounded-2xl border border-[#dfe5ef] bg-white ${selected ? "flex" : "hidden lg:flex"} flex-col`}>
            {selected ? (
              <LeadDetail
                key={selected.id}
                lead={selected}
                onBack={() => setSelectedId(null)}
                onChange={replaceLead}
                onEdit={() => setForm({ mode: "edit", lead: selected })}
                onDeleted={() => {
                  setLeads((current) => current.filter((lead) => lead.id !== selected.id));
                  setSelectedId(null);
                }}
              />
            ) : (
              <div className="grid flex-1 place-items-center p-8 text-center text-sm text-[#5b6b85]">
                Select a lead to see its details and follow-ups.
              </div>
            )}
          </section>
        </div>
      </div>

      {toast ? (
        <div role="status" className="fixed right-6 bottom-6 z-[130] rounded-xl bg-[#0b1f3f] px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      ) : null}

      {form ? (
        <LeadForm
          lead={form.mode === "edit" ? form.lead : null}
          onClose={() => setForm(null)}
          onSaved={(saved) => {
            setForm(null);
            if (form.mode === "add") {
              setLeads((current) => [saved, ...current]);
              setQuery("");
              setTab("new");
            } else {
              replaceLead(saved);
            }
            setSelectedId(saved.id);
          }}
        />
      ) : null}
    </div>
  );
}
