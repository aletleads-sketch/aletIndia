"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Avatar, useAdmin } from "@/components/admin/admin-shell";
import { ArrowLeftIcon, ChatIcon, ChevronDownIcon, DotsIcon, MailIcon, PaperclipIcon, PhoneIcon, XIcon } from "@/components/admin/icons";
import { AttachmentChip, AttachmentsPanel, fetchAttachments, removeLeadFiles, uploadLeadFiles } from "@/components/admin/lead-attachments";
import {
  fullDateTime,
  LEAD_COLUMNS,
  leadTab,
  NOTE_KIND_LABELS,
  NOTE_KINDS,
  phoneHref,
  STATUS_FLOW,
  STATUS_LABELS,
  toLocalInput,
  type Lead,
  type LeadAttachment,
  type LeadNote,
  type LeadStatus,
  type NoteKind,
} from "@/lib/leads";
import { clientFromLead } from "@/lib/clients";
import { getSupabase } from "@/lib/supabase-browser";

const STATUS_BADGE: Record<LeadStatus, string> = {
  new: "bg-[#e3ecfd] text-[#1a4fb8]",
  contacted: "bg-[#eceff4] text-[#334155]",
  qualified: "bg-[#e6f0ff] text-[#1f4f99]",
  proposal: "bg-[#fff4d6] text-[#8a5a00]",
  won: "bg-[#dcf5e4] text-[#1c7a3e]",
  lost: "bg-[#fde9d7] text-[#a4520f]",
  spam: "bg-[#fde4e4] text-[#c62828]",
};

type DetailTab = "overview" | "followups" | "attachments";

type LeadPatch = Partial<Lead> & { deleted_by?: string | null };

