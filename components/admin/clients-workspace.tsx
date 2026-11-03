"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Avatar, canManageLeads, UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { ArrowLeftIcon, MailIcon, PhoneIcon, PlusIcon, SearchIcon, XIcon } from "@/components/admin/icons";
import { CLIENT_COLUMNS, matchesClientSearch, type Client } from "@/lib/clients";
import { fullDateTime, memberName, phoneHref } from "@/lib/leads";
import { getSupabase } from "@/lib/supabase-browser";

const input = "w-full rounded-lg border border-[#d4dbe7] px-3 py-2.5 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20";

async function fetchClients() {
  const { data, error } = await getSupabase().from("clients").select(CLIENT_COLUMNS).order("created_at", { ascending: false }).limit(1000);
  return { rows: (data as Client[] | null) ?? null, error: error?.message ?? null };
}

function initialClientId() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("client");
}

const text = (form: FormData, key: string) => {
  const value = String(form.get(key) ?? "").trim();
  return value || null;
};

export function ClientsWorkspace() {
  const { profile } = useAdmin();
  const allowed = canManageLeads(profile);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialClientId);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!allowed) return;
    fetchClients().then(({ rows, error: loadError }) => {
      setLoading(false);
      setError(loadError);
      if (rows) setClients(rows);
    });
  }, [allowed]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedId) url.searchParams.set("client", selectedId);
    else url.searchParams.delete("client");
    window.history.replaceState(null, "", url);
  }, [selectedId]);

  const visible = useMemo(
    () => clients.filter((client) => (showInactive || client.status === "active") && matchesClientSearch(client, query)),
    [clients, query, showInactive],
  );
  const selected = clients.find((client) => client.id === selectedId) ?? null;

  if (!allowed) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold">Clients are for admin and sales users</h1>
          <p className="mt-2 text-sm text-[#5b6b85]">Your role is “{profile.role}”.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">Clients</h1>
          <p className="text-sm text-[#5b6b85]">Customers won from your leads</p>
        </div>
        <label className="order-last flex w-full items-center gap-2 rounded-xl border border-[#d4dbe7] bg-white px-3 py-2.5 md:order-none md:w-80">
          <SearchIcon className="h-4 w-4 text-[#5b6b85]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clients (name, contact, email)"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 rounded-xl bg-[#0b57d0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0a4bb5]"
        >
          <PlusIcon className="h-4 w-4" />
          Add Client
        </button>
        <UserMenu />
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:p-6">
        {error ? <p className="rounded-xl border border-[#f3c2c2] bg-[#fdecec] p-4 text-sm text-[#a12020]">Couldn’t load clients: {error}</p> : null}
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(18rem,24rem)_1fr]">
          <section className={`flex min-h-0 flex-col rounded-2xl border border-[#dfe5ef] bg-white ${selected ? "hidden lg:flex" : "flex"}`}>
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="font-bold">
                {visible.length} {visible.length === 1 ? "Client" : "Clients"}
              </h2>
              <label className="flex cursor-pointer items-center gap-1.5 text-sm text-[#5b6b85]">
                <input type="checkbox" checked={showInactive} onChange={(event) => setShowInactive(event.target.checked)} className="h-4 w-4 accent-[#0b57d0]" />
                Show inactive
              </label>
            </div>
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
              {loading ? <li className="p-5 text-sm text-[#5b6b85]">Loading clients…</li> : null}
              {!loading && !visible.length ? (
                <li className="p-5 text-sm text-[#5b6b85]">{query ? "No clients match your search." : "No clients yet. Mark a lead as Won, then use “Convert to client”."}</li>
              ) : null}
              {visible.map((client) => (
                <li key={client.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(client.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${client.id === selectedId ? "bg-[#e6eefc]" : "hover:bg-[#f4f7fb]"}`}
                  >
                    <Avatar name={client.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{client.name}</span>
                      <span className="block truncate text-sm text-[#5b6b85]">{client.contact_name || client.email}</span>
                    </span>
                    {client.status === "inactive" ? <span className="rounded-full bg-[#eceff4] px-2 py-0.5 text-[11px] font-semibold text-[#5b6b85]">Inactive</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className={`min-h-0 flex-col overflow-y-auto rounded-2xl border border-[#dfe5ef] bg-white ${selected ? "flex" : "hidden lg:flex"}`}>
            {selected ? (
              <ClientDetail
                key={selected.id}
                client={selected}
                onBack={() => setSelectedId(null)}
                onSaved={(next) => setClients((current) => current.map((client) => (client.id === next.id ? next : client)))}
                onDeleted={() => {
                  setClients((current) => current.filter((client) => client.id !== selected.id));
                  setSelectedId(null);
                }}
              />
            ) : (
              <div className="grid flex-1 place-items-center p-8 text-center text-sm text-[#5b6b85]">Select a client to see their details.</div>
            )}
          </section>
        </div>
      </div>

      {adding ? (
        <div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e6ebf2] px-6 py-4">
              <h2 className="text-lg font-bold">Add client</h2>
              <button type="button" aria-label="Close" onClick={() => setAdding(false)} className="rounded-lg p-1.5 hover:bg-[#f1f4f9]">
                <XIcon />
              </button>
            </div>
            <ClientForm
              client={null}
              onCancel={() => setAdding(false)}
              onSaved={(saved) => {
                setAdding(false);
                setClients((current) => [saved, ...current]);
                setSelectedId(saved.id);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ClientDetail({ client, onBack, onSaved, onDeleted }: { client: Client; onBack: () => void; onSaved: (client: Client) => void; onDeleted: () => void }) {
  const { profile, team } = useAdmin();
  const [error, setError] = useState<string | null>(null);
  const phone = phoneHref(client);
  const owner = team.find((member) => member.id === client.owner_id);

  async function remove() {
    if (!window.confirm(`Delete client ${client.name}? The lead it came from is kept.`)) return;
    const { error: deleteError } = await getSupabase().from("clients").delete().eq("id", client.id);
    if (deleteError) return setError(deleteError.message);
    onDeleted();
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-start gap-3 border-b border-[#e6ebf2] px-5 py-5 lg:px-7">
        <button type="button" onClick={onBack} aria-label="Back to list" className="mt-1 rounded-lg p-1 hover:bg-[#f1f4f9] lg:hidden">
          <ArrowLeftIcon />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="truncate text-xl font-extrabold tracking-tight lg:text-2xl">{client.name}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${client.status === "active" ? "bg-[#dcf5e4] text-[#1c7a3e]" : "bg-[#eceff4] text-[#5b6b85]"}`}>
              {client.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#334155]">
            {client.contact_name ? <span>{client.contact_name}</span> : null}
            {client.email ? (
              <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 hover:text-[#1a63e8]">
                <MailIcon className="h-4 w-4" />
                {client.email}
              </a>
            ) : null}
            {phone ? (
              <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-[#1a63e8]">
                <PhoneIcon className="h-4 w-4" />
                {client.phone_country_code} {client.phone_number}
              </a>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-[#5b6b85]">
            Client since {fullDateTime(client.created_at)}
            {owner ? ` · Managed by ${memberName(owner)}` : ""}
            {client.lead_id ? (
              <>
                {" · "}
                <Link href={`/admin/leads?lead=${client.lead_id}`} className="font-semibold text-[#1a4fb8] hover:underline">
                  Open original lead
                </Link>
              </>
            ) : null}
          </p>
        </div>
        {profile.role === "admin" ? (
          <button type="button" onClick={remove} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#c62828] hover:bg-[#fdecec]">
            Delete
          </button>
        ) : null}
      </div>
      {error ? <p className="mx-5 mt-3 rounded-lg bg-[#fdecec] px-3 py-2 text-sm text-[#a12020] lg:mx-7">{error}</p> : null}
      <ClientForm client={client} onSaved={onSaved} />
    </div>
  );
}

function ClientForm({ client, onSaved, onCancel }: { client: Client | null; onSaved: (client: Client) => void; onCancel?: () => void }) {
  const { profile, team } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const assignable = team.filter((member) => member.role === "admin" || member.role === "sales");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = {
      name: text(form, "name") ?? "",
      contact_name: text(form, "contact_name"),
      email: text(form, "email")?.toLowerCase() ?? null,
      phone_country_code: text(form, "phone_country_code"),
      phone_number: text(form, "phone_number"),
      country: text(form, "country"),
      owner_id: text(form, "owner_id"),
      status: (text(form, "status") ?? "active") as Client["status"],
      notes: text(form, "notes"),
    };
    setBusy(true);
    setMessage(null);
    const supabase = getSupabase();
    const query = client ? supabase.from("clients").update(values).eq("id", client.id) : supabase.from("clients").insert(values);
    const { data, error } = await query.select(CLIENT_COLUMNS).single();
    setBusy(false);
    if (error || !data) return setMessage(error?.message ?? "Couldn’t save.");
    setMessage(client ? "Saved." : null);
    onSaved(data as Client);
  }

  return (
    <form onSubmit={submit} className="grid gap-4 px-6 py-5 sm:grid-cols-2">
      <Field label="Client / company name *">
        <input name="name" required defaultValue={client?.name} className={input} />
      </Field>
      <Field label="Contact person">
        <input name="contact_name" defaultValue={client?.contact_name ?? ""} className={input} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" defaultValue={client?.email ?? ""} className={input} />
      </Field>
      <div className="grid grid-cols-[6rem_1fr] gap-2">
        <Field label="Code">
          <input name="phone_country_code" defaultValue={client?.phone_country_code ?? "+91"} className={input} />
        </Field>
        <Field label="Phone">
          <input name="phone_number" type="tel" defaultValue={client?.phone_number ?? ""} className={input} />
        </Field>
      </div>
      <Field label="Country">
        <input name="country" defaultValue={client?.country ?? ""} className={input} />
      </Field>
      <Field label="Managed by">
        <select name="owner_id" defaultValue={client?.owner_id ?? profile.id} className={input}>
          <option value="">Nobody yet</option>
          {assignable.map((member) => (
            <option key={member.id} value={member.id}>
              {memberName(member)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Status">
        <select name="status" defaultValue={client?.status ?? "active"} className={input}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Notes (project, contract, renewal…)">
          <textarea name="notes" rows={5} defaultValue={client?.notes ?? ""} className={input} />
        </Field>
      </div>
      <div className="flex items-center justify-end gap-3 sm:col-span-2">
        {message ? <span className={`text-sm ${message === "Saved." ? "text-[#1c7a3e]" : "text-[#a12020]"}`}>{message}</span> : null}
        {onCancel ? (
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-[#f1f4f9]">
            Cancel
          </button>
        ) : null}
        <button type="submit" disabled={busy} className="rounded-lg bg-[#0b57d0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a4bb5] disabled:opacity-60">
          {busy ? "Saving…" : client ? "Save changes" : "Add client"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold tracking-wide text-[#5b6b85] uppercase">{label}</span>
      {children}
    </label>
  );
}
