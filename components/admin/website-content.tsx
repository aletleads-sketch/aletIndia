"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import {
  FieldShell,
  HtmlTextsInput,
  ImageInput,
  ImagesInput,
  ItemsInput,
  LinkInput,
  ParagraphsInput,
  PolicyInput,
  TextInput,
} from "@/components/admin/content-fields";
import { ChartIcon, DownloadIcon, EyeIcon, GearIcon, GripIcon, MenuIcon, PlusIcon, SaveIcon, SearchIcon, ShareIcon, UsersIcon } from "@/components/admin/icons";
import { Loader } from "@/components/admin/loader";
import { MediaPicker } from "@/components/admin/media-library";
import { Notice, StudioHeader, card, formatDate, formatTime, imageSrc, primaryButton, secondaryButton, selectClass } from "@/components/admin/studio-ui";
import { aliDifferenceMarkup } from "@/lib/ali-difference-html";
import {
  CONTENT_ROLES,
  loadEditablePages,
  previewPath,
  publishContent,
  saveCompanyData,
  saveSectionFields,
  saveSectionLayout,
  uploadImage,
  type EditablePage,
  type SectionRow,
} from "@/lib/content-admin";
import { htmlTexts } from "@/lib/html-texts";
import { company as codeCompany, stats as codeStats } from "@/lib/content";
import { defaultFields, SECTION_FIELDS, type SectionId } from "@/lib/section-fields";
import { siteHref } from "@/lib/seo-admin";

type Values = Record<string, unknown>;
type FieldDef = { type: string; label: string; default: unknown };
const COMPANY = "_shared#company" as const;
type Selected = SectionId | typeof COMPANY;

