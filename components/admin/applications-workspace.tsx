"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Avatar, UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { ArrowLeftIcon, MailIcon, PhoneIcon, SearchIcon } from "@/components/admin/icons";
import { fullDateTime, listTime } from "@/lib/leads";
import { getSupabase } from "@/lib/supabase-browser";

/** A job application sent from the Careers page (table job_applications). */
type Application = {
  id: string;
  job_title: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  experience: string | null;
  notice_period: string | null;
  portfolio_url: string | null;
  message: string | null;
  resume_path: string | null;
  resume_name: string | null;
  status: ApplicationStatus;
  notes: string | null;
  viewed_at: string | null;
  created_at: string;
};
type ApplicationStatus = "new" | "shortlisted" | "interview" | "hired" | "rejected";

const STATUSES: { id: ApplicationStatus; label: string; tone: string }[] = [
  { id: "new", label: "New", tone: "bg-[#e6eefc] text-[#1a4fb0]" },
  { id: "shortlisted", label: "Shortlisted", tone: "bg-[#fff4dc] text-[#8a5a00]" },
  { id: "interview", label: "Interview", tone: "bg-[#efe8fd] text-[#5b34b8]" },
  { id: "hired", label: "Hired", tone: "bg-[#eaf7ef] text-[#1c7a3e]" },
  { id: "rejected", label: "Rejected", tone: "bg-[#eceff4] text-[#5b6b85]" },
];
const statusOf = (id: ApplicationStatus) => STATUSES.find((status) => status.id === id) ?? STATUSES[0];

const COLUMNS =
  "id,job_title,full_name,email,phone,city,experience,notice_period,portfolio_url,message,resume_path,resume_name,status,notes,viewed_at,created_at";

function initialId() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("application");
}

