"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { FieldShell, ImageInput, ListEditor, ParagraphsInput, TextInput, inputClass } from "@/components/admin/content-fields";
import { Loader } from "@/components/admin/loader";
import { CONTENT_ROLES, publishContent } from "@/lib/content-admin";
import { LIST_SCHEMAS, type ListSchema, type Spec } from "@/lib/list-schemas";
import { siteHref } from "@/lib/seo-admin";
import { getSupabase } from "@/lib/supabase-browser";

type Row = Record<string, unknown> & { id?: string };
type Option = { value: string; label: string };

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value ?? null)) as T;
const asRecord = (value: unknown) => (value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const asArray = <T,>(value: unknown) => (Array.isArray(value) ? (value as T[]) : []);
const KIND_NAMES: Record<string, string> = { p: "Paragraph", h3: "Small heading", ul: "Bullet list", ol: "Numbered list", img: "Picture", image: "Picture" };
const small = "rounded-md border border-[#d4dbe7] bg-white px-2 py-1 text-xs font-semibold text-[#334155] hover:bg-[#f3f6fb] disabled:opacity-40";

/** India date (YYYY-MM-DD) of a stored timestamp, and back. */
const toDate = (value: unknown) => (typeof value === "string" && value ? new Date(new Date(value).getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10) : "");
const fromDate = (value: string) => (value ? `${value}T00:00:00+05:30` : null);

/** One value of a row, drawn from its spec; objects and lists draw their parts the same way. */
function SpecInput({ spec, value, onChange, options }: { spec: Spec; value: unknown; onChange: (value: unknown) => void; options?: Record<string, Option[]> }) {
  switch (spec.type) {
    case "text":
      return <TextInput value={String(value ?? "")} onChange={onChange} />;
    case "textarea":
      return <TextInput value={String(value ?? "")} onChange={onChange} multiline />;
    case "html":
      return <TextInput value={String(value ?? "")} onChange={onChange} multiline />;
    case "number":
      return <input type="number" value={value === null || value === undefined ? "" : String(value)} onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))} className={`${inputClass} max-w-40`} />;
    case "boolean":
      return (
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4" />
          Yes
        </label>
      );
    case "date":
      return <input type="date" value={toDate(value)} onChange={(event) => onChange(fromDate(event.target.value))} className={`${inputClass} max-w-48`} />;
    case "select": {
      const choices = options?.[spec.key] ?? spec.options.map((option) => ({ value: option, label: option }));
      return (
        <select value={value === null || value === undefined ? "" : String(value)} onChange={(event) => onChange(event.target.value || null)} className={`${inputClass} max-w-md`}>
          {options?.[spec.key] ? <option value="">— none —</option> : null}
          {choices.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }
    case "image":
      return <ImageInput value={{ src: String(value ?? ""), alt: "" }} onChange={(next) => onChange(next.src || null)} />;
    case "lines":
      return <ParagraphsInput value={asArray<string>(value)} onChange={onChange} />;
    case "images":
      return spec.plain ? (
        <ListEditor
          items={asArray<string>(value)}
          onChange={onChange}
          blank={() => ""}
          addLabel="Add a picture"
          render={(item, update) => <ImageInput value={{ src: item, alt: "" }} onChange={(next) => update(next.src)} />}
        />
      ) : (
        <ListEditor
          items={asArray<{ src: string; alt: string }>(value)}
          onChange={onChange}
          blank={() => ({ src: "", alt: "" })}
          addLabel="Add a picture"
          render={(item, update) => <ImageInput value={item} onChange={update} />}
        />
      );
    case "object": {
      const record = asRecord(value);
      return (
        <div className="space-y-4 rounded-xl border border-[#e3e8f1] bg-[#fbfcfe] p-4">
          {spec.fields.map((field) => (
            <Field key={field.key} spec={field}>
              <SpecInput spec={field} value={record[field.key]} onChange={(next) => onChange({ ...record, [field.key]: next })} options={options} />
            </Field>
          ))}
        </div>
      );
    }
    case "list":
      return (
        <ListEditor
          items={asArray<Record<string, unknown>>(value)}
          onChange={onChange}
          blank={(): Record<string, unknown> => ({})}
          addLabel="Add"
          render={(item, update) => (
            <div className="space-y-3">
              {spec.fields.map((field) => (
                <Field key={field.key} spec={field}>
                  <SpecInput spec={field} value={item[field.key]} onChange={(next) => update({ ...item, [field.key]: next })} options={options} />
                </Field>
              ))}
            </div>
          )}
        />
      );
    case "blocks": {
      const kinds = Object.keys(spec.kinds);
      return (
        <ListEditor
          items={asArray<Record<string, unknown>>(value)}
          onChange={onChange}
          blank={() => ({ type: kinds[0] })}
          addLabel="Add content"
          render={(item, update) => {
            const kind = String(item.type ?? kinds[0]);
            return (
              <div className="space-y-3">
                <select value={kind} onChange={(event) => update({ type: event.target.value })} className={`${inputClass} max-w-56`}>
                  {kinds.map((name) => (
                    <option key={name} value={name}>
                      {KIND_NAMES[name] ?? name}
                    </option>
                  ))}
                </select>
                {(spec.kinds[kind] ?? []).map((field) => (
                  <Field key={field.key} spec={field}>
                    <SpecInput spec={field} value={item[field.key]} onChange={(next) => update({ ...item, [field.key]: next })} options={options} />
                  </Field>
                ))}
              </div>
            );
          }}
        />
      );
    }
  }
}

