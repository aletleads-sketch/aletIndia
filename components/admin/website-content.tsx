"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { UserMenu, useAdmin } from "@/components/admin/admin-shell";
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
  inputClass,
} from "@/components/admin/content-fields";
import { Loader } from "@/components/admin/loader";
import { aliDifferenceMarkup } from "@/lib/ali-difference-html";
import {
  CONTENT_ROLES,
  loadEditablePages,
  previewPath,
  publishContent,
  saveCompanyData,
  saveSectionFields,
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
    clients: stat("Clients"),
    projects: stat("Projects"),
    countries: stat("Countries"),
  };
}

export function WebsiteContentWorkspace() {
  const { profile } = useAdmin();
  const canEdit = CONTENT_ROLES.has(profile.role);
  const [pages, setPages] = useState<EditablePage[] | null>(null);
  const [companyRow, setCompanyRow] = useState<SectionRow | null>(null);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [values, setValues] = useState<Values | null>(null);
  const [savedValues, setSavedValues] = useState<Values | null>(null);
  const [company, setCompany] = useState<CompanyForm | null>(null);
  const [savedCompany, setSavedCompany] = useState<CompanyForm | null>(null);
  const [originals, setOriginals] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const rowFor = useCallback(
    (id: SectionId) => pages?.flatMap((page) => page.sections).find((section) => section.id === id),
    [pages],
  );

  const load = useCallback(async () => {
    const result = await loadEditablePages();
    setPages(result.pages);
    setCompanyRow(result.company);
    if (result.error) setError(result.error);
  }, []);

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

  const filtered = useMemo(() => {
    if (!pages) return [];
    const query = search.trim().toLowerCase();
    if (!query) return pages;
    return pages
      .map((page) => ({
        ...page,
        sections: page.name.toLowerCase().includes(query) || page.path.includes(query) ? page.sections : page.sections.filter((section) => section.label.toLowerCase().includes(query)),
      }))
      .filter((page) => page.sections.length);
  }, [pages, search]);

  if (!canEdit) {
    return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins, editors and marketing can change website content.</div>;
  }

  const selectedRow = selected && selected !== COMPANY ? rowFor(selected) : undefined;
  const selectedPage = selected === COMPANY ? "_shared" : selected?.split("#")[0];
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

  const editor = (name: string, field: FieldDef) => {
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
            <ImageInput value={(value as { src: string; alt: string }) ?? { src: "", alt: "" }} onChange={(next) => set(name, next)} />
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

  const setCompanyField = (key: keyof CompanyForm, value: string) => {
    setNotice(null);
    setError(null);
    setCompany((current) => (current ? { ...current, [key]: value } : current));
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">Website Content</h1>
          <p className="text-sm text-[#5b6b85]">Change the words and pictures on every page. Saved changes show on the website straight away.</p>
        </div>
        <UserMenu />
      </header>

      {!pages ? <Loader label="Loading pages…" /> : null}
      {pages ? (
        <div className="grid min-h-0 flex-1 lg:grid-cols-[19rem_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto border-b border-[#dfe5ef] bg-white p-4 lg:border-r lg:border-b-0">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a page or section…" className={inputClass} />
            <button
              type="button"
              onClick={() => void open(COMPANY)}
              className={`mt-4 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold ${selected === COMPANY ? "bg-[#1a63e8] text-white" : "bg-[#f3f6fb] hover:bg-[#e8eef8]"}`}
            >
              Company details
              <span className={`block text-xs font-normal ${selected === COMPANY ? "text-white/80" : "text-[#5b6b85]"}`}>Phone, email, address, numbers</span>
            </button>
            <nav className="mt-4 space-y-4" aria-label="Pages">
              {filtered.map((page) => (
                <div key={page.path}>
                  <p className="px-1 text-xs font-bold tracking-wide text-[#5b6b85] uppercase">{page.name}</p>
                  <ul className="mt-1 space-y-0.5">
                    {page.sections.map((section) => (
                      <li key={section.id}>
                        <button
                          type="button"
                          onClick={() => void open(section.id)}
                          className={`w-full rounded-lg px-3 py-1.5 text-left text-sm ${selected === section.id ? "bg-[#1a63e8] font-semibold text-white" : "text-[#1e293b] hover:bg-[#f3f6fb]"}`}
                        >
                          {section.label.replace(/^Hero: .*/, "Top of the page")}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {!filtered.length ? <p className="text-sm text-[#5b6b85]">Nothing matches.</p> : null}
            </nav>
          </aside>

          <div className="min-h-0 overflow-y-auto p-4 lg:p-6">
            {!selected ? (
              <div className="grid h-full place-items-center text-center text-sm text-[#5b6b85]">
                <div>
                  <p className="text-base font-semibold text-[#0f1b33]">Pick a page section on the left</p>
                  <p className="mt-1">Every heading, paragraph, button and picture of that section opens here.</p>
                  <p className="mt-1">Lists such as services, blogs, FAQs and testimonials are edited in their own screens.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mx-auto max-w-4xl space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-wide text-[#5b6b85] uppercase">{pages.find((page) => page.path === selectedPage)?.name ?? "Used on many pages"}</p>
                    <h2 className="text-xl font-extrabold">{selected === COMPANY ? "Company details" : selectedRow?.label.replace(/^Hero: .*/, "Top of the page")}</h2>
                    {selectedRow?.updated_at ? <p className="text-xs text-[#5b6b85]">Last saved {new Date(selectedRow.updated_at).toLocaleString()}</p> : null}
                  </div>
                  <a href={siteHref(previewPath(selectedPage ?? "/"))} target="_blank" rel="noreferrer" className="rounded-lg border border-[#d4dbe7] bg-white px-3 py-2 text-sm font-semibold hover:bg-[#f3f6fb]">
                    Open the page ↗
                  </a>
                </div>

                {notice ? <p className="rounded-xl border border-[#bfe5cc] bg-[#eaf7ef] p-4 text-sm text-[#1c7a3e]">{notice}</p> : null}

                <section className="space-y-5 rounded-2xl border border-[#dfe5ef] bg-white px-5 py-5">
                  {selected === COMPANY && company ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FieldShell label="Company name"><TextInput value={company.name} onChange={(next) => setCompanyField("name", next)} /></FieldShell>
                        <FieldShell label="Tagline"><TextInput value={company.tagline} onChange={(next) => setCompanyField("tagline", next)} /></FieldShell>
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
                    </>
                  ) : null}
                  {fields ? Object.entries(fields).map(([name, field]) => editor(name, field)) : null}
                </section>

                <div className={`${changed ? "sticky bottom-0" : ""} flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-[#dfe5ef] bg-white px-5 py-3 shadow-sm`}>
                  {error ? <p className="w-full rounded-lg bg-[#fdecec] px-3 py-2 text-sm text-[#a12020]">{error}</p> : null}
                  {changed ? <span className="mr-auto text-sm font-semibold text-[#8a5a00]">Unsaved changes</span> : null}
                  <button
                    type="button"
                    disabled={!changed || saving}
                    onClick={() => {
                      setError(null);
                      if (selected === COMPANY) setCompany(savedCompany);
                      else setValues(savedValues ? clone(savedValues) : savedValues);
                    }}
                    className="rounded-xl border border-[#d4dbe7] px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
                  >
                    Discard
                  </button>
                  <button type="submit" disabled={!changed || saving} className="rounded-xl bg-[#1a63e8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
                    {saving ? "Saving…" : "Save and publish"}
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