export function ApplicationsWorkspace() {
  const { profile } = useAdmin();
  const allowed = profile.role === "admin";
  const [rows, setRows] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [job, setJob] = useState("");
  const [status, setStatus] = useState<"" | ApplicationStatus>("");
  const [selectedId, setSelectedId] = useState<string | null>(initialId);

  useEffect(() => {
    if (!allowed) return;
    getSupabase()
      .from("job_applications")
      .select(COLUMNS)
      .order("created_at", { ascending: false })
      .limit(1000)
      .then(({ data, error: loadError }) => {
        setLoading(false);
        setError(loadError?.message ?? null);
        if (data) setRows(data as unknown as Application[]);
      });
  }, [allowed]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedId) url.searchParams.set("application", selectedId);
    else url.searchParams.delete("application");
    window.history.replaceState(null, "", url);
  }, [selectedId]);

  const jobs = useMemo(() => [...new Set(rows.map((row) => row.job_title))].sort(), [rows]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (row) =>
        (!job || row.job_title === job) &&
        (!status || row.status === status) &&
        (!q || [row.full_name, row.email, row.phone, row.city, row.job_title].some((value) => value?.toLowerCase().includes(q))),
    );
  }, [rows, query, job, status]);
  const selected = rows.find((row) => row.id === selectedId) ?? null;
  const replace = (next: Application) => setRows((current) => current.map((row) => (row.id === next.id ? next : row)));

  if (!allowed) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold">Job applications are for admin users</h1>
          <p className="mt-2 text-sm text-[#5b6b85]">Your role is “{profile.role}”.</p>
        </div>
      </div>
    );
  }

  const select = "rounded-xl border border-[#d4dbe7] bg-white px-3 py-2.5 text-sm";
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">Job applications</h1>
          <p className="text-sm text-[#5b6b85]">Applications sent from the Careers page</p>
        </div>
        <label className="order-last flex w-full items-center gap-2 rounded-xl border border-[#d4dbe7] bg-white px-3 py-2.5 md:order-none md:w-72">
          <SearchIcon className="h-4 w-4 text-[#5b6b85]" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, phone, city" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
        <select value={job} onChange={(event) => setJob(event.target.value)} aria-label="Filter by job" className={select}>
          <option value="">All jobs</option>
          {jobs.map((title) => (
            <option key={title}>{title}</option>
          ))}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value as "" | ApplicationStatus)} aria-label="Filter by status" className={select}>
          <option value="">All statuses</option>
          {STATUSES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <UserMenu />
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:p-6">
        {error ? <p className="rounded-xl border border-[#f3c2c2] bg-[#fdecec] p-4 text-sm text-[#a12020]">Couldn’t load applications: {error}</p> : null}
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(18rem,26rem)_1fr]">
          <section className={`flex min-h-0 flex-col rounded-2xl border border-[#dfe5ef] bg-white ${selected ? "hidden lg:flex" : "flex"}`}>
            <h2 className="px-5 py-4 font-bold">
              {visible.length} {visible.length === 1 ? "Application" : "Applications"}
            </h2>
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
              {loading ? <li className="p-5 text-sm text-[#5b6b85]">Loading applications…</li> : null}
              {!loading && !visible.length ? (
                <li className="p-5 text-sm text-[#5b6b85]">{rows.length ? "No applications match these filters." : "No applications yet. They appear here when someone applies on the Careers page."}</li>
              ) : null}
              {visible.map((row) => {
                const when = listTime(row.created_at);
                const tone = statusOf(row.status);
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(row.id)}
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${row.id === selectedId ? "bg-[#e6eefc]" : "hover:bg-[#f4f7fb]"}`}
                    >
                      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${row.viewed_at ? "bg-[#c3cad6]" : "bg-[#1a63e8]"}`} title={row.viewed_at ? "Opened" : "Not opened yet"} />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate ${row.viewed_at ? "font-semibold" : "font-extrabold"}`}>{row.full_name}</span>
                        <span className="block truncate text-sm text-[#5b6b85]">{row.job_title}</span>
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.tone}`}>{tone.label}</span>
                      </span>
                      <span className="shrink-0 text-right text-xs text-[#5b6b85]">
                        {when.day}
                        <br />
                        {when.time}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={`min-h-0 flex-col overflow-y-auto rounded-2xl border border-[#dfe5ef] bg-white ${selected ? "flex" : "hidden lg:flex"}`}>
            {selected ? (
              <ApplicationDetail
                key={selected.id}
                application={selected}
                onBack={() => setSelectedId(null)}
                onChange={replace}
                onDeleted={() => {
                  setRows((current) => current.filter((row) => row.id !== selected.id));
                  setSelectedId(null);
                }}
              />
            ) : (
              <div className="grid flex-1 place-items-center p-8 text-center text-sm text-[#5b6b85]">Choose an application to see the details and the resume.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function ApplicationDetail({
  application,
  onBack,
  onChange,
  onDeleted,
}: {
  application: Application;
  onBack: () => void;
  onChange: (next: Application) => void;
  onDeleted: () => void;
}) {
  const supabase = getSupabase();
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState(application.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [opening, setOpening] = useState(false);

  const update = async (patch: Partial<Application>) => {
    setError(null);
    const { data, error: updateError } = await supabase.from("job_applications").update(patch).eq("id", application.id).select(COLUMNS).single();
    if (updateError) {
      setError(updateError.message);
      return false;
    }
    onChange(data as unknown as Application);
    return true;
  };

  // Opening an application marks it as seen (the blue dot in the list goes grey).
  useEffect(() => {
    if (application.viewed_at) return;
    void supabase
      .from("job_applications")
      .update({ viewed_at: new Date().toISOString() })
      .eq("id", application.id)
      .select(COLUMNS)
      .single()
      .then(({ data }) => data && onChange(data as unknown as Application));
  }, [application.id, application.viewed_at, onChange, supabase]);

  const openResume = async () => {
    if (!application.resume_path) return;
    // Resumes are private: open a link that works for 5 minutes.
    const tab = window.open("", "_blank");
    setOpening(true);
    const { data, error: linkError } = await supabase.storage.from("job-applications").createSignedUrl(application.resume_path, 300);
    setOpening(false);
    if (linkError || !data) {
      tab?.close();
      return setError(linkError?.message ?? "Couldn’t open the resume.");
    }
    if (tab) {
      tab.opener = null;
      tab.location.href = data.signedUrl;
    } else window.open(data.signedUrl, "_blank", "noopener");
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${application.full_name}'s application and resume permanently? This can't be undone.`)) return;
    if (application.resume_path) await supabase.storage.from("job-applications").remove([application.resume_path]);
    const { error: deleteError } = await supabase.from("job_applications").delete().eq("id", application.id);
    if (deleteError) return setError(deleteError.message);
    onDeleted();
  };

  const phoneDigits = application.phone?.replace(/[^\d+]/g, "") ?? "";
  return (
    <div className="flex flex-col">
      <div className="border-b border-[#e6ebf2] px-5 py-5 lg:px-7">
        <button type="button" onClick={onBack} className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[#1a63e8] lg:hidden">
          <ArrowLeftIcon className="h-4 w-4" /> Back to list
        </button>
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={application.full_name} />
          <div className="mr-auto min-w-0">
            <h2 className="text-2xl font-extrabold tracking-tight">{application.full_name}</h2>
            <p className="text-sm text-[#5b6b85]">Applied for {application.job_title} · {fullDateTime(application.created_at)}</p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#334155]">
              <a href={`mailto:${application.email}`} className="flex items-center gap-1.5 hover:text-[#1a63e8]">
                <MailIcon className="h-4 w-4" /> {application.email}
              </a>
              {application.phone ? (
                <a href={`tel:${phoneDigits}`} className="flex items-center gap-1.5 hover:text-[#1a63e8]">
                  <PhoneIcon className="h-4 w-4" /> {application.phone}
                </a>
              ) : null}
            </div>
          </div>
          <select
            value={application.status}
            onChange={(event) => void update({ status: event.target.value as ApplicationStatus })}
            aria-label="Status"
            className="rounded-xl border border-[#d4dbe7] bg-white px-3 py-2.5 text-sm font-semibold"
          >
            {STATUSES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="mx-5 mt-3 rounded-lg bg-[#fdecec] px-3 py-2 text-sm text-[#a12020] lg:mx-7">{error}</p> : null}

      <div className="grid gap-5 px-5 py-5 lg:px-7">
        <Box title="Resume">
          {application.resume_path ? (
            <button type="button" onClick={() => void openResume()} disabled={opening} className="rounded-xl bg-[#0b57d0] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0a4bb5] disabled:opacity-60">
              {opening ? "Opening…" : `Open ${application.resume_name ?? "resume"}`}
            </button>
          ) : (
            <p className="text-sm text-[#5b6b85]">No resume attached.</p>
          )}
        </Box>
        <Box title="Details">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Item label="Current city">{application.city}</Item>
            <Item label="Total experience">{application.experience}</Item>
            <Item label="Notice period">{application.notice_period}</Item>
            <Item label="LinkedIn / Portfolio">
              {application.portfolio_url ? (
                <a href={application.portfolio_url} target="_blank" rel="noreferrer noopener" className="break-all text-[#1a63e8] hover:underline">
                  {application.portfolio_url}
                </a>
              ) : null}
            </Item>
          </dl>
        </Box>
        {application.message ? (
          <Box title="Why they are interested">
            <p className="text-sm leading-6 whitespace-pre-wrap">{application.message}</p>
          </Box>
        ) : null}
        <Box title="Team notes">
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Interview feedback, salary expectations, next steps…" className="w-full rounded-lg border border-[#d4dbe7] px-3 py-2 text-sm" />
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              disabled={savingNotes || notes === (application.notes ?? "")}
              onClick={async () => {
                setSavingNotes(true);
                await update({ notes: notes.trim() || null });
                setSavingNotes(false);
              }}
              className="rounded-lg bg-[#0b57d0] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {savingNotes ? "Saving…" : "Save notes"}
            </button>
          </div>
        </Box>
        <div>
          <button type="button" onClick={() => void remove()} className="text-sm font-semibold text-[#a12020] hover:underline">
            Delete application
          </button>
        </div>
      </div>
    </div>
  );
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#e3e8f1] p-4">
      <h3 className="mb-3 text-sm font-bold text-[#334155]">{title}</h3>
      {children}
    </section>
  );
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-[#5b6b85]">{label}</dt>
      <dd className="mt-0.5">{children || <span className="text-[#9aa3b5]">—</span>}</dd>
    </div>
  );
}
