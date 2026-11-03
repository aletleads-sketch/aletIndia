"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { Avatar, UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { PlusIcon, XIcon } from "@/components/admin/icons";
import { memberName, ROLE_LABELS, type AppRole, type Profile } from "@/lib/leads";
import { getSupabase } from "@/lib/supabase-browser";

const input = "w-full rounded-lg border border-[#d4dbe7] px-3 py-2.5 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20";
const ROLE_HINTS: Record<AppRole, string> = {
  admin: "Everything, including the team and deletes",
  sales: "Leads and clients",
  marketing: "Website content",
  editor: "Website content",
};
const ROLES = Object.keys(ROLE_LABELS) as AppRole[];

type TeamAction =
  | { action: "create"; email: string; password: string; full_name: string; role: AppRole }
  | { action: "update"; id: string; full_name?: string | null; role?: AppRole; active?: boolean }
  | { action: "set_password"; id: string; password: string };

/** Profiles have no update policy; the team-admin function makes every change after checking the caller is an admin. */
async function callTeamAdmin(body: TeamAction) {
  const { data, error } = await getSupabase().functions.invoke("team-admin", { body });
  if (error) {
    const detail = error instanceof FunctionsHttpError ? await error.context.json().catch(() => null) : null;
    return { member: null, error: (detail as { error?: string } | null)?.error ?? error.message };
  }
  return { member: (data as { member?: Profile }).member ?? null, error: null };
}

async function fetchMembers() {
  const { data, error } = await getSupabase().from("profiles").select("id,email,full_name,role,active");
  const rows = (data as Profile[] | null)?.sort((a, b) => Number(b.active) - Number(a.active) || memberName(a).localeCompare(memberName(b)));
  return { rows: rows ?? null, error: error?.message ?? null };
}

export function TeamWorkspace() {
  const { profile, refreshTeam } = useAdmin();
  const isAdmin = profile.role === "admin";
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [passwordFor, setPasswordFor] = useState<Profile | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    fetchMembers().then(({ rows, error: loadError }) => {
      setLoading(false);
      setError(loadError);
      if (rows) setMembers(rows);
    });
  }, [isAdmin]);

  const save = useCallback(
    async (body: TeamAction, done: string) => {
      setError(null);
      setNotice(null);
      const { member, error: saveError } = await callTeamAdmin(body);
      if (saveError) {
        setError(saveError);
        return false;
      }
      if (member) setMembers((current) => (current.some((m) => m.id === member.id) ? current.map((m) => (m.id === member.id ? member : m)) : [member, ...current]));
      setNotice(done);
      void refreshTeam();
      return true;
    },
    [refreshTeam],
  );

  if (!isAdmin) {
    return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins can manage the team.</div>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">Team</h1>
          <p className="text-sm text-[#5b6b85]">Add people who can sign in, and choose what they can do</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setAdding(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#0b57d0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0a4bb5]"
        >
          <PlusIcon className="h-4 w-4" />
          Add member
        </button>
        <UserMenu />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        {error ? <p className="mb-4 rounded-xl border border-[#f3c2c2] bg-[#fdecec] p-4 text-sm text-[#a12020]">{error}</p> : null}
        {notice ? <p className="mb-4 rounded-xl border border-[#bfe5cc] bg-[#eaf7ef] p-4 text-sm text-[#1c7a3e]">{notice}</p> : null}

        <section className="overflow-hidden rounded-2xl border border-[#dfe5ef] bg-white">
          {loading ? <p className="p-5 text-sm text-[#5b6b85]">Loading team…</p> : null}
          <ul className="divide-y divide-[#eef1f6]">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                isSelf={member.id === profile.id}
                onSave={save}
                onPassword={() => {
                  setError(null);
                  setPasswordFor(member);
                }}
              />
            ))}
          </ul>
        </section>

        <p className="mt-4 text-sm text-[#5b6b85]">
          Only <b>Admin</b> and <b>Sales</b> members can be assigned leads. Sales members see only the leads assigned to them. A member who is switched off can’t see any data.
        </p>
      </div>

      {adding ? (
        <AddMemberDialog
          error={error}
          onClose={() => setAdding(false)}
          onSave={async (body) => {
            const ok = await save(body, `${body.full_name} can now sign in at /admin with ${body.email} and the password you set.`);
            if (ok) setAdding(false);
            return ok;
          }}
        />
      ) : null}
      {passwordFor ? (
        <PasswordDialog
          error={error}
          member={passwordFor}
          onClose={() => setPasswordFor(null)}
          onSave={async (password) => {
            const ok = await save({ action: "set_password", id: passwordFor.id, password }, `Password changed for ${memberName(passwordFor)}.`);
            if (ok) setPasswordFor(null);
            return ok;
          }}
        />
      ) : null}
    </div>
  );
}

