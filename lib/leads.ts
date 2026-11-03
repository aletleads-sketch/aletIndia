export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost" | "spam";
export type AppRole = "admin" | "sales" | "marketing" | "editor";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  active: boolean;
};

export type Lead = {
  id: string;
  full_name: string;
  company_name: string | null;
  business_email: string;
  phone_country_code: string | null;
  phone_number: string | null;
  country: string | null;
  service_id: string | null;
  service_name: string | null;
  budget_range: string | null;
  expected_start: string | null;
  project_details: string | null;
  form_data: Record<string, unknown> | null;
  status: LeadStatus;
  priority: number;
  owner_id: string | null;
  next_follow_up_at: string | null;
  source: string | null;
  landing_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  lost_reason: string | null;
  won_at: string | null;
  deleted_at: string | null;
  first_viewed_at: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  services: { name: string } | null;
};

export const LEAD_COLUMNS =
  "id,full_name,company_name,business_email,phone_country_code,phone_number,country,service_id,service_name,budget_range,expected_start,project_details,form_data,status,priority,owner_id,next_follow_up_at,source,landing_page,utm_source,utm_medium,utm_campaign,lost_reason,won_at,deleted_at,first_viewed_at,last_activity_at,created_at,updated_at,services(name)";

export type NoteKind = "comment" | "call" | "email" | "meeting" | "client_reply" | "status_change" | "system";

export type LeadNote = {
  id: string;
  lead_id: string;
  author_id: string | null;
  author_name: string | null;
  kind: NoteKind;
  body: string;
  created_at: string;
};

/** The tabs on the Leads page. `conversation` groups the in-progress stages. */
export type LeadTab = "new" | "conversation" | "won" | "lost" | "trash";

export const LEAD_TABS: { id: LeadTab; label: string }[] = [
  { id: "new", label: "New" },
  { id: "conversation", label: "In Conversation" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
  { id: "trash", label: "Trash" },
];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal sent",
  won: "Won",
  lost: "Lost",
  spam: "Spam",
};

/** Stages offered in "Change Status", in pipeline order. */
export const STATUS_FLOW: LeadStatus[] = ["new", "contacted", "qualified", "proposal", "won", "lost", "spam"];

export function leadTab(lead: Pick<Lead, "status" | "deleted_at">): LeadTab {
  if (lead.deleted_at || lead.status === "spam") return "trash";
  if (lead.status === "new") return "new";
  if (lead.status === "won") return "won";
  if (lead.status === "lost") return "lost";
  return "conversation";
}

export const NOTE_KINDS: { id: NoteKind; label: string }[] = [
  { id: "comment", label: "Comment" },
  { id: "call", label: "Call" },
  { id: "email", label: "Email" },
  { id: "meeting", label: "Meeting" },
  { id: "client_reply", label: "Client reply" },
];

export const NOTE_KIND_LABELS: Record<NoteKind, string> = {
  comment: "Comment",
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  client_reply: "Client reply",
  status_change: "Status",
  system: "Update",
};

export type LeadSort = "latest" | "oldest" | "activity" | "priority" | "follow_up";

export const LEAD_SORTS: { id: LeadSort; label: string }[] = [
  { id: "latest", label: "Latest" },
  { id: "oldest", label: "Oldest" },
  { id: "activity", label: "Recent activity" },
  { id: "priority", label: "Priority" },
  { id: "follow_up", label: "Follow-up due" },
];

export function sortLeads(leads: Lead[], sort: LeadSort) {
  const time = (value: string | null) => (value ? new Date(value).getTime() : Number.POSITIVE_INFINITY);
  return [...leads].sort((a, b) => {
    switch (sort) {
      case "oldest":
        return a.created_at.localeCompare(b.created_at);
      case "activity":
        return b.last_activity_at.localeCompare(a.last_activity_at);
      case "priority":
        return b.priority - a.priority || b.created_at.localeCompare(a.created_at);
      case "follow_up":
        return time(a.next_follow_up_at) - time(b.next_follow_up_at);
      default:
        return b.created_at.localeCompare(a.created_at);
    }
  });
}

export function matchesSearch(lead: Lead, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [lead.full_name, lead.company_name, lead.business_email, lead.phone_number, lead.service_name]
    .some((value) => value?.toLowerCase().includes(q));
}

export function initials(name: string | null | undefined) {
  const parts = (name || "?").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** "Today 10:24 AM" style labels for the list; dates for anything older than yesterday. */
export function listTime(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const time = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  if (date.toDateString() === today.toDateString()) return { day: "Today", time };
  if (date.toDateString() === yesterday.toDateString()) return { day: "Yesterday", time };
  return { day: date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }), time };
}

export function fullDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Value for `<input type="datetime-local">` in the viewer's time zone. */
export function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function phoneHref(lead: Pick<Lead, "phone_country_code" | "phone_number">) {
  if (!lead.phone_number) return null;
  return `${lead.phone_country_code ?? ""}${lead.phone_number}`.replace(/[^\d+]/g, "");
}

export type LeadAttachment = {
  id: string;
  lead_id: string;
  note_id: string | null;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number;
  uploaded_by: string | null;
  created_at: string;
};

export const ATTACHMENT_COLUMNS = "id,lead_id,note_id,storage_path,file_name,mime_type,size_bytes,uploaded_by,created_at";
export const LEAD_FILES_BUCKET = "lead-files";
/** Matches the `lead-files` bucket limit. */
export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Storage path for a new file: `<lead id>/<uuid>-<safe name>`. */
export function attachmentPath(leadId: string, fileName: string) {
  const safe = fileName.normalize("NFKD").replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").slice(-80) || "file";
  return `${leadId}/${crypto.randomUUID()}-${safe}`;
}

/** Leads still being worked whose next follow-up is today or earlier. */
export type FollowUpState = "overdue" | "today" | "upcoming" | null;

export function followUpState(lead: Pick<Lead, "next_follow_up_at" | "status" | "deleted_at">, now = new Date()): FollowUpState {
  if (!lead.next_follow_up_at || leadTab(lead) === "trash" || lead.status === "won" || lead.status === "lost") return null;
  const due = new Date(lead.next_follow_up_at);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  if (due < now && due.toDateString() !== now.toDateString()) return "overdue";
  if (due <= endOfToday) return "today";
  return "upcoming";
}