/** Where the original words of the custom-designed blocks come from. */
const DESIGN_SOURCES: Partial<Record<SectionId, () => Promise<string[]>>> = {
  "/about-us#our_difference": async () => htmlTexts(aliDifferenceMarkup),
  "/about-us#story_journey": async () => {
    const response = await fetch(siteHref("/alet-india-our-journey.html"), { cache: "no-store" });
    return response.ok ? htmlTexts(await response.text()) : [];
  },
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function valuesFor(id: SectionId, row: SectionRow | undefined): Values {
  const defaults = defaultFields(id) as Values;
  const stored = (row?.content.fields ?? {}) as Values;
  return clone({ ...defaults, ...stored });
}

type CompanyForm = {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  established: string;
  careersEmail: string;
  clients: string;
  projects: string;
  countries: string;
  logo: string;
  logoLight: string;
  favicon: string;
};

function companyForm(row: SectionRow | null): CompanyForm {
  const data = (row?.content.data ?? {}) as Record<string, unknown>;
  const stats = (data.stats as { label: string; value: number }[] | undefined) ?? codeStats;
  const stat = (label: string) => String(stats.find((item) => item.label === label)?.value ?? "");
  return {
    name: String(data.name ?? codeCompany.name),
    tagline: String(data.tagline ?? codeCompany.tagline),
    email: String(data.email ?? codeCompany.email),
    phone: String(data.phone ?? codeCompany.phone),
    address: String(data.address ?? codeCompany.address),
    established: String(data.established ?? codeCompany.established),
    careersEmail: String(data.careers_email ?? "hr@aletindia.com"),
    logo: String(data.logo ?? ""),
    logoLight: String(data.logo_light ?? ""),
    favicon: String(data.favicon ?? ""),
    clients: stat("Clients"),
    projects: stat("Projects"),
    countries: stat("Countries"),
  };
}

/** Mockup-style names for the homepage's sections; other pages keep their database label. */
const HOME_NAMES: Record<string, string> = {
  hero: "Hero Banner",
  stats_bar: "Stats Bar",
  client_logos: "Client Logos",
  services: "Our Services",
  journey_timeline: "Our Journey",
  solution_lifecycle: "Process / How We Work",
  work: "Portfolio",
  process: "Our Ideology",
  industries: "Industries We Serve",
  testimonials: "Testimonials",
  about: "About Us",
  faqs: "FAQs",
  contact_form: "CTA (Get in Touch)",
};

const sectionName = (row: { label: string; section_key: string; page_path?: string }) =>
  (row.page_path === "/" ? HOME_NAMES[row.section_key] : undefined) ?? row.label.replace(/^Hero: .*/, "Hero Banner");

const formIds = new Set(Object.keys(SECTION_FIELDS));

/** The form a section row opens: its own, else the shared block it shows, else none. */
const formFor = (row: { page_path: string; section_key: string; shared_key?: string | null }): SectionId | null => {
  const own = `${row.page_path}#${row.section_key}`;
  if (formIds.has(own)) return own as SectionId;
  const shared = `_shared#${row.shared_key ?? row.section_key}`;
  return formIds.has(shared) ? (shared as SectionId) : null;
};

type LayoutRow = EditablePage["layout"][number];

/**
 * Edits the sections of one page (`page`), or the company details (`settings`).
 * With `fixedPage` the page picker is hidden, e.g. on the Homepage screen.
 */
export function WebsiteContentWorkspace({ initialPage = "/", initialSection, fixedPage = false, settings = false }: { initialPage?: string; initialSection?: string; fixedPage?: boolean; settings?: boolean }) {
  const { profile } = useAdmin();
  const [pagePath, setPagePath] = useState(initialPage);
  const canEdit = CONTENT_ROLES.has(profile.role);
  const [pages, setPages] = useState<EditablePage[] | null>(null);
  const [companyRow, setCompanyRow] = useState<SectionRow | null>(null);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [values, setValues] = useState<Values | null>(null);
  const [savedValues, setSavedValues] = useState<Values | null>(null);
  const [company, setCompany] = useState<CompanyForm | null>(null);
  const [savedCompany, setSavedCompany] = useState<CompanyForm | null>(null);
  const [originals, setOriginals] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [layoutDraft, setLayoutDraft] = useState<LayoutRow[] | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const rowFor = useCallback(
    (id: SectionId) => pages?.flatMap((page) => page.sections).find((section) => section.id === id),
    [pages],
  );

  const load = useCallback(async () => {
    const result = await loadEditablePages();
    setPages(result.pages);
    setCompanyRow(result.company);
    if (result.error) setError(result.error);
    if (settings) {
      const form = companyForm(result.company);
      setSelected(COMPANY);
      setCompany(form);
      setSavedCompany(form);
    }
  }, [settings]);

  useEffect(() => {
    if (!canEdit) return;
    // Loading on open is the point of this screen; the state updates happen after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [canEdit, load]);

  const changed =
    selected === COMPANY ? JSON.stringify(company) !== JSON.stringify(savedCompany) : JSON.stringify(values) !== JSON.stringify(savedValues);

  const open = async (id: Selected) => {
    if (changed && !window.confirm("You have unsaved changes. Leave this section without saving?")) return;
    setNotice(null);
    setError(null);
    setSelected(id);
    if (id === COMPANY) {
      const form = companyForm(companyRow);
      setCompany(form);
      setSavedCompany(form);
      return;
    }
    const next = valuesFor(id, rowFor(id));
    setValues(next);
    setSavedValues(clone(next));
    setOriginals([]);
    const source = DESIGN_SOURCES[id];
    if (source) setOriginals(await source());
  };

  const page = pages?.find((item) => item.path === pagePath) ?? pages?.[0];

  // Open a section as soon as the page is known: the one asked for, else the first.
  useEffect(() => {
    if (settings || !page || selected) return;
    const rows = page.layout.filter((row) => formFor(row));
    const wanted = rows.find((row) => row.section_key === initialSection) ?? rows[0];
    const form = wanted ? formFor(wanted) : null;
    // Opening loads the section's original words for custom designs, which resolves later.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (form) void open(form);
    // open() is recreated each render; running once per page is the intent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?.path, settings]);

  useEffect(() => {
    if (!changed) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed]);

  const switchPage = (path: string) => {
    if (changed && !window.confirm("You have unsaved changes. Leave this page without saving?")) return;
    setValues(null);
    setSavedValues(null);
    setSelected(null);
    setLayoutDraft(null);
    setPagePath(path);
    window.history.replaceState(null, "", `${window.location.pathname}?page=${encodeURIComponent(path)}`);
  };

  if (!canEdit) {
    return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins, editors and marketing can change website content.</div>;
  }

  const selectedRow = selected && selected !== COMPANY ? rowFor(selected) : undefined;
  const fields = selected && selected !== COMPANY ? (SECTION_FIELDS[selected] as Record<string, FieldDef>) : null;

  const set = (name: string, value: unknown) => {
    setNotice(null);
    setError(null);
    setValues((current) => (current ? { ...current, [name]: value } : current));
  };

  const finish = async (message: string) => {
    const publishError = await publishContent();
    setNotice(publishError ?? message);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    if (selected === COMPANY) {
      if (!companyRow || !company) {
        setSaving(false);
        return setError("The company details row is missing in the database.");
      }
      const established = Number(company.established);
      if (!company.email.includes("@") || !company.careersEmail.includes("@")) {
        setSaving(false);
        return setError("Check the email addresses.");
      }
      if (!Number.isInteger(established) || established < 1900 || established > new Date().getFullYear()) {
        setSaving(false);
        return setError("The founding year must be a year like 2017.");
      }
      const number = (value: string, fallback: number) => (Number.isFinite(Number(value)) && value.trim() ? Number(value) : fallback);
      const data = {
        ...(companyRow.content.data ?? {}),
        name: company.name.trim(),
        tagline: company.tagline.trim(),
        email: company.email.trim(),
        phone: company.phone.trim(),
        phoneHref: `tel:${company.phone.replace(/[^\d+]/g, "")}`,
        address: company.address.trim(),
        established,
        careers_email: company.careersEmail.trim(),
        logo: company.logo.trim(),
        logo_light: company.logoLight.trim(),
        favicon: company.favicon.trim(),
        stats: [
          { label: "Clients", value: number(company.clients, 500) },
          { label: "Projects", value: number(company.projects, 500) },
          { label: "Countries", value: number(company.countries, 20) },
        ],
      };
      const { row, error: saveError } = await saveCompanyData(companyRow, data);
      setSaving(false);
      if (saveError || !row) return setError(saveError ?? "Could not save.");
      setCompanyRow(row);
      setSavedCompany(company);
      return finish("Company details saved. The website shows them now.");
    }
    if (!selectedRow || !values) {
      setSaving(false);
      return setError("This section is missing in the database.");
    }
    const { row, error: saveError } = await saveSectionFields(selectedRow, values);
    setSaving(false);
    if (saveError || !row) return setError(saveError ?? "Could not save.");
    setPages((current) =>
      current?.map((page) => ({ ...page, sections: page.sections.map((section) => (section.id === selected ? { ...section, ...row, id: section.id } : section)) })) ?? current,
    );
    setSavedValues(clone(values));
    await finish("Saved. The website shows the change now.");
  };

  const editor = (name: string, field: FieldDef, stacked = false) => {
    if (!values) return null;
    const value = values[name];
    const reset = field.type === "htmlTexts" ? undefined : () => set(name, clone(field.default));
    switch (field.type) {
      case "text":
      case "textarea":
        return (
          <FieldShell key={name} label={field.label} onReset={value !== field.default ? reset : undefined}>
            <TextInput value={String(value ?? "")} onChange={(next) => set(name, next)} multiline={field.type === "textarea"} placeholder={String(field.default)} />
          </FieldShell>
        );
      case "paragraphs":
        return (
          <FieldShell key={name} label={field.label} onReset={reset}>
            <ParagraphsInput value={(value as string[]) ?? []} onChange={(next) => set(name, next)} />
          </FieldShell>
        );
      case "image":
        return (
          <FieldShell key={name} label={field.label} onReset={reset}>
            <ImageInput value={(value as { src: string; alt: string }) ?? { src: "", alt: "" }} onChange={(next) => set(name, next)} stacked={stacked} />
          </FieldShell>
        );
      case "images":
        return (
          <FieldShell key={name} label={field.label} onReset={reset}>
            <ImagesInput value={(value as { src: string; alt: string }[]) ?? []} onChange={(next) => set(name, next)} />
          </FieldShell>
        );
      case "link":
        return (
          <FieldShell key={name} label={field.label} onReset={reset}>
            <LinkInput value={(value as { label: string; href: string }) ?? { label: "", href: "" }} onChange={(next) => set(name, next)} />
          </FieldShell>
        );
      case "policy":
        return (
          <FieldShell key={name} label={field.label} onReset={reset}>
            <PolicyInput value={(value as { heading?: string; paragraphs: string[]; list?: string[] }[]) ?? []} onChange={(next) => set(name, next)} />
          </FieldShell>
        );
      case "items":
        return (
          <FieldShell key={name} label={field.label} onReset={reset}>
            <ItemsInput value={(value as Record<string, string | string[]>[]) ?? []} template={field.default as Record<string, string | string[]>[]} onChange={(next) => set(name, next)} />
          </FieldShell>
        );
      case "htmlTexts": {
        const list = (value as string[])?.length ? (value as string[]) : originals;
        return (
          <FieldShell key={name} label={field.label} onReset={originals.length ? () => set(name, [...originals]) : undefined}>
            <HtmlTextsInput value={list} original={originals} onChange={(next) => set(name, next)} />
          </FieldShell>
        );
      }
      default:
        return null;
    }
  };

  /** Moves a section in the list while it is dragged (saved when the drag ends). */
  const moveRow = (from: number, to: number) => {
    const rows = [...(layoutDraft ?? page?.layout ?? [])];
    const [row] = rows.splice(from, 1);
    rows.splice(to, 0, row);
    setLayoutDraft(rows);
  };

  const storeLayout = async (rows: LayoutRow[], message: string) => {
    if (!page) return;
    setError(null);
    setNotice(null);
    const saveError = await saveSectionLayout(page.path, rows.map((row) => ({ section_key: row.section_key, hidden: Boolean(row.hidden) })));
    if (saveError) {
      setLayoutDraft(null);
      return setError(saveError);
    }
    const ordered = rows.map((row, index) => ({ ...row, sort_order: (index + 1) * 10 }));
    setPages((current) => current?.map((item) => (item.path === page.path ? { ...item, layout: ordered } : item)) ?? current);
    setLayoutDraft(null);
    await finish(message);
  };

  const saveLayout = async () => {
    if (!layoutDraft || !page) return;
    if (layoutDraft.every((row, index) => row.section_key === page.layout[index]?.section_key)) return setLayoutDraft(null);
    await storeLayout(layoutDraft, "New order saved. The website shows it now.");
  };

  const setHidden = async (key: string, hidden: boolean) => {
    if (!page) return;
    setAdding(false);
    const rows = page.layout.map((row) => (row.section_key === key ? { ...row, hidden } : row));
    setPages((current) => current?.map((item) => (item.path === page.path ? { ...item, layout: rows } : item)) ?? current);
    await storeLayout(rows, hidden ? "Section hidden. It is no longer on the website." : "Section is back on the website.");
  };

  const setCompanyField = (key: keyof CompanyForm, value: string) => {
    setNotice(null);
    setError(null);
    setCompany((current) => (current ? { ...current, [key]: value } : current));
  };

  const pageName = page?.path === "_shared" ? "Shared sections" : page?.path === "/" ? "Homepage" : (page?.name ?? "Page");
  const isHome = page?.path === "/";
  const crumbs = settings
    ? [{ label: "CMS", href: "/admin" }, { label: "Site Settings" }]
    : isHome
      ? [{ label: "Homepage", href: "/admin/homepage" }, { label: "Edit Homepage" }]
      : [{ label: "Pages", href: "/admin/pages" }, { label: `Edit ${pageName}` }];

  // Each row of the page: its own form, else the shared block it shows, else none.
  const layout = (layoutDraft ?? page?.layout ?? []).map((row) => ({ ...row, form: formFor(row) }));
  const hiddenRows = layout.filter((row) => row.hidden);
  const fieldEntries = fields ? Object.entries(fields) : [];
  const pictureFields = fieldEntries.filter(([, field]) => field.type === "image");
  const otherFields = fieldEntries.filter(([, field]) => field.type !== "image");
  const selectedLayoutRow = layout.find((row) => row.form === selected);
  const managedIn = selectedLayoutRow ? MANAGED_IN[selectedLayoutRow.section_key] : undefined;
  const sharedNote = selectedLayoutRow && selected?.startsWith("_shared#") && page?.path !== "_shared";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <StudioHeader
          crumbs={crumbs}
          back={settings ? undefined : isHome ? "/admin" : "/admin/pages"}
          title={settings ? "Site Settings" : `Edit ${pageName}`}
          subtitle={
            settings
              ? "Configure your website settings and preferences."
              : isHome
                ? "Manage the content and sections of your website homepage."
                : page?.path === "_shared"
                  ? "Sections used on many pages, like the footer and the contact form."
                  : "Manage the content and sections of this page."
          }
          actions={
            <>
              {!settings && !fixedPage && pages ? (
                <select value={page?.path ?? ""} onChange={(event) => switchPage(event.target.value)} aria-label="Page" className={`${selectClass} max-w-60 py-2.5 font-semibold`}>
                  {pages.map((item) => (
                    <option key={item.path} value={item.path}>
                      {item.path === "_shared" ? "Shared sections" : item.name}
                    </option>
                  ))}
                </select>
              ) : null}
              {!settings ? (
                <a href={siteHref(previewPath(page?.path ?? "/"))} target="_blank" rel="noreferrer" className={secondaryButton}>
                  <EyeIcon className="h-4 w-4" /> Preview
                </a>
              ) : null}
              <button type="submit" form="content-form" disabled={!changed || saving || !selected} className={primaryButton}>
                <SaveIcon className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
              </button>
            </>
          }
        />

        {!pages ? <Loader label="Loading pages…" /> : null}
        {pages ? (
          <div className="px-4 pt-5 pb-8 lg:px-8">
            <div className={`grid gap-6 ${settings ? "lg:grid-cols-[15rem_minmax(0,1fr)]" : "lg:grid-cols-[18rem_minmax(0,1fr)]"}`}>
              {settings ? <SettingsTabs active="General" /> : null}
              {!settings && page ? (
                <aside className={`${card} h-fit p-4 lg:sticky lg:top-4`}>
                  <p className="px-1 pb-3 text-[15px] font-bold">{pageName} Sections</p>
                  <ol className="space-y-1.5">
                    {layout.map((row, index) => {
                      const active = Boolean(row.form) && row.form === selected;
                      return (
                        <li
                          key={row.id}
                          draggable={isHome}
                          onDragStart={() => setDragging(index)}
                          onDragOver={(event) => {
                            if (dragging === null || dragging === index) return;
                            event.preventDefault();
                            moveRow(dragging, index);
                            setDragging(index);
                          }}
                          onDragEnd={() => {
                            setDragging(null);
                            void saveLayout();
                          }}
                          className={dragging === index ? "opacity-50" : ""}
                        >
                          <button
                            type="button"
                            disabled={!row.form}
                            onClick={() => row.form && void open(row.form)}
                            title={row.form ? undefined : "This section has nothing to edit here."}
                            className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[15px] ${
                              active ? "border-[#bcd2fb] bg-[#e8f0ff] font-semibold text-[#1a4fb8]" : "border-[#eef1f6] bg-white text-[#1e293b] hover:bg-[#f5f7fb]"
                            } ${row.hidden ? "opacity-55" : ""} disabled:cursor-default`}
                          >
                            {isHome ? <GripIcon className={`h-4 w-4 shrink-0 cursor-grab ${active ? "text-[#1a63e8]" : "text-[#94a3b8]"}`} /> : <span className="w-5 shrink-0 text-xs font-bold text-[#94a3b8]">{index + 1}</span>}
                            <span className="min-w-0 flex-1 truncate">{sectionName(row)}</span>
                            {row.hidden ? <span className="rounded-full bg-[#eef1f6] px-2 py-0.5 text-[11px] font-semibold text-[#5b6b85]">Hidden</span> : null}
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                  {isHome ? (
                    <div className="relative mt-4">
                      <button type="button" onClick={() => setAdding((value) => !value)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#c7d6ee] py-2.5 text-[15px] font-semibold text-[#1a63e8] hover:bg-[#f0f5ff]">
                        <PlusIcon className="h-4 w-4" /> Add Section
                      </button>
                      {adding ? (
                        <div className="absolute inset-x-0 z-20 mt-2 rounded-xl border border-[#dfe5ef] bg-white p-2 shadow-xl">
                          {hiddenRows.length ? (
                            <>
                              <p className="px-2 pb-1 text-xs font-semibold text-[#5b6b85]">Show a hidden section again</p>
                              {hiddenRows.map((row) => (
                                <button key={row.id} type="button" onClick={() => void setHidden(row.section_key, false)} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f5f7fb]">
                                  + {sectionName(row)}
                                </button>
                              ))}
                            </>
                          ) : (
                            <p className="px-2 py-1 text-sm text-[#5b6b85]">All sections are already on the page. Switch one off with its Visible switch to take it away; it comes back from here.</p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {isHome ? <p className="mt-3 px-1 text-xs text-[#5b6b85]">Drag the ⋮⋮ handle to change the order on the website.</p> : null}
                </aside>
              ) : null}

              {!selected ? (
                <div className={`${card} grid min-h-64 place-items-center p-6 text-center text-sm text-[#5b6b85]`}>{layout.length ? "Pick a section on the left." : "This page has no editable sections."}</div>
              ) : (
                <form id="content-form" onSubmit={submit} className="min-w-0 space-y-5">
                  {notice ? <Notice>{notice}</Notice> : null}
                  {error ? <Notice tone="bad">{error}</Notice> : null}

                  <section className={`${card} p-5 lg:p-6`}>
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[22px] font-extrabold">{selected === COMPANY ? "General Settings" : selectedLayoutRow ? sectionName(selectedLayoutRow) : sectionName(selectedRow ?? { label: "", section_key: "" })}</h2>
                        {selectedRow?.updated_at ? (
                          <p className="text-xs text-[#5b6b85]">
                            Last saved {formatDate(selectedRow.updated_at)}, {formatTime(selectedRow.updated_at)}
                          </p>
                        ) : null}
                      </div>
                      {isHome && selectedLayoutRow ? (
                        <label className="inline-flex cursor-pointer items-center gap-2.5 text-[15px] font-semibold text-[#1c7a3e]">
                          <span className={selectedLayoutRow.hidden ? "text-[#5b6b85]" : ""}>{selectedLayoutRow.hidden ? "Hidden" : "Visible"}</span>
                          <input type="checkbox" className="peer sr-only" checked={!selectedLayoutRow.hidden} onChange={(event) => void setHidden(selectedLayoutRow.section_key, !event.target.checked)} />
                          <span className="relative h-6 w-11 rounded-full bg-[#cbd5e1] transition peer-checked:bg-[#22a35a] after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-[#1a63e8]/40" />
                        </label>
                      ) : null}
                    </div>
                    {sharedNote ? <p className="mb-5 rounded-lg bg-[#f5f7fb] px-3 py-2 text-xs text-[#5b6b85]">This block is shared: the same words show on every page that uses it.</p> : null}
                    {managedIn ? (
                      <p className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-[#dbe5f5] bg-[#f5f9ff] px-3 py-2 text-sm text-[#334155]">
                        The items in this section are managed in
                        <Link href={managedIn.href} className="font-semibold text-[#1a63e8] hover:underline">
                          {managedIn.label} →
                        </Link>
                      </p>
                    ) : null}
                    {selected === COMPANY && company ? (
                      <div className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FieldShell label="Site Title (company name)"><TextInput value={company.name} onChange={(next) => setCompanyField("name", next)} /></FieldShell>
                          <FieldShell label="Site URL" hint="Set by the web host."><input readOnly value="https://www.aletindia.com" className={`${selectClass} w-full bg-[#f8fafd] text-[#5b6b85]`} /></FieldShell>
                          <FieldShell label="Tagline"><TextInput value={company.tagline} onChange={(next) => setCompanyField("tagline", next)} /></FieldShell>
                          <FieldShell label="Default Language" hint="The website is in English."><select disabled className={`${selectClass} w-full bg-[#f8fafd]`}><option>English</option></select></FieldShell>
                          <FieldShell label="Sales email" hint="Shown in the footer, contact page and forms."><TextInput value={company.email} onChange={(next) => setCompanyField("email", next)} /></FieldShell>
                          <FieldShell label="Phone"><TextInput value={company.phone} onChange={(next) => setCompanyField("phone", next)} /></FieldShell>
                          <FieldShell label="Careers email" hint="Shown on the Career and Contact pages."><TextInput value={company.careersEmail} onChange={(next) => setCompanyField("careersEmail", next)} /></FieldShell>
                          <FieldShell label="Founding year" hint="The years-of-experience number counts from this."><TextInput value={company.established} onChange={(next) => setCompanyField("established", next)} /></FieldShell>
                        </div>
                        <FieldShell label="Address" hint="Also used for the map on the Contact page."><TextInput value={company.address} onChange={(next) => setCompanyField("address", next)} multiline /></FieldShell>
                        <div>
                          <p className="text-sm font-semibold">Numbers in the stats bar</p>
                          <div className="mt-2 grid gap-4 sm:grid-cols-3">
                            <FieldShell label="Happy clients"><TextInput value={company.clients} onChange={(next) => setCompanyField("clients", next)} /></FieldShell>
                            <FieldShell label="Projects delivered"><TextInput value={company.projects} onChange={(next) => setCompanyField("projects", next)} /></FieldShell>
                            <FieldShell label="Countries served"><TextInput value={company.countries} onChange={(next) => setCompanyField("countries", next)} /></FieldShell>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <BrandField label="Logo" hint="On white backgrounds (header when scrolled)." value={company.logo} fallback="/images/logo-dark.png" onChange={(next) => setCompanyField("logo", next)} />
                          <BrandField label="Logo for dark backgrounds" hint="Top of the pages and the footer." value={company.logoLight} fallback="/images/logo-white.png" dark onChange={(next) => setCompanyField("logoLight", next)} />
                          <BrandField label="Favicon" hint="The small icon in the browser tab. Square PNG, 512 × 512 is best." value={company.favicon} fallback="/icon.png" small onChange={(next) => setCompanyField("favicon", next)} />
                        </div>
                      </div>
                    ) : null}
                    {fields ? (
                      <div className={`grid gap-6 ${pictureFields.length && otherFields.length ? "xl:grid-cols-[minmax(0,1fr)_20rem]" : ""}`}>
                        {otherFields.length ? <div className="min-w-0 space-y-5">{otherFields.map(([name, field]) => editor(name, field))}</div> : null}
                        {pictureFields.length ? <div className="min-w-0 space-y-5">{pictureFields.map(([name, field]) => editor(name, field, otherFields.length > 0))}</div> : null}
                      </div>
                    ) : null}
                  </section>

                  <div className={`${changed ? "sticky bottom-0" : ""} flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-[#e3e8f1] bg-white/95 px-5 py-3 shadow-sm backdrop-blur`}>
                    {changed ? <span className="mr-auto text-sm font-semibold text-[#8a5a00]">You have unsaved changes</span> : <span className="mr-auto text-sm text-[#5b6b85]">Everything is saved.</span>}
                    <button
                      type="button"
                      disabled={!changed || saving}
                      onClick={() => {
                        setError(null);
                        if (selected === COMPANY) setCompany(savedCompany);
                        else setValues(savedValues ? clone(savedValues) : savedValues);
                      }}
                      className={secondaryButton}
                    >
                      Discard
                    </button>
                    <button type="submit" disabled={!changed || saving} className={primaryButton}>
                      <SaveIcon className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Where the cards of a list-driven section are edited. */
const MANAGED_IN: Record<string, { label: string; href: string }> = {
  services: { label: "Services", href: "/admin/lists/services" },
  work: { label: "Portfolio → Projects", href: "/admin/lists/projects" },
  industries: { label: "Portfolio → Industries", href: "/admin/lists/industries" },
  testimonials: { label: "FAQs & Testimonials → Testimonials", href: "/admin/lists/testimonials" },
  faqs: { label: "FAQs & Testimonials", href: "/admin/lists/faqs" },
  client_logos: { label: "Portfolio → Client logos", href: "/admin/lists/client_logos" },
};

const SETTINGS_TABS = [
  { label: "General", href: "/admin/settings", icon: GearIcon },
  { label: "SEO", href: "/admin/seo/settings", icon: SearchIcon, adminOnly: true },
  { label: "Social Media", href: "/admin/lists/menu_items?menu=footer_social", icon: ShareIcon },
  { label: "Menus", href: "/admin/lists/menu_items", icon: MenuIcon },
  { label: "Analytics", href: "/admin/settings/analytics", icon: ChartIcon },
  { label: "Users", href: "/admin/team", icon: UsersIcon, adminOnly: true },
  { label: "Backup", href: "/admin/settings/backup", icon: DownloadIcon },
];

/** The left column of Site Settings, as in the mockup. */
export function SettingsTabs({ active: current }: { active: string }) {
  const { profile } = useAdmin();
  return (
    <nav className={`${card} h-fit p-3`}>
      {SETTINGS_TABS.filter((tab) => !("adminOnly" in tab) || profile.role === "admin").map(({ label, href, icon: Icon }) => {
        const active = label === current;
        return (
          <Link key={label} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] ${active ? "bg-[#e8f0ff] font-semibold text-[#1a4fb8]" : "text-[#334155] hover:bg-[#f5f7fb]"}`}>
            <Icon className="h-4.5 w-4.5" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** A logo or favicon in Site Settings: the current picture, with change and reset buttons. */
function BrandField({ label, hint, value, fallback, onChange, dark = false, small = false }: { label: string; hint: string; value: string; fallback: string; onChange: (value: string) => void; dark?: boolean; small?: boolean }) {
  const [picking, setPicking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setProblem(null);
    const { url, error } = await uploadImage(file);
    setUploading(false);
    if (error || !url) return setProblem(error ?? "Upload failed.");
    onChange(url);
  };
  return (
    <div>
      <p className="mb-1 text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#e3e8f1] bg-[#f8fafd] p-4">
        <span className={`grid h-16 shrink-0 place-items-center rounded-lg px-3 ${small ? "w-16" : "w-44"} ${dark ? "bg-[#0b1f3f]" : "bg-white"} border border-[#e3e8f1]`}>
          {/* A plain img: shows exactly the chosen file. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc(value || fallback)} alt={label} className={small ? "h-10 w-10 object-contain" : "max-h-12 w-auto max-w-full object-contain"} />
        </span>
        <span className="flex flex-wrap gap-2">
          <label className={`${secondaryButton} cursor-pointer py-1.5 text-xs`}>
            {uploading ? "Uploading…" : `Change ${small ? "Favicon" : "Logo"}`}
            <input type="file" accept="image/png,image/webp,image/jpeg,image/gif" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
          </label>
          <button type="button" onClick={() => setPicking(true)} className={`${secondaryButton} py-1.5 text-xs`}>
            From library
          </button>
          {value ? (
            <button type="button" onClick={() => onChange("")} className="text-xs font-semibold text-[#1a63e8] hover:underline">
              Use original
            </button>
          ) : null}
        </span>
        <span className="basis-full text-xs text-[#5b6b85]">{problem ?? hint}</span>
      </div>
      {picking ? (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={(url) => {
            setPicking(false);
            onChange(url);
          }}
        />
      ) : null}
    </div>
  );
}
