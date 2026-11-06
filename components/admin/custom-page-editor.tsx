"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { FieldShell, ImageInput, LinkInput, ListEditor, ParagraphsInput, TextInput } from "@/components/admin/content-fields";
import { EyeIcon, GripIcon, PlusIcon, SaveIcon, TrashIcon } from "@/components/admin/icons";
import { Loader } from "@/components/admin/loader";
import { Notice, StatusPill, StudioHeader, card, formatDate, formatTime, primaryButton, secondaryButton, selectClass } from "@/components/admin/studio-ui";
import { CONTENT_ROLES, publishContent } from "@/lib/content-admin";
import { BLOCKS, type Button, type Picture } from "@/lib/custom-pages";
import { blockTitle, deleteCustomPage, loadCustomPageForEdit, newBlock, saveBlocks, saveCustomPageInfo, type CustomPageInfo, type EditableBlock } from "@/lib/custom-pages-admin";
import { siteHref } from "@/lib/seo-admin";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Edits a page made with Add Page: its name, status and blocks (add, reorder, hide, delete). */
export function CustomPageEditor({ path }: { path: string }) {
  const { profile } = useAdmin();
  const router = useRouter();
  const canEdit = CONTENT_ROLES.has(profile.role);
  const [page, setPage] = useState<CustomPageInfo | null>(null);
  const [info, setInfo] = useState({ name: "", status: "draft" });
  const [blocks, setBlocks] = useState<EditableBlock[] | null>(null);
  const [saved, setSaved] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!canEdit) return;
    let cancelled = false;
    loadCustomPageForEdit(path).then((result) => {
      if (cancelled) return;
      if (!result.page) return setMissing(true);
      setPage(result.page);
      setInfo({ name: result.page.name, status: result.page.status });
      setBlocks(result.blocks);
      setSaved(JSON.stringify({ info: { name: result.page.name, status: result.page.status }, blocks: result.blocks }));
      setSelected(result.blocks[0]?.key ?? null);
      if (result.error) setError(result.error);
    });
    return () => {
      cancelled = true;
    };
  }, [canEdit, path]);

  const changed = blocks !== null && JSON.stringify({ info, blocks }) !== saved;

  useEffect(() => {
    if (!changed) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed]);

  if (!canEdit) return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins, editors and marketing can change website content.</div>;
  if (missing) return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">This page does not exist (or was not made with Add Page).</div>;

  const block = blocks?.find((item) => item.key === selected) ?? null;
  const update = (key: string, fields: Record<string, unknown>) => {
    setNotice(null);
    setBlocks((current) => current?.map((item) => (item.key === key ? { ...item, fields } : item)) ?? current);
  };
  const set = (name: string, value: unknown) => block && update(block.key, { ...block.fields, [name]: value });

  const move = (from: number, to: number) =>
    setBlocks((current) => {
      if (!current) return current;
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!blocks || !page) return;
    if (!info.name.trim()) return setError("Give the page a name.");
    setBusy(true);
    setError(null);
    setNotice(null);
    const problem = (await saveCustomPageInfo(path, { name: info.name.trim(), status: info.status })) ?? (await saveBlocks(path, blocks));
    if (problem) {
      setBusy(false);
      return setError(problem);
    }
    setSaved(JSON.stringify({ info: { ...info, name: info.name.trim() }, blocks }));
    setInfo((current) => ({ ...current, name: current.name.trim() }));
    const publishError = await publishContent();
    setBusy(false);
    setNotice(publishError ?? (info.status === "published" ? "Saved. The page is live on the website." : `Saved. The page is not on the website while its status is “${info.status}”.`));
  };

  const removePage = async () => {
    if (!window.confirm(`Delete the page “${info.name}” and all its blocks for good? This cannot be undone.`)) return;
    setBusy(true);
    const problem = await deleteCustomPage(path);
    if (problem) {
      setBusy(false);
      return setError(problem);
    }
    await publishContent();
    router.push("/admin/pages");
  };

  const text = (name: string, label: string, multiline = false) => (
    <FieldShell key={name} label={label}>
      <TextInput value={String(block?.fields[name] ?? "")} onChange={(next) => set(name, next)} multiline={multiline} />
    </FieldShell>
  );
  const picture = (name: string, label: string) => (
    <FieldShell key={name} label={label}>
      <ImageInput value={(block?.fields[name] as Picture) ?? { src: "", alt: "" }} onChange={(next) => set(name, next)} stacked />
    </FieldShell>
  );
  const button = (name: string, label: string) => (
    <FieldShell key={name} label={label} hint="Leave the text empty for no button.">
      <LinkInput value={(block?.fields[name] as Button) ?? { label: "", href: "" }} onChange={(next) => set(name, next)} />
    </FieldShell>
  );
  const paragraphs = (name: string, label: string) => (
    <FieldShell key={name} label={label}>
      <ParagraphsInput value={(block?.fields[name] as string[]) ?? []} onChange={(next) => set(name, next)} addLabel="Add a paragraph" />
    </FieldShell>
  );

  const form = () => {
    if (!block) return null;
    switch (block.kind) {
      case "hero":
        return (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-5">
              {text("title", "Headline")}
              {text("accent", "Headline, highlighted words (optional)")}
              {text("text", "Subheading", true)}
              {button("button", "Button")}
            </div>
            <div>{picture("image", "Background picture")}</div>
          </div>
        );
      case "text":
        return (
          <div className="space-y-5">
            {text("heading", "Heading")}
            {paragraphs("paragraphs", "Paragraphs")}
          </div>
        );
      case "image_text":
        return (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-5">
              {text("heading", "Heading")}
              {paragraphs("paragraphs", "Paragraphs")}
              {button("button", "Button")}
            </div>
            <div className="space-y-5">
              {picture("image", "Picture")}
              <FieldShell label="Picture side">
                <select value={String(block.fields.imageSide ?? "right")} onChange={(event) => set("imageSide", event.target.value)} className={`${selectClass} w-full`}>
                  <option value="right">Right of the text</option>
                  <option value="left">Left of the text</option>
                </select>
              </FieldShell>
            </div>
          </div>
        );
      case "cards":
        return (
          <div className="space-y-5">
            {text("heading", "Heading")}
            {text("intro", "Intro (optional)", true)}
            <FieldShell label="Cards">
              <ListEditor
                items={(block.fields.items as { title: string; text: string }[]) ?? []}
                onChange={(next) => set("items", next)}
                blank={() => ({ title: "", text: "" })}
                addLabel="Add a card"
                render={(item, change) => (
                  <div className="space-y-2">
                    <TextInput value={item.title} onChange={(title) => change({ ...item, title })} placeholder="Card title" />
                    <TextInput value={item.text} onChange={(value) => change({ ...item, text: value })} placeholder="Card text" multiline />
                  </div>
                )}
              />
            </FieldShell>
          </div>
        );
      case "cta":
        return (
          <div className="space-y-5">
            {text("heading", "Heading")}
            {text("text", "Text", true)}
            {button("button", "Button")}
          </div>
        );
      case "contact":
        return <p className="text-sm text-[#5b6b85]">The website&apos;s contact form. Its words are edited in Homepage → Shared sections → Contact us form.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <StudioHeader
          crumbs={[{ label: "Pages", href: "/admin/pages" }, { label: `Edit ${info.name || "page"}` }]}
          back="/admin/pages"
          title={`Edit ${info.name || "page"}`}
          badge={page ? <StatusPill status={info.status} /> : null}
          subtitle={`Manage the content and sections of this page. Address: ${path}`}
          actions={
            <>
              <a href={siteHref(path)} target="_blank" rel="noreferrer" className={secondaryButton}>
                <EyeIcon className="h-4 w-4" /> Preview
              </a>
              <button type="button" onClick={() => void submit()} disabled={!changed || busy} className={primaryButton}>
                <SaveIcon className="h-4 w-4" /> {busy ? "Saving…" : "Save Changes"}
              </button>
            </>
          }
        />
        {!blocks || !page ? (
          <Loader label="Loading the page…" />
        ) : (
          <div className="grid gap-6 px-4 pt-5 pb-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:px-8">
            <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <section className={`${card} p-4`}>
                <p className="px-1 pb-3 text-[15px] font-bold">Page Sections</p>
                <ol className="space-y-1.5">
                  {blocks.map((item, index) => (
                    <li
                      key={item.key}
                      draggable
                      onDragStart={() => setDragging(index)}
                      onDragOver={(event) => {
                        if (dragging === null || dragging === index) return;
                        event.preventDefault();
                        move(dragging, index);
                        setDragging(index);
                      }}
                      onDragEnd={() => setDragging(null)}
                      className={dragging === index ? "opacity-50" : ""}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(item.key)}
                        className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[15px] ${item.key === selected ? "border-[#bcd2fb] bg-[#e8f0ff] font-semibold text-[#1a4fb8]" : "border-[#eef1f6] bg-white hover:bg-[#f5f7fb]"} ${item.hidden ? "opacity-55" : ""}`}
                      >
                        <GripIcon className="h-4 w-4 shrink-0 cursor-grab text-[#94a3b8]" />
                        <span className="min-w-0 flex-1 truncate">{blockTitle(item)}</span>
                        {item.hidden ? <span className="rounded-full bg-[#eef1f6] px-2 py-0.5 text-[11px] font-semibold text-[#5b6b85]">Hidden</span> : null}
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="relative mt-4">
                  <button type="button" onClick={() => setAdding((value) => !value)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#c7d6ee] py-2.5 text-[15px] font-semibold text-[#1a63e8] hover:bg-[#f0f5ff]">
                    <PlusIcon className="h-4 w-4" /> Add Section
                  </button>
                  {adding ? (
                    <div className="absolute inset-x-0 z-20 mt-2 rounded-xl border border-[#dfe5ef] bg-white p-2 shadow-xl">
                      {BLOCKS.map((kind) => (
                        <button
                          key={kind.kind}
                          type="button"
                          onClick={() => {
                            const item = newBlock(kind.kind, info.name);
                            setBlocks((current) => [...(current ?? []), item]);
                            setSelected(item.key);
                            setAdding(false);
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left hover:bg-[#f5f7fb]"
                        >
                          <span className="block text-sm font-semibold">{kind.label}</span>
                          <span className="block text-xs text-[#5b6b85]">{kind.hint}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <p className="mt-3 px-1 text-xs text-[#5b6b85]">Drag the ⋮⋮ handle to change the order.</p>
              </section>
              <section className={`${card} space-y-4 p-4`}>
                <p className="text-[15px] font-bold">Page Settings</p>
                <FieldShell label="Page name">
                  <TextInput value={info.name} onChange={(name) => setInfo((current) => ({ ...current, name }))} />
                </FieldShell>
                <FieldShell label="Status" hint="Only published pages are on the website.">
                  <select value={info.status} onChange={(event) => setInfo((current) => ({ ...current, status: event.target.value }))} className={`${selectClass} w-full`}>
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </FieldShell>
                <p className="text-xs text-[#5b6b85]">
                  Last saved {formatDate(page.updated_at)}, {formatTime(page.updated_at)}. To show it in the menu, add a link in Site Settings → Menus.
                </p>
                <button type="button" onClick={() => void removePage()} disabled={busy} className="flex items-center gap-2 text-sm font-semibold text-[#a12020] hover:underline disabled:opacity-40">
                  <TrashIcon className="h-4 w-4" /> Delete this page
                </button>
              </section>
            </aside>

            <form onSubmit={submit} className="min-w-0 space-y-5">
              {notice ? <Notice>{notice}</Notice> : null}
              {error ? <Notice tone="bad">{error}</Notice> : null}
              {block ? (
                <section className={`${card} p-5 lg:p-6`}>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-[22px] font-extrabold">{blockTitle(block)}</h2>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex cursor-pointer items-center gap-2.5 text-[15px] font-semibold text-[#1c7a3e]">
                        <span className={block.hidden ? "text-[#5b6b85]" : ""}>{block.hidden ? "Hidden" : "Visible"}</span>
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={!block.hidden}
                          onChange={(event) => setBlocks((current) => current?.map((item) => (item.key === block.key ? { ...item, hidden: !event.target.checked } : item)) ?? current)}
                        />
                        <span className="relative h-6 w-11 rounded-full bg-[#cbd5e1] transition peer-checked:bg-[#22a35a] after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
                      </label>
                      <button
                        type="button"
                        aria-label="Remove this section"
                        onClick={() => {
                          if (!window.confirm("Remove this section from the page? It is gone once you save.")) return;
                          const rest = blocks.filter((item) => item.key !== block.key);
                          setBlocks(rest);
                          setSelected(rest[0]?.key ?? null);
                        }}
                        className="rounded-lg p-2 text-[#a12020] hover:bg-[#fdecec]"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {form()}
                </section>
              ) : (
                <div className={`${card} grid min-h-64 place-items-center p-6 text-center text-sm text-[#5b6b85]`}>Press “Add Section” to start the page.</div>
              )}
              <div className={`${changed ? "sticky bottom-0" : ""} flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-[#e3e8f1] bg-white/95 px-5 py-3 shadow-sm backdrop-blur`}>
                {changed ? <span className="mr-auto text-sm font-semibold text-[#8a5a00]">You have unsaved changes</span> : <span className="mr-auto text-sm text-[#5b6b85]">Everything is saved.</span>}
                <button
                  type="button"
                  disabled={!changed || busy}
                  onClick={() => {
                    const last = JSON.parse(saved) as { info: typeof info; blocks: EditableBlock[] };
                    setInfo(last.info);
                    setBlocks(clone(last.blocks));
                  }}
                  className={secondaryButton}
                >
                  Discard
                </button>
                <button type="submit" disabled={!changed || busy} className={primaryButton}>
                  <SaveIcon className="h-4 w-4" /> {busy ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