function MemberRow({
  member,
  isSelf,
  onSave,
  onPassword,
}: {
  member: Profile;
  isSelf: boolean;
  onSave: (body: TeamAction, done: string) => Promise<boolean>;
  onPassword: () => void;
}) {
  const name = memberName(member);
  const [draftName, setDraftName] = useState(member.full_name ?? "");

  const saveName = () => {
    const next = draftName.trim();
    if (next === (member.full_name ?? "")) return;
    void onSave({ action: "update", id: member.id, full_name: next || null }, `Name saved for ${next || member.email}.`);
  };

  return (
    <li className={`flex flex-wrap items-center gap-4 px-5 py-4 ${member.active ? "" : "bg-[#f7f8fb] opacity-70"}`}>
      <Avatar name={name} />
      <div className="min-w-[12rem] flex-1">
        <input
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          onBlur={saveName}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          placeholder="Add a name"
          aria-label={`Name for ${member.email}`}
          className="w-full rounded-lg border border-transparent px-2 py-1 font-semibold outline-none hover:border-[#d4dbe7] focus:border-[#1a63e8]"
        />
        <p className="px-2 text-sm text-[#5b6b85]">
          {member.email}
          {isSelf ? " · You" : ""}
        </p>
      </div>
      <label className="text-sm">
        <span className="sr-only">Role</span>
        <select
          value={member.role}
          disabled={isSelf}
          title={isSelf ? "You can’t change your own role" : ROLE_HINTS[member.role]}
          onChange={(event) => {
            const role = event.target.value as AppRole;
            void onSave({ action: "update", id: member.id, role }, `${name} is now ${ROLE_LABELS[role]}.`);
          }}
          className="rounded-lg border border-[#d4dbe7] px-2 py-2 disabled:opacity-60"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={onPassword}
        className="rounded-lg border border-[#d4dbe7] px-3 py-2 text-sm font-semibold hover:border-[#b9c6db]"
      >
        Set password
      </button>
      <button
        type="button"
        disabled={isSelf}
        onClick={() =>
          void onSave(
            { action: "update", id: member.id, active: !member.active },
            member.active ? `${name} is switched off and can’t see any data.` : `${name} can sign in again.`,
          )
        }
        className={`w-28 rounded-lg px-3 py-2 text-sm font-semibold disabled:invisible ${member.active ? "border border-[#f3c2c2] text-[#c62828] hover:bg-[#fdecec]" : "bg-[#1c8a43] text-white hover:bg-[#177538]"}`}
      >
        {member.active ? "Switch off" : "Switch on"}
      </button>
    </li>
  );
}

const actionButton = "rounded-xl px-4 py-2.5 text-sm font-semibold";

/** A form in a modal: fixed title and buttons, with only the fields scrolling on short screens. */
function Dialog({
  title,
  error,
  busy,
  submitLabel,
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  error: string | null;
  busy: boolean;
  submitLabel: [idle: string, working: string];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <form onSubmit={onSubmit} className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#eef1f6] px-6 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 hover:bg-[#f1f4f9]">
            <XIcon />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {error ? <p className="rounded-lg bg-[#fdecec] px-3 py-2 text-sm text-[#a12020]">{error}</p> : null}
          {children}
        </div>
        <div className="flex shrink-0 justify-end gap-2 border-t border-[#eef1f6] px-6 py-4">
          <button type="button" onClick={onClose} className={`${actionButton} border border-[#d4dbe7] hover:border-[#b9c6db]`}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={`${actionButton} bg-[#0b57d0] text-white hover:bg-[#0a4bb5] disabled:opacity-60`}>
            {busy ? submitLabel[1] : submitLabel[0]}
          </button>
        </div>
      </form>
    </div>
  );
}

function AddMemberDialog({
  error,
  onClose,
  onSave,
}: {
  error: string | null;
  onClose: () => void;
  onSave: (body: Extract<TeamAction, { action: "create" }>) => Promise<boolean>;
}) {
  const [role, setRole] = useState<AppRole>("sales");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    await onSave({
      action: "create",
      full_name: String(form.get("full_name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      role,
    });
    setBusy(false);
  }

  return (
    <Dialog title="Add team member" error={error} busy={busy} submitLabel={["Add member", "Adding…"]} onClose={onClose} onSubmit={submit}>
      <label className="block text-sm font-semibold">
        Name
        <input name="full_name" required autoFocus placeholder="Rahul Sharma" className={`${input} mt-1.5 font-normal`} />
      </label>
      <label className="block text-sm font-semibold">
        Email
        <input name="email" type="email" required placeholder="rahul@aletindia.com" className={`${input} mt-1.5 font-normal`} />
      </label>
      <label className="block text-sm font-semibold">
        Password
        <input name="password" type="text" required minLength={8} autoComplete="off" placeholder="At least 8 characters" className={`${input} mt-1.5 font-normal`} />
        <span className="mt-1.5 block text-xs font-normal text-[#5b6b85]">Share it with them privately. You can change it later.</span>
      </label>
      <fieldset>
        <legend className="text-sm font-semibold">Role</legend>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {ROLES.filter((r) => r !== "marketing").map((r) => (
            <label
              key={r}
              className={`flex cursor-pointer items-center justify-center rounded-lg border px-2 py-2.5 text-center text-sm font-semibold ${role === r ? "border-[#1a63e8] bg-[#f3f7ff] text-[#0b57d0]" : "border-[#d4dbe7] hover:border-[#b9c6db]"}`}
            >
              <input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} className="sr-only" />
              {ROLE_LABELS[r]}
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-[#5b6b85]">Can use: {ROLE_HINTS[role]}</p>
      </fieldset>
    </Dialog>
  );
}

function PasswordDialog({ member, error, onClose, onSave }: { member: Profile; error: string | null; onClose: () => void; onSave: (password: string) => Promise<boolean> }) {
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    await onSave(String(new FormData(event.currentTarget).get("password") ?? ""));
    setBusy(false);
  }

  return (
    <Dialog title={`New password for ${memberName(member)}`} error={error} busy={busy} submitLabel={["Save password", "Saving…"]} onClose={onClose} onSubmit={submit}>
      <input name="password" type="text" required minLength={8} autoFocus autoComplete="off" placeholder="At least 8 characters" aria-label="New password" className={input} />
    </Dialog>
  );
}