function Field({ spec, children }: { spec: Spec; children: ReactNode }) {
  return (
    <FieldShell label={spec.label} hint={spec.hint}>
      {children}
    </FieldShell>
  );
}

/** Basic checks before saving, so the database never gets a half-filled row. */
function problemWith(schema: ListSchema, row: Row, rows: Row[]) {
  const title = String(row[schema.title] ?? "").trim();
  if (!title) return `Fill in “${schema.fields.find((field) => field.key === schema.title)?.label ?? schema.title}”.`;
  if ("slug" in row || schema.fields.some((field) => field.key === "slug")) {
    const slug = String(row.slug ?? "").trim();
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return "The page address / short id must be lowercase words joined by dashes, e.g. my-new-page.";
    if (rows.some((other) => other.id !== row.id && other.slug === slug)) return "Another row already uses this page address / short id.";
  }
  if (schema.table === "menu_items" && !String(row.href ?? "").trim()) return "Fill in the link.";
  return null;
}

export function WebsiteListsWorkspace({ initialTable }: { initialTable?: string }) {
  const { profile } = useAdmin();
  const canEdit = CONTENT_ROLES.has(profile.role);
  const [table, setTable] = useState(initialTable && LIST_SCHEMAS.some((schema) => schema.table === initialTable) ? initialTable : LIST_SCHEMAS[0].table);
  const schema = LIST_SCHEMAS.find((item) => item.table === table) ?? LIST_SCHEMAS[0];
  const [rows, setRows] = useState<Row[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row | null>(null);
  const [saved, setSaved] = useState<Row | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const columns = useMemo(() => ["id", ...schema.fields.map((field) => field.key)].join(","), [schema]);

  const load = useCallback(async () => {
    setRows(null);
    const [first, ...rest] = schema.order.split(",");
    let query = getSupabase().from(schema.table).select(columns);
    for (const part of [first, ...rest]) {
      const [column, direction] = part.split(".");
      query = query.order(column, { ascending: direction !== "desc" });
    }
    const { data, error: loadError } = await query;
    if (loadError) setError(loadError.message);
    setRows((data as unknown as Row[] | null) ?? []);
  }, [schema, columns]);

  useEffect(() => {
    if (!canEdit) return;
    // Loading on open is the point of this screen; the state updates happen after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [canEdit, load]);

  const changed = JSON.stringify(draft) !== JSON.stringify(saved);
  const confirmLeave = () => !changed || window.confirm("You have unsaved changes. Leave without saving?");

  const switchTable = (next: string) => {
    if (!confirmLeave()) return;
    setTable(next);
    setSelectedId(null);
    setDraft(null);
    setSaved(null);
    setSearch("");
    setNotice(null);
    setError(null);
    window.history.replaceState(null, "", `${window.location.pathname}?list=${next}`);
  };

  const openRow = (row: Row | null) => {
    if (!confirmLeave()) return;
    setNotice(null);
    setError(null);
    const next = row ? clone(row) : clone({ ...schema.blank });
    setSelectedId(row?.id ?? "new");
    setDraft(next);
    setSaved(clone(next));
  };

  const options = useMemo<Record<string, Option[]>>(() => {
    if (schema.table !== "menu_items" || !rows) return {} as Record<string, Option[]>;
    return { parent_id: rows.filter((row) => row.menu === "header" && !row.parent_id && row.id !== draft?.id).map((row) => ({ value: String(row.id), label: String(row.label) })) };
  }, [schema, rows, draft?.id]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (rows ?? []).filter((row) => !query || `${row[schema.title] ?? ""} ${row[schema.subtitle ?? ""] ?? ""}`.toLowerCase().includes(query));
  }, [rows, search, schema]);

  if (!canEdit) {
    return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins, editors and marketing can change website content.</div>;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft || !rows) return;
    const problem = problemWith(schema, draft, rows);
    if (problem) return setError(problem);
    setBusy(true);
    setError(null);
    setNotice(null);
    const { id, ...values } = draft;
    for (const key of Object.keys(values)) if (typeof values[key] === "string") values[key] = (values[key] as string).trim();
    if (schema.table === "menu_items" && values.menu !== "header") values.parent_id = null;
    const supabase = getSupabase();
    const result = id
      ? await supabase.from(schema.table).update(values).eq("id", id).select(columns).single()
      : await supabase.from(schema.table).insert(values).select(columns).single();
    if (result.error || !result.data) {
      setBusy(false);
      return setError(result.error?.message ?? "Could not save.");
    }
    const row = result.data as unknown as Row;
    setRows((current) => (id ? (current ?? []).map((item) => (item.id === id ? row : item)) : [...(current ?? []), row]));
    setSelectedId(String(row.id));
    setDraft(clone(row));
    setSaved(clone(row));
    const publishError = await publishContent();
    setBusy(false);
    setNotice(publishError ?? (row.status && row.status !== "published" ? `Saved. It is not on the website while its status is “${row.status}”.` : "Saved. The website shows the change now."));
  };

  const remove = async () => {
    if (!draft?.id) return;
    if (!window.confirm(`Delete this ${schema.noun} for good? This cannot be undone. To only hide it, set its status to “draft” instead.`)) return;
    setBusy(true);
    const { error: deleteError } = await getSupabase().from(schema.table).delete().eq("id", draft.id);
    if (deleteError) {
      setBusy(false);
      return setError(
        deleteError.code === "23503" ? `This ${schema.noun} is still used elsewhere (for example by leads), so it cannot be deleted. Set its status to “archived” instead.` : deleteError.message,
      );
    }
    setRows((current) => (current ?? []).filter((item) => item.id !== draft.id));
    setSelectedId(null);
    setDraft(null);
    setSaved(null);
    const publishError = await publishContent();
    setBusy(false);
    setNotice(publishError ?? "Deleted.");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">Website Lists</h1>
          <p className="text-sm text-[#5b6b85]">Services, projects, case studies, blogs, FAQs and the other lists on the website.</p>
        </div>
        <UserMenu />
      </header>

      <div className="flex gap-1.5 overflow-x-auto border-b border-[#dfe5ef] bg-white px-4 py-2 lg:px-6" role="tablist" aria-label="Lists">
        {LIST_SCHEMAS.map((item) => (
          <button
            key={item.table}
            type="button"
            role="tab"
            aria-selected={item.table === table}
            onClick={() => switchTable(item.table)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold ${item.table === table ? "bg-[#1a63e8] text-white" : "text-[#334155] hover:bg-[#f3f6fb]"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {!rows ? <Loader label={`Loading ${schema.label.toLowerCase()}…`} /> : null}
      {rows ? (
        <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto border-b border-[#dfe5ef] bg-white p-4 lg:border-r lg:border-b-0">
            <div className="flex gap-2">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find…" className={inputClass} />
              <button type="button" onClick={() => openRow(null)} className="shrink-0 rounded-lg bg-[#1a63e8] px-3 text-sm font-semibold text-white">
                + New
              </button>
            </div>
            <p className="mt-3 text-xs text-[#5b6b85]">
              {rows.length} {schema.label.toLowerCase()}
            </p>
            <ul className="mt-2 space-y-0.5">
              {visible.map((row) => (
                <li key={String(row.id)}>
                  <button
                    type="button"
                    onClick={() => openRow(row)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${selectedId === row.id ? "bg-[#1a63e8] text-white" : "hover:bg-[#f3f6fb]"}`}
                  >
                    <span className="block truncate font-semibold">
                      {schema.table === "menu_items" && row.parent_id ? "↳ " : ""}
                      {String(row[schema.title] ?? "(no name)")}
                    </span>
                    <span className={`flex gap-2 text-xs ${selectedId === row.id ? "text-white/80" : "text-[#5b6b85]"}`}>
                      {schema.subtitle ? <span className="truncate">{String(row[schema.subtitle] ?? "")}</span> : null}
                      {row.status && row.status !== "published" ? <span className="font-bold uppercase">{String(row.status)}</span> : null}
                      {row.visible === false ? <span className="font-bold uppercase">hidden</span> : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="min-h-0 overflow-y-auto p-4 lg:p-6">
            {!draft ? (
              <div className="grid h-full place-items-center text-center text-sm text-[#5b6b85]">
                <div>
                  <p className="text-base font-semibold text-[#0f1b33]">Pick a {schema.noun} on the left, or press “+ New”</p>
                  <p className="mt-1">
                    {schema.table === "menu_items"
                      ? "To hide a link without deleting it, untick “Shown”."
                      : "To take something off the website without deleting it, set its status to “draft”."}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mx-auto max-w-4xl space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-wide text-[#5b6b85] uppercase">{schema.label}</p>
                    <h2 className="text-xl font-extrabold">{draft.id ? String(draft[schema.title] || "(no name)") : `New ${schema.noun}`}</h2>
                  </div>
                  {draft.id ? (
                    <a href={siteHref(schema.page(draft))} target="_blank" rel="noreferrer" className="rounded-lg border border-[#d4dbe7] bg-white px-3 py-2 text-sm font-semibold hover:bg-[#f3f6fb]">
                      Open on the website ↗
                    </a>
                  ) : null}
                </div>
                {schema.note ? <p className="rounded-xl border border-[#f1dfb5] bg-[#fff8e8] p-3 text-sm text-[#7a5200]">{schema.note}</p> : null}
                {notice ? <p className="rounded-xl border border-[#bfe5cc] bg-[#eaf7ef] p-4 text-sm text-[#1c7a3e]">{notice}</p> : null}

                <section className="space-y-5 rounded-2xl border border-[#dfe5ef] bg-white px-5 py-5">
                  {schema.fields.map((field) => (
                    <Field key={field.key} spec={field}>
                      <SpecInput
                        spec={field}
                        value={draft[field.key]}
                        options={options}
                        onChange={(next) => {
                          setNotice(null);
                          setError(null);
                          setDraft((current) => (current ? { ...current, [field.key]: next } : current));
                        }}
                      />
                    </Field>
                  ))}
                </section>

                <div className={`${changed ? "sticky bottom-0" : ""} flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-[#dfe5ef] bg-white px-5 py-3 shadow-sm`}>
                  {error ? <p className="w-full rounded-lg bg-[#fdecec] px-3 py-2 text-sm text-[#a12020]">{error}</p> : null}
                  {draft.id ? (
                    <button type="button" disabled={busy} onClick={() => void remove()} className={`${small} mr-auto px-3 py-2 text-sm text-[#a12020]`}>
                      Delete
                    </button>
                  ) : null}
                  {changed ? <span className="text-sm font-semibold text-[#8a5a00]">Unsaved changes</span> : null}
                  <button type="button" disabled={!changed || busy} onClick={() => setDraft(clone(saved))} className="rounded-xl border border-[#d4dbe7] px-4 py-2.5 text-sm font-semibold disabled:opacity-40">
                    Discard
                  </button>
                  <button type="submit" disabled={!changed || busy} className="rounded-xl bg-[#1a63e8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
                    {busy ? "Saving…" : draft.id ? "Save and publish" : `Add ${schema.noun}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