async function fetchNotes(leadId: string) {
  const { data, error } = await getSupabase()
    .from("lead_notes")
    .select("id,lead_id,author_id,author_name,kind,body,created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  return { notes: (data as LeadNote[] | null) ?? null, error: error?.message ?? null };
}

export function LeadDetail({
  lead,
  onBack,
  onChange,
  onEdit,
  onDeleted,
}: {
  lead: Lead;
  onBack: () => void;
  onChange: (lead: Lead) => void;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const { profile } = useAdmin();
  const supabase = getSupabase();
  const [tab, setTab] = useState<DetailTab>("followups");
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<LeadAttachment[]>([]);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [askLostReason, setAskLostReason] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const trashed = leadTab(lead) === "trash";

  const loadNotes = useCallback(async () => {
    const { notes: rows, error: loadError } = await fetchNotes(lead.id);
    setNotesError(loadError);
    if (rows) setNotes(rows);
  }, [lead.id]);

  const loadAttachments = useCallback(async () => {
    const { attachments: rows, error: loadError } = await fetchAttachments(lead.id);
    setAttachmentsError(loadError);
    if (rows) setAttachments(rows);
  }, [lead.id]);

  const update = useCallback(
    async (patch: LeadPatch) => {
      setError(null);
      const { data, error: updateError } = await supabase
        .from("leads")
        .update(patch)
        .eq("id", lead.id)
        .select(LEAD_COLUMNS)
        .single();
      if (updateError) {
        setError(updateError.message);
        return false;
      }
      onChange(data as unknown as Lead);
      void loadNotes();
      return true;
    },
    [lead.id, loadNotes, onChange, supabase],
  );

  useEffect(() => {
    fetchNotes(lead.id).then(({ notes: rows, error: loadError }) => {
      setNotesError(loadError);
      if (rows) setNotes(rows);
    });
    fetchAttachments(lead.id).then(({ attachments: rows, error: loadError }) => {
      setAttachmentsError(loadError);
      if (rows) setAttachments(rows);
    });
  }, [lead.id]);

  // A won lead links to the client it became.
  useEffect(() => {
    if (lead.status !== "won") return;
    supabase
      .from("clients")
      .select("id")
      .eq("lead_id", lead.id)
      .maybeSingle()
      .then(({ data }) => setClientId((data as { id: string } | null)?.id ?? null));
  }, [lead.id, lead.status, supabase]);

  async function convertToClient() {
    setConverting(true);
    setError(null);
    const { data, error: insertError } = await supabase.from("clients").insert(clientFromLead(lead, profile.id)).select("id").single();
    setConverting(false);
    if (insertError || !data) return setError(insertError?.message ?? "Couldn’t create the client.");
    setClientId((data as { id: string }).id);
    void loadNotes();
  }

  // Follow-ups and files added by teammates appear without a refresh.
  useEffect(() => {
    const channel = supabase
      .channel(`lead-${lead.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "lead_notes", filter: `lead_id=eq.${lead.id}` }, () => void loadNotes())
      .on("postgres_changes", { event: "*", schema: "public", table: "lead_attachments", filter: `lead_id=eq.${lead.id}` }, () => void loadAttachments())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [lead.id, loadAttachments, loadNotes, supabase]);

  // Opening a lead marks it as read for everyone.
  useEffect(() => {
    if (lead.first_viewed_at) return;
    supabase
      .from("leads")
      .update({ first_viewed_at: new Date().toISOString() })
      .eq("id", lead.id)
      .select(LEAD_COLUMNS)
      .single()
      .then(({ data }) => data && onChange(data as unknown as Lead));
  }, [lead.id, lead.first_viewed_at, onChange, supabase]);

  function changeStatus(status: LeadStatus) {
    if (status === lead.status) return;
    if (status === "lost") return setAskLostReason(true);
    void update({ status, lost_reason: null });
  }

  async function deleteForever() {
    if (!window.confirm(`Delete ${lead.full_name}'s lead, its follow-ups and files permanently? This can't be undone.`)) return;
    const fileError = await removeLeadFiles(attachments);
    if (fileError) return setError(fileError);
    const { error: deleteError } = await supabase.from("leads").delete().eq("id", lead.id);
    if (deleteError) return setError(deleteError.message);
    onDeleted();
  }

  const phone = phoneHref(lead);
  const noteCount = notes.filter((note) => note.kind !== "system" && note.kind !== "status_change").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-start gap-3 border-b border-[#e6ebf2] px-5 py-5 lg:px-7">
        <button type="button" onClick={onBack} aria-label="Back to list" className="mt-1 rounded-lg p-1 hover:bg-[#f1f4f9] lg:hidden">
          <ArrowLeftIcon />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="truncate text-xl font-extrabold tracking-tight lg:text-2xl">{lead.company_name || lead.full_name}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE[lead.status]}`}>{STATUS_LABELS[lead.status]}</span>
            {lead.deleted_at ? <span className="rounded-full bg-[#fde4e4] px-3 py-1 text-xs font-bold text-[#c62828]">In Trash</span> : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#334155]">
            {lead.company_name ? <span>{lead.full_name}</span> : null}
            <a href={`mailto:${lead.business_email}`} className="flex items-center gap-1.5 hover:text-[#1a63e8]">
              <MailIcon className="h-4 w-4" />
              {lead.business_email}
            </a>
            {phone ? (
              <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-[#1a63e8]">
                <PhoneIcon className="h-4 w-4" />
                {lead.phone_country_code} {lead.phone_number}
              </a>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {trashed ? (
            <button
              type="button"
              onClick={() => update({ deleted_at: null, ...(lead.status === "spam" ? { status: "new" as const } : {}) })}
              className="rounded-xl bg-[#0b57d0] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0a4bb5]"
            >
              Restore
            </button>
          ) : (
            <>
              {lead.status === "won" ? (
                clientId ? (
                  <Link href={`/admin/clients?client=${clientId}`} className="rounded-xl border border-[#1c8a43] px-4 py-2.5 text-sm font-semibold text-[#1c7a3e] hover:bg-[#eaf7ef]">
                    View client
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={converting}
                    onClick={convertToClient}
                    className="rounded-xl bg-[#1c8a43] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#177538] disabled:opacity-60"
                  >
                    {converting ? "Converting…" : "Convert to client"}
                  </button>
                )
              ) : null}
              <StatusMenu current={lead.status} onPick={changeStatus} />
            </>
          )}
          <MoreMenu>
            <MenuItem onClick={onEdit}>Edit details</MenuItem>
            <MenuItem onClick={() => void navigator.clipboard?.writeText(lead.business_email)}>Copy email</MenuItem>
            {phone ? (
              <MenuItem href={`https://wa.me/${phone.replace("+", "")}`}>Open WhatsApp</MenuItem>
            ) : null}
            {!lead.deleted_at ? (
              <MenuItem danger onClick={() => update({ deleted_at: new Date().toISOString(), deleted_by: profile.id })}>
                Move to Trash
              </MenuItem>
            ) : null}
            {trashed && profile.role === "admin" ? (
              <MenuItem danger onClick={deleteForever}>
                Delete permanently
              </MenuItem>
            ) : null}
          </MoreMenu>
        </div>
      </div>

      {error ? <p className="mx-5 mt-3 rounded-lg bg-[#fdecec] px-3 py-2 text-sm text-[#a12020] lg:mx-7">{error}</p> : null}

      <div className="flex gap-2 border-b border-[#e6ebf2] px-5 lg:px-7" role="tablist">
        <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>
          Overview
        </TabButton>
        <TabButton active={tab === "followups"} onClick={() => setTab("followups")}>
          Follow-ups ({noteCount})
        </TabButton>
        <TabButton active={tab === "attachments"} onClick={() => setTab("attachments")}>
          Attachments ({attachments.length})
        </TabButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "overview" ? <Overview lead={lead} onUpdate={update} /> : null}
        {tab === "followups" ? (
          <FollowUps
            lead={lead}
            notes={notes}
            attachments={attachments}
            error={notesError}
            onAdded={async () => {
              await Promise.all([loadNotes(), loadAttachments()]);
            }}
          />
        ) : null}
        {tab === "attachments" ? (
          <AttachmentsPanel
            leadId={lead.id}
            attachments={attachments}
            error={attachmentsError}
            onChanged={async () => {
              await Promise.all([loadNotes(), loadAttachments()]);
            }}
          />
        ) : null}
      </div>

      {askLostReason ? (
        <LostReasonDialog
          onCancel={() => setAskLostReason(false)}
          onConfirm={async (reason) => {
            if (await update({ status: "lost", lost_reason: reason || null })) setAskLostReason(false);
          }}
        />
      ) : null}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`-mb-px border-b-[3px] px-4 py-3.5 text-sm font-semibold ${active ? "border-[#0b57d0] text-[#0b57d0]" : "border-transparent text-[#334155] hover:text-[#0f1b33]"}`}
    >
      {children}
    </button>
  );
}

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);
  return { open, setOpen, ref };
}

function StatusMenu({ current, onPick }: { current: LeadStatus; onPick: (status: LeadStatus) => void }) {
  const { open, setOpen, ref } = usePopover();
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl bg-[#0b57d0] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0a4bb5]"
      >
        Change Status
        <ChevronDownIcon className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-[#dfe5ef] bg-white p-1.5 shadow-xl">
          {STATUS_FLOW.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setOpen(false);
                onPick(status);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f1f4f9] ${status === current ? "font-bold text-[#0b57d0]" : ""}`}
            >
              {STATUS_LABELS[status]}
              {status === "contacted" || status === "qualified" || status === "proposal" ? (
                <span className="text-[11px] text-[#8090a8]">In Conversation</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MoreMenu({ children }: { children: ReactNode }) {
  const { open, setOpen, ref } = usePopover();
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label="More actions" onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 hover:bg-[#f1f4f9]">
        <DotsIcon />
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-52 rounded-xl border border-[#dfe5ef] bg-white p-1.5 shadow-xl" onClick={() => setOpen(false)}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({ children, onClick, href, danger }: { children: ReactNode; onClick?: () => void; href?: string; danger?: boolean }) {
  const className = `block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f1f4f9] ${danger ? "text-[#c62828] hover:bg-[#fdecec]" : ""}`;
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function Overview({ lead, onUpdate }: { lead: Lead; onUpdate: (patch: LeadPatch) => Promise<boolean> }) {
  const { team } = useAdmin();
  const assignable = team.filter((member) => member.role === "admin" || member.role === "sales");
  // form_data mostly repeats the columns above (see lead-intake-secure); show only what's new.
  const repeated = new Set(["submitted_service", "submitted_budget", "submitted_timeline"]);
  const extra = Object.entries(lead.form_data ?? {}).filter(([key, value]) => !repeated.has(key) && value !== "" && value != null);

  return (
    <div className="grid gap-6 p-5 lg:grid-cols-2 lg:p-7">
      <Card title="Pipeline">
        <Field label="Priority">
          <select
            value={lead.priority}
            onChange={(event) => onUpdate({ priority: Number(event.target.value) })}
            className="rounded-lg border border-[#d4dbe7] px-2 py-1.5 text-sm"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} · {n === 5 ? "Highest" : n === 1 ? "Lowest" : n === 3 ? "Normal" : n > 3 ? "High" : "Low"}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Assigned to">
          <select
            value={lead.owner_id ?? ""}
            onChange={(event) => onUpdate({ owner_id: event.target.value || null })}
            className="max-w-[14rem] rounded-lg border border-[#d4dbe7] px-2 py-1.5 text-sm"
          >
            <option value="">Unassigned</option>
            {assignable.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name || member.email}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Next follow-up">
          <input
            type="datetime-local"
            defaultValue={toLocalInput(lead.next_follow_up_at)}
            onBlur={(event) => {
              const next = event.target.value ? new Date(event.target.value).toISOString() : null;
              if (next !== lead.next_follow_up_at) void onUpdate({ next_follow_up_at: next });
            }}
            className="rounded-lg border border-[#d4dbe7] px-2 py-1.5 text-sm"
          />
        </Field>
        <Field label="Received">{fullDateTime(lead.created_at)}</Field>
        {lead.won_at ? <Field label="Won on">{fullDateTime(lead.won_at)}</Field> : null}
        {lead.lost_reason ? <Field label="Lost reason">{lead.lost_reason}</Field> : null}
      </Card>

      <Card title="Contact">
        <Field label="Name">{lead.full_name}</Field>
        <Field label="Company">{lead.company_name}</Field>
        <Field label="Email">{lead.business_email}</Field>
        <Field label="Phone">{lead.phone_number ? `${lead.phone_country_code ?? ""} ${lead.phone_number}` : null}</Field>
        <Field label="Country">{lead.country}</Field>
      </Card>

      <Card title="Project">
        <Field label="Service">{lead.services?.name || lead.service_name}</Field>
        <Field label="Budget">{lead.budget_range}</Field>
        <Field label="Expected start">{lead.expected_start}</Field>
        <div className="pt-2">
          <p className="text-xs font-semibold tracking-wide text-[#5b6b85] uppercase">Details</p>
          <p className="mt-1 text-sm leading-6 whitespace-pre-wrap">{lead.project_details || "—"}</p>
        </div>
      </Card>

      <Card title="Source & tracking">
        <Field label="Source">{lead.source}</Field>
        <Field label="Landing page">{lead.landing_page}</Field>
        <Field label="UTM source">{lead.utm_source}</Field>
        <Field label="UTM medium">{lead.utm_medium}</Field>
        <Field label="UTM campaign">{lead.utm_campaign}</Field>
        {extra.map(([key, value]) => (
          <Field key={key} label={key}>
            {typeof value === "string" ? value : JSON.stringify(value)}
          </Field>
        ))}
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-[#e6ebf2] p-5">
      <h3 className="mb-3 text-sm font-bold">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="shrink-0 text-[#5b6b85]">{label}</span>
      <span className="min-w-0 text-right break-words">{children || "—"}</span>
    </div>
  );
}

function FollowUps({
  lead,
  notes,
  attachments,
  error,
  onAdded,
}: {
  lead: Lead;
  notes: LeadNote[];
  attachments: LeadAttachment[];
  error: string | null;
  onAdded: () => Promise<void>;
}) {
  const { profile, team } = useAdmin();
  const [kind, setKind] = useState<NoteKind>("comment");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const names = new Map(team.map((member) => [member.id, member.full_name || member.email.split("@")[0]]));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = body.trim() || (files.length ? `Shared ${files.length === 1 ? files[0].name : `${files.length} files`}` : "");
    if (!text) return;
    setBusy(true);
    setSaveError(null);
    const { data: note, error: insertError } = await getSupabase()
      .from("lead_notes")
      .insert({
        lead_id: lead.id,
        author_id: profile.id,
        kind,
        body: text,
        author_name: kind === "client_reply" ? lead.full_name : null,
      })
      .select("id")
      .single();
    if (insertError || !note) {
      setBusy(false);
      return setSaveError(insertError?.message ?? "Couldn’t add the follow-up.");
    }
    const uploadErrors = files.length ? await uploadLeadFiles(lead.id, profile.id, files, note.id) : [];
    setBusy(false);
    setSaveError(uploadErrors.length ? uploadErrors.join(" ") : null);
    setBody("");
    setKind("comment");
    setFiles([]);
    await onAdded();
  }

  return (
    <div className="flex min-h-full flex-col">
      <ol className="flex-1 px-5 py-5 lg:px-7">
        {error ? <li className="text-sm text-[#a12020]">{error}</li> : null}
        {!error && !notes.length ? <li className="py-6 text-center text-sm text-[#5b6b85]">No follow-ups yet. Add the first one below.</li> : null}
        {notes.map((note, index) => {
          const last = index === notes.length - 1;
          const automatic = note.kind === "status_change" || note.kind === "system";
          const staffName = (note.author_id && names.get(note.author_id)) || (note.author_id ? "Team member" : "System");
          const name = note.kind === "client_reply" ? `${note.author_name || lead.full_name} (Client)` : staffName;
          return (
            <li key={note.id} className="relative flex gap-4 pb-5">
              <span className="relative flex w-3 shrink-0 justify-center">
                <span className={`mt-4 h-2.5 w-2.5 rounded-full ${index === 0 ? "bg-[#0b57d0]" : "bg-[#9aa7bc]"}`} />
                {!last ? <span className="absolute top-7 bottom-[-0.5rem] w-px bg-[#d4dbe7]" /> : null}
              </span>
              {automatic ? (
                <p className="pt-3 text-sm text-[#5b6b85]">
                  <span className="font-semibold text-[#334155]">{staffName}</span> · {note.body}
                  <span className="ml-2 text-xs">{fullDateTime(note.created_at)}</span>
                </p>
              ) : (
                <div className="flex min-w-0 flex-1 gap-3">
                  <Avatar name={note.kind === "client_reply" ? note.author_name || lead.full_name : staffName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-3 text-sm">
                      <span className="font-bold">{name}</span>
                      <span className="text-xs text-[#5b6b85]">{fullDateTime(note.created_at)}</span>
                      {note.kind !== "comment" ? (
                        <span className="rounded-full bg-[#eef2f8] px-2 py-0.5 text-[11px] font-semibold text-[#334155]">{NOTE_KIND_LABELS[note.kind]}</span>
                      ) : null}
                    </p>
                    <p className={`mt-1.5 rounded-lg px-3.5 py-2.5 text-sm leading-6 whitespace-pre-wrap ${note.kind === "client_reply" ? "bg-[#eaf7ef]" : "bg-[#eaf1fd]"}`}>
                      {note.body}
                    </p>
                    {attachments.some((file) => file.note_id === note.id) ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {attachments
                          .filter((file) => file.note_id === note.id)
                          .map((file) => (
                            <AttachmentChip key={file.id} file={file} />
                          ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <form onSubmit={submit} className="sticky bottom-0 border-t border-[#e6ebf2] bg-white px-5 py-4 lg:px-7">
        {saveError ? <p className="mb-2 text-sm text-[#a12020]">{saveError}</p> : null}
        {files.length ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <span key={`${file.name}-${index}`} className="inline-flex items-center gap-1.5 rounded-lg bg-[#eef2f8] px-2.5 py-1 text-xs">
                <PaperclipIcon className="h-3.5 w-3.5" />
                {file.name}
                <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}>
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as NoteKind)}
            aria-label="Follow-up type"
            className="rounded-xl border border-[#d4dbe7] px-3 py-3 text-sm"
          >
            {NOTE_KINDS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="flex min-w-[12rem] flex-1 items-center gap-2 rounded-xl border border-[#d4dbe7] px-3 py-3">
            <ChatIcon className="h-4 w-4 text-[#5b6b85]" />
            <input
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={kind === "client_reply" ? `What did ${lead.full_name} say?` : "Add a follow-up comment…"}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button type="button" aria-label="Attach files" title="Attach files" onClick={() => fileInput.current?.click()} className="text-[#5b6b85] hover:text-[#1a63e8]">
              <PaperclipIcon className="h-4 w-4" />
            </button>
            <input
              ref={fileInput}
              type="file"
              multiple
              hidden
              onChange={(event) => {
                const picked = Array.from(event.target.files ?? []);
                setFiles((current) => [...current, ...picked]);
                event.target.value = "";
              }}
            />
          </label>
          <button
            type="submit"
            disabled={busy || (!body.trim() && !files.length)}
            className="rounded-xl bg-[#0b57d0] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0a4bb5] disabled:opacity-50"
          >
            {busy ? "Adding…" : "Add Comment"}
          </button>
        </div>
      </form>
    </div>
  );
}

function LostReasonDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/40 p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm(reason.trim());
        }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h3 className="text-lg font-bold">Mark lead as lost</h3>
        <p className="mt-1 text-sm text-[#5b6b85]">Why was it lost? This helps the team spot patterns.</p>
        <textarea
          autoFocus
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          placeholder="e.g. Budget too low, chose another vendor, no response"
          className="mt-4 w-full rounded-lg border border-[#d4dbe7] px-3 py-2 text-sm"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#f1f4f9]">
            Cancel
          </button>
          <button type="submit" className="rounded-lg bg-[#a4520f] px-4 py-2 text-sm font-semibold text-white">
            Mark as lost
          </button>
        </div>
      </form>
    </div>
  );
}
