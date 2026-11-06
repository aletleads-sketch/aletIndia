"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { FieldShell, ImageInput, ListEditor, ParagraphsInput, TextInput, inputClass } from "@/components/admin/content-fields";
import { ArrowLeftIcon, CheckIcon, EyeIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/admin/icons";
import { Loader } from "@/components/admin/loader";
import { RowMenu } from "@/components/admin/studio-dashboard";
import { Notice, StatusPill, StudioHeader, Thumb, card, formatDate, formatTime, primaryButton, secondaryButton, selectClass } from "@/components/admin/studio-ui";
import { CONTENT_ROLES, publishContent } from "@/lib/content-admin";
import { LIST_GROUPS, LIST_SCHEMAS, type ListSchema, type Spec } from "@/lib/list-schemas";
import { siteHref } from "@/lib/seo-admin";
import { getSupabase } from "@/lib/supabase-browser";

type Row = Record<string, unknown> & { id?: string };
type Option = { value: string; label: string };

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value ?? null)) as T;
const asRecord = (value: unknown) => (value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const asArray = <T,>(value: unknown) => (Array.isArray(value) ? (value as T[]) : []);
const KIND_NAMES: Record<string, string> = { p: "Paragraph", h3: "Small heading", ul: "Bullet list", ol: "Numbered list", img: "Picture", image: "Picture" };

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

/** Fields shown in the side panel next to the form, instead of in the main column. */
const SIDE_KEYS = new Set(["status", "sort_order", "visible", "published_at", "menu", "parent_id", "topic", "group_name", "project_type"]);

/** `initialCategory` presets the category filter (for menus: one menu, e.g. "footer_social" from Site Settings → Social Media). */
export function WebsiteListsWorkspace({ table, initialId, startNew, initialStatus, initialCategory }: { table: string; initialId?: string; startNew?: boolean; initialStatus?: string; initialCategory?: string }) {
  const { profile } = useAdmin();
  const canEdit = CONTENT_ROLES.has(profile.role);
  const schema = useMemo(() => LIST_SCHEMAS.find((item) => item.table === table) ?? LIST_SCHEMAS[0], [table]);
  const siblings = LIST_GROUPS.find((group) => group.includes(schema.table));
  const [rows, setRows] = useState<Row[] | null>(null);
  const [draft, setDraft] = useState<Row | null>(null);
  const [saved, setSaved] = useState<Row | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus ?? "");
  const [category, setCategory] = useState(initialCategory ?? "");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const columns = useMemo(() => ["id", "updated_at", ...schema.fields.map((field) => field.key)].join(","), [schema]);

  const setUrl = (id: string | null) => window.history.replaceState(null, "", `${window.location.pathname}${id ? `?id=${id}` : ""}`);

  const load = useCallback(async () => {
    const [first, ...rest] = schema.order.split(",");
    let query = getSupabase().from(schema.table).select(columns);
    for (const part of [first, ...rest]) {
      const [column, direction] = part.split(".");
      query = query.order(column, { ascending: direction !== "desc" });
    }
    const { data, error: loadError } = await query;
    if (loadError) setError(loadError.message);
    const list = (data as unknown as Row[] | null) ?? [];
    setRows(list);
    const start = startNew ? clone({ ...schema.blank }) : initialId ? list.find((row) => row.id === initialId) : null;
    if (start) {
      setDraft(clone(start));
      setSaved(clone(start));
    }
  }, [schema, columns, initialId, startNew]);

  useEffect(() => {
    if (!canEdit) return;
    // Loading on open is the point of this screen; the state updates happen after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [canEdit, load]);

  const changed = JSON.stringify(draft) !== JSON.stringify(saved);
  const confirmLeave = () => !changed || window.confirm("You have unsaved changes. Leave without saving?");

  useEffect(() => {
    if (!changed) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed]);

  const openRow = (row: Row | null) => {
    if (!confirmLeave()) return;
    setNotice(null);
    setError(null);
    // A new menu link goes into the menu being looked at.
    const next = row ? clone(row) : clone({ ...schema.blank, ...(schema.table === "menu_items" && category ? { menu: category } : {}) });
    setDraft(next);
    setSaved(clone(next));
    setUrl(row?.id ? String(row.id) : null);
  };

  const backToList = () => {
    if (!confirmLeave()) return;
    setDraft(null);
    setSaved(null);
    setNotice(null);
    setError(null);
    setUrl(null);
  };

  const options = useMemo<Record<string, Option[]>>(() => {
    if (schema.table !== "menu_items" || !rows) return {} as Record<string, Option[]>;
    return { parent_id: rows.filter((row) => row.menu === "header" && !row.parent_id && row.id !== draft?.id).map((row) => ({ value: String(row.id), label: String(row.label) })) };
  }, [schema, rows, draft?.id]);

  const categories = useMemo(
    () => (schema.subtitle ? [...new Set((rows ?? []).map((row) => String(row[schema.subtitle ?? ""] ?? "")).filter(Boolean))].sort() : []),
    [rows, schema],
  );

  const statusOf = (row: Row) => (schema.table === "menu_items" ? (row.visible === false ? "hidden" : "published") : String(row.status ?? "published"));

  const query = search.trim().toLowerCase();
  const visible = (rows ?? []).filter(
    (row) =>
      (!query || `${row[schema.title] ?? ""} ${row[schema.subtitle ?? ""] ?? ""} ${row.slug ?? ""}`.toLowerCase().includes(query)) &&
      (!statusFilter || statusOf(row) === statusFilter) &&
      (!category || String(row[schema.subtitle ?? ""] ?? "") === category),
  );

  if (!canEdit) {
    return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins, editors and marketing can change website content.</div>;
  }

  const statusChoices = schema.table === "menu_items" ? ["published", "hidden"] : ["published", "draft", "review", "archived"];
  const shownIds = visible.map((row) => String(row.id));
  const allPicked = shownIds.length > 0 && shownIds.every((id) => picked.has(id));
  const toggle = (id: string) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /** Sets the status of every ticked row (menus: shown or hidden). */
  const bulkStatus = async (status: string) => {
    const ids = [...picked];
    if (!ids.length) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const values = schema.table === "menu_items" ? { visible: status === "published" } : { status };
    const { data, error: updateError } = await getSupabase().from(schema.table).update(values).in("id", ids).select(columns);
    if (updateError) {
      setBusy(false);
      return setError(updateError.message);
    }
    const changedRows = new Map(((data as unknown as Row[] | null) ?? []).map((row) => [String(row.id), row]));
    setRows((current) => (current ?? []).map((row) => changedRows.get(String(row.id)) ?? row));
    setPicked(new Set());
    const publishError = await publishContent();
    setBusy(false);
    setNotice(publishError ?? `${ids.length} ${ids.length === 1 ? schema.noun : schema.label.toLowerCase()} set to “${status}”.`);
  };

  const bulkDelete = async () => {
    const ids = [...picked];
    if (!ids.length || !window.confirm(`Delete ${ids.length} ${ids.length === 1 ? schema.noun : schema.label.toLowerCase()} for good? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    const { error: deleteError } = await getSupabase().from(schema.table).delete().in("id", ids);
    if (deleteError) {
      setBusy(false);
      return setError(deleteError.code === "23503" ? "Some of these are still used elsewhere, so they cannot be deleted. Archive them instead." : deleteError.message);
    }
    setRows((current) => (current ?? []).filter((row) => !picked.has(String(row.id))));
    setPicked(new Set());
    const publishError = await publishContent();
    setBusy(false);
    setNotice(publishError ?? `Deleted ${ids.length}.`);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft || !rows) return;
    const problem = problemWith(schema, draft, rows);
    if (problem) return setError(problem);
    setBusy(true);
    setError(null);
    setNotice(null);
    const { id, updated_at: _stamp, ...values } = draft;
    void _stamp;
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
    setDraft(clone(row));
    setSaved(clone(row));
    setUrl(String(row.id));
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
    setDraft(null);
    setSaved(null);
    setUrl(null);
    const publishError = await publishContent();
    setBusy(false);
    setNotice(publishError ?? `Deleted the ${schema.noun}.`);
  };

  const draftTitle = draft ? (draft.id ? String(draft[schema.title] || "(no name)") : `New ${schema.noun}`) : "";
  const mainFields = schema.fields.filter((field) => !SIDE_KEYS.has(field.key));
  const sideFields = schema.fields.filter((field) => SIDE_KEYS.has(field.key));
  const fieldInput = (field: Spec) => (
    <Field key={field.key} spec={field}>
      <SpecInput
        spec={field}
        value={draft?.[field.key]}
        options={options}
        onChange={(next) => {
          setNotice(null);
          setError(null);
          setDraft((current) => (current ? { ...current, [field.key]: next } : current));
        }}
      />
    </Field>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <StudioHeader
        crumbs={draft ? [{ label: "CMS", href: "/admin" }, { label: schema.label, href: `/admin/lists/${schema.table}` }, { label: draftTitle }] : [{ label: "CMS", href: "/admin" }, { label: schema.label }]}
        title={draft ? (draft.id ? `Edit ${schema.noun}` : `Add ${schema.noun}`) : schema.label}
        subtitle={draft ? draftTitle : LIST_INTROS[schema.table]}
        actions={
          draft ? (
            <>
              <button type="button" onClick={backToList} className={secondaryButton}>
                <ArrowLeftIcon className="h-4 w-4" /> All {schema.label}
              </button>
              {draft.id ? (
                <a href={siteHref(schema.page(draft))} target="_blank" rel="noreferrer" className={secondaryButton}>
                  <EyeIcon className="h-4 w-4" /> Preview
                </a>
              ) : null}
              <button type="submit" form="list-form" disabled={!changed || busy} className={primaryButton}>
                <CheckIcon className="h-4 w-4" /> {busy ? "Saving…" : draft.id ? "Save changes" : `Add ${schema.noun}`}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => openRow(null)} className={primaryButton}>
              <PlusIcon className="h-4 w-4" /> Add {schema.noun.replace(/(^|\s)\w/g, (c) => c.toUpperCase())}
            </button>
          )
        }
      />

      {siblings && !draft ? (
        <div className="flex gap-1.5 overflow-x-auto border-b border-[#e3e8f1] bg-white px-5 py-2 lg:px-8">
          {siblings.map((name) => {
            const item = LIST_SCHEMAS.find((entry) => entry.table === name);
            return item ? (
              <Link key={name} href={`/admin/lists/${name}`} className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold ${name === schema.table ? "bg-[#eaf1ff] text-[#1a4fb8]" : "text-[#334155] hover:bg-[#f3f6fb]"}`}>
                {item.label}
              </Link>
            ) : null;
          })}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-8">
        {!rows ? <Loader label={`Loading ${schema.label.toLowerCase()}…`} /> : null}
        {rows && !draft ? (
          <div className="mx-auto max-w-7xl space-y-4">
            {notice ? <Notice>{notice}</Notice> : null}
            {error ? <Notice tone="bad">{error}</Notice> : null}
            <section className={`${card} overflow-hidden`}>
              <div className="flex flex-wrap items-center gap-3 border-b border-[#eef1f6] p-4">
                <label className="relative min-w-56 flex-1">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${schema.label.toLowerCase()}…`} className={`${inputClass} pl-9`} />
                </label>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={selectClass} aria-label="Status">
                  <option value="">All status</option>
                  {statusChoices.map((value) => (
                    <option key={value} value={value}>
                      {value === "published" && schema.table === "menu_items" ? "Shown" : value[0].toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
                {categories.length > 1 ? (
                  <select value={category} onChange={(event) => setCategory(event.target.value)} className={`${selectClass} max-w-56`} aria-label="Category">
                    <option value="">{schema.table === "menu_items" ? "All menus" : "All categories"}</option>
                    {categories.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                ) : null}
                <span className="text-sm text-[#5b6b85]">
                  {visible.length === rows.length ? `${rows.length} ${schema.label.toLowerCase()}` : `${visible.length} of ${rows.length}`}
                </span>
              </div>
              {picked.size ? (
                <div className="flex flex-wrap items-center gap-2 border-b border-[#eef1f6] bg-[#f5f9ff] px-4 py-2.5 text-sm">
                  <span className="mr-2 font-semibold">{picked.size} selected</span>
                  <button type="button" disabled={busy} onClick={() => void bulkStatus("published")} className="rounded-lg border border-[#c9ecd6] bg-white px-3 py-1.5 font-semibold text-[#1c7a3e] hover:bg-[#effaf3] disabled:opacity-40">
                    {schema.table === "menu_items" ? "Show" : "Publish"}
                  </button>
                  <button type="button" disabled={busy} onClick={() => void bulkStatus(schema.table === "menu_items" ? "hidden" : "draft")} className="rounded-lg border border-[#d4dbe7] bg-white px-3 py-1.5 font-semibold text-[#334155] hover:bg-[#f3f6fb] disabled:opacity-40">
                    {schema.table === "menu_items" ? "Hide" : "Move to draft"}
                  </button>
                  {schema.table !== "menu_items" ? (
                    <button type="button" disabled={busy} onClick={() => void bulkStatus("review")} className="rounded-lg border border-[#f8d9b0] bg-white px-3 py-1.5 font-semibold text-[#c2620f] hover:bg-[#fff7ec] disabled:opacity-40">
                      Send for review
                    </button>
                  ) : null}
                  <button type="button" disabled={busy} onClick={() => void bulkDelete()} className="rounded-lg px-3 py-1.5 font-semibold text-[#a12020] hover:bg-[#fdecec] disabled:opacity-40">
                    Delete
                  </button>
                  <button type="button" onClick={() => setPicked(new Set())} className="ml-auto text-[#5b6b85] hover:underline">
                    Clear
                  </button>
                </div>
              ) : null}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem] text-left text-sm">
                  <thead className="bg-[#f5f7fb] text-[13px] font-semibold text-[#1e293b]">
                    <tr>
                      <th className="w-10 py-3 pl-4">
                        <input
                          type="checkbox"
                          aria-label="Select all"
                          checked={allPicked}
                          onChange={() => setPicked(allPicked ? new Set() : new Set(shownIds))}
                          className="h-4 w-4 rounded border-[#cbd5e1] accent-[#1a63e8]"
                        />
                      </th>
                      <th className="px-3 py-3">{schema.fields.find((field) => field.key === schema.title)?.label ?? "Name"}</th>
                      {schema.subtitle ? <th className="px-3 py-3">{schema.fields.find((field) => field.key === schema.subtitle)?.label.replace(/ \(.*\)$/, "") ?? "Category"}</th> : null}
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Last modified</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef1f6]">
                    {visible.map((row) => (
                      <tr key={String(row.id)} onClick={() => openRow(row)} className={`cursor-pointer hover:bg-[#f8fafd] ${picked.has(String(row.id)) ? "bg-[#f5f9ff]" : ""}`}>
                        <td className="py-3 pl-4" onClick={(event) => event.stopPropagation()}>
                          <input type="checkbox" aria-label="Select" checked={picked.has(String(row.id))} onChange={() => toggle(String(row.id))} className="h-4 w-4 rounded border-[#cbd5e1] accent-[#1a63e8]" />
                        </td>
                        <td className="px-3 py-3">
                          <span className="flex items-center gap-3">
                            {schema.thumb ? <Thumb src={row[schema.thumb]} fit={schema.thumbFit} /> : null}
                            <span className="min-w-0">
                              <span className="line-clamp-2 font-semibold">
                                {schema.table === "menu_items" && row.parent_id ? "↳ " : ""}
                                {String(row[schema.title] ?? "(no name)")}
                              </span>
                              {schema.table === "blogs" ? (
                                <span className="block truncate text-xs text-[#5b6b85]">
                                  {formatDate(row.published_at)} | {String(row.category ?? "—")}
                                </span>
                              ) : row.slug ? (
                                <span className="block truncate text-xs text-[#5b6b85]">/{String(row.slug)}</span>
                              ) : null}
                              {schema.table === "menu_items" ? <span className="block truncate font-mono text-xs text-[#5b6b85]">{String(row.href ?? "")}</span> : null}
                            </span>
                          </span>
                        </td>
                        {schema.subtitle ? <td className="px-3 py-3 text-[#334155]">{String(row[schema.subtitle] ?? "—").replace(/_/g, " ")}</td> : null}
                        <td className="px-3 py-3">
                          <StatusPill status={statusOf(row)} />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-[#334155]">{formatDate(row.updated_at)}</td>
                        <td className="px-4 py-3">
                          <span className="flex justify-end gap-1">
                            <button type="button" aria-label={`Edit ${String(row[schema.title] ?? "")}`} onClick={(event) => { event.stopPropagation(); openRow(row); }} className="rounded-lg p-2 text-[#5b6b85] hover:bg-[#eaf1ff] hover:text-[#1a63e8]">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <span onClick={(event) => event.stopPropagation()}>
                              <RowMenu onEdit={() => openRow(row)} view={siteHref(schema.page(row))} />
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!visible.length ? <p className="p-6 text-center text-sm text-[#5b6b85]">{rows.length ? "Nothing matches these filters." : `No ${schema.label.toLowerCase()} yet. Press “Add ${schema.noun}”.`}</p> : null}
              </div>
            </section>
            <p className="text-xs text-[#5b6b85]">
              {schema.table === "menu_items" ? "To hide a link without deleting it, untick “Shown”." : "To take something off the website without deleting it, set its status to “draft”."}
            </p>
          </div>
        ) : null}

        {rows && draft ? (
          <form id="list-form" onSubmit={submit} className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0 space-y-5">
              {schema.note ? <Notice tone="warn">{schema.note}</Notice> : null}
              {notice ? <Notice>{notice}</Notice> : null}
              <section className={`${card} space-y-5 p-5`}>{mainFields.map(fieldInput)}</section>
            </div>
            <aside className="space-y-4 xl:sticky xl:top-0 xl:self-start">
              <section className={`${card} space-y-4 p-5`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold">Publishing</h2>
                  {draft.id ? <StatusPill status={statusOf(draft)} /> : null}
                </div>
                {sideFields.map(fieldInput)}
                {draft.updated_at ? <p className="text-xs text-[#5b6b85]">Last modified {formatDate(draft.updated_at)}, {formatTime(draft.updated_at)}</p> : null}
              </section>
              <section className={`${card} space-y-3 p-5`}>
                {error ? <Notice tone="bad">{error}</Notice> : null}
                {changed ? <p className="text-sm font-semibold text-[#8a5a00]">You have unsaved changes.</p> : <p className="text-sm text-[#5b6b85]">{draft.id ? "Everything is saved." : "Fill in the form and add it."}</p>}
                <button type="submit" disabled={!changed || busy} className={`${primaryButton} w-full justify-center`}>
                  {busy ? "Saving…" : draft.id ? "Save and publish" : `Add ${schema.noun}`}
                </button>
                <button type="button" disabled={!changed || busy} onClick={() => setDraft(clone(saved))} className={`${secondaryButton} w-full justify-center`}>
                  Discard changes
                </button>
                {draft.id ? (
                  <button type="button" disabled={busy} onClick={() => void remove()} className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#a12020] hover:bg-[#fdecec] disabled:opacity-40">
                    <TrashIcon className="h-4 w-4" /> Delete {schema.noun}
                  </button>
                ) : null}
              </section>
            </aside>
          </form>
        ) : null}
      </div>
    </div>
  );
}

const LIST_INTROS: Record<string, string> = {
  services: "Manage your service offerings and their pages.",
  projects: "Showcase your work on the Portfolio page.",
  case_studies: "Detailed stories of client projects.",
  blogs: "Create, edit and publish blog posts.",
  faqs: "Questions and answers on the Home and Contact pages.",
  testimonials: "What clients say about you.",
  client_logos: "Logos in the client strip on the website.",
  industries: "Industries shown on the Home and Portfolio pages.",
  careers: "Job openings on the Career page.",
  menu_items: "Header, footer and social links.",
};
