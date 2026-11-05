"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { Loader } from "@/components/admin/loader";
import { XIcon } from "@/components/admin/icons";
import { faqs } from "@/lib/content";
import { careers } from "@/lib/pages";
import { jsonLd, pageUrl } from "@/lib/seo";
import { publishSeoChanges } from "@/lib/seo-admin";
import {
  defaultSchemaSettings,
  faqSchema,
  isDate,
  jobPostingSchema,
  ORGANIZATION_DEFAULTS,
  organizationSchema,
  SCHEMA_INFO,
  SCHEMA_TYPES,
  type JobPostingData,
  type OrganizationData,
  type SchemaRow,
  type SchemaSettings,
  type SchemaType,
} from "@/lib/seo-schema-shared";
import { getSupabase } from "@/lib/supabase-browser";

const input = "w-full rounded-lg border border-[#d4dbe7] px-3 py-2 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20";
const button = "rounded-xl px-4 py-2.5 text-sm font-semibold";

/** A page Google can test for each type, so the admin can check the result with one click. */
const SAMPLE_PAGE: Record<SchemaType, string> = {
  organization: "/",
  service: "/mobile-app-development",
  faq: "/",
  article: "/blogs/why-user-centric-design-is-key-to-app-success",
  job_posting: "/career",
  breadcrumb: "/mobile-app-development",
};

function preview(type: SchemaType, settings: SchemaSettings): Record<string, unknown> | null {
  const organization = organizationSchema(settings.organization.data as OrganizationData);
  if (type === "organization") return organization;
  if (type === "faq") return faqSchema(faqs);
  if (type === "job_posting") {
    const data = settings.job_posting.data as JobPostingData;
    const job = careers.openings[0];
    return job ? jobPostingSchema(job, { ...data, datePosted: data.datePosted || "YYYY-MM-DD" }, organization.name) : null;
  }
  return null;
}

export function SeoSchemaWorkspace() {
  const { profile } = useAdmin();
  const isAdmin = profile.role === "admin";
  const [settings, setSettings] = useState<SchemaSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<SchemaType>("organization");
  const [busyType, setBusyType] = useState<SchemaType | null>(null);
  const [editing, setEditing] = useState<"organization" | "job_posting" | null>(null);

  const load = useCallback(async () => {
    const { data, error: loadError } = await getSupabase().from("seo_schema").select("type,enabled,data");
    if (loadError) setError(loadError.message);
    const next = defaultSchemaSettings();
    for (const row of (data as SchemaRow[] | null) ?? []) if (row.type in next) next[row.type] = row;
    setSettings(next);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    // Loading on open is the point of this screen; the state updates happen after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [isAdmin, load]);

  const save = useCallback(
    async (type: SchemaType, patch: Partial<Pick<SchemaRow, "enabled" | "data">>, done: string) => {
      if (!settings) return false;
      setBusyType(type);
      setError(null);
      setNotice(null);
      const row = { ...settings[type], ...patch };
      const { error: saveError } = await getSupabase().from("seo_schema").upsert({ type, enabled: row.enabled, data: row.data });
      if (saveError) {
        setBusyType(null);
        setError(saveError.message);
        return false;
      }
      setSettings({ ...settings, [type]: row });
      const publishError = await publishSeoChanges();
      setBusyType(null);
      setNotice(publishError ?? done);
      return true;
    },
    [settings],
  );

  const json = useMemo(() => {
    if (!settings) return null;
    const data = preview(selected, settings);
    return data ? JSON.stringify(JSON.parse(jsonLd(data).__html.replace(/\\u003c/g, "<")), null, 2) : null;
  }, [selected, settings]);

  if (!isAdmin) {
    return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins can manage SEO.</div>;
  }

  const jobDate = (settings?.job_posting.data as JobPostingData | undefined)?.datePosted;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">Schema Markup</h1>
          <p className="text-sm text-[#5b6b85]">Structured data that helps Google understand the company, services, FAQs, blogs and jobs</p>
        </div>
        <UserMenu />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        {error ? <p className="mb-4 rounded-xl border border-[#f3c2c2] bg-[#fdecec] p-4 text-sm text-[#a12020]">{error}</p> : null}
        {notice ? <p className="mb-4 rounded-xl border border-[#bfe5cc] bg-[#eaf7ef] p-4 text-sm text-[#1c7a3e]">{notice}</p> : null}
        {!settings ? <Loader /> : null}

        {settings ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section className="overflow-hidden rounded-2xl border border-[#dfe5ef] bg-white">
              <ul className="divide-y divide-[#eef1f6]">
                {SCHEMA_TYPES.map((type) => {
                  const row = settings[type];
                  const info = SCHEMA_INFO[type];
                  const waiting = type === "job_posting" && row.enabled && !isDate(jobDate);
                  return (
                    <li key={type} className={`flex flex-wrap items-start gap-3 px-5 py-4 ${selected === type ? "bg-[#f4f8ff]" : ""}`}>
                      <button type="button" onClick={() => setSelected(type)} className="min-w-0 flex-1 text-left">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">{info.label}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${waiting ? "bg-[#fff3d9] text-[#8a5a00]" : row.enabled ? "bg-[#eaf7ef] text-[#1c7a3e]" : "bg-[#eef2f8] text-[#5b6b85]"}`}
                          >
                            {waiting ? "Needs posting date" : row.enabled ? "Active" : "Off"}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm text-[#5b6b85]">{info.where}</span>
                      </button>
                      <div className="flex shrink-0 items-center gap-2">
                        {type === "organization" || type === "job_posting" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(type);
                              setEditing(type);
                            }}
                            className="rounded-lg border border-[#d4dbe7] px-3 py-1.5 text-sm font-semibold hover:border-[#b9c6db]"
                          >
                            Edit
                          </button>
                        ) : null}
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                          <span className="sr-only">{info.label} on</span>
                          <input
                            type="checkbox"
                            checked={row.enabled}
                            disabled={busyType === type}
                            onChange={(event) =>
                              void save(type, { enabled: event.target.checked }, `${info.label} data is now ${event.target.checked ? "on" : "off"}.`)
                            }
                            className="peer sr-only"
                          />
                          <span className="relative h-6 w-11 rounded-full bg-[#cfd7e4] transition peer-checked:bg-[#1a63e8] peer-focus-visible:ring-2 peer-focus-visible:ring-[#1a63e8]/40 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
                        </label>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="flex min-w-0 flex-col rounded-2xl border border-[#dfe5ef] bg-white">
              <div className="flex flex-wrap items-center gap-3 border-b border-[#eef1f6] px-5 py-4">
                <h2 className="mr-auto font-bold">{SCHEMA_INFO[selected].label} (JSON-LD)</h2>
                {json ? (
                  <button type="button" onClick={() => void navigator.clipboard.writeText(json)} className="rounded-lg border border-[#d4dbe7] px-3 py-1.5 text-sm font-semibold hover:border-[#b9c6db]">
                    Copy
                  </button>
                ) : null}
                <a
                  href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(pageUrl(SAMPLE_PAGE[selected]))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-[#0b57d0] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#0a4bb5]"
                >
                  Test in Google
                </a>
              </div>
              {json ? (
                <pre className="max-h-[32rem] min-h-0 flex-1 overflow-auto bg-[#0f1b33] p-5 text-xs leading-5 text-[#d9e4ff]">{json}</pre>
              ) : (
                <p className="p-5 text-sm text-[#5b6b85]">
                  Built automatically from each page&apos;s own content, so it always matches the page. Use &quot;Test in Google&quot; to see it on {SAMPLE_PAGE[selected]}.
                </p>
              )}
              {selected === "job_posting" ? (
                <p className="border-t border-[#eef1f6] px-5 py-3 text-xs text-[#5b6b85]">Preview shows the first open role. Each role on the Career page gets its own entry.</p>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>

      {editing === "organization" && settings ? (
        <OrganizationDialog
          data={settings.organization.data as OrganizationData}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            if (await save("organization", { data }, "Company details saved.")) setEditing(null);
          }}
        />
      ) : null}
      {editing === "job_posting" && settings ? (
        <JobDialog
          data={settings.job_posting.data as JobPostingData}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            if (await save("job_posting", { data, enabled: true }, "Job posting dates saved. Job data is on.")) setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}

function Dialog({ title, busy, onClose, onSubmit, children }: { title: string; busy: boolean; onClose: () => void; onSubmit: (event: FormEvent) => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <form onSubmit={onSubmit} className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#eef1f6] px-6 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 hover:bg-[#f1f4f9]">
            <XIcon />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">{children}</div>
        <div className="flex shrink-0 justify-end gap-2 border-t border-[#eef1f6] px-6 py-4">
          <button type="button" onClick={onClose} className={`${button} border border-[#d4dbe7] hover:border-[#b9c6db]`}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={`${button} bg-[#0b57d0] text-white hover:bg-[#0a4bb5] disabled:opacity-60`}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

const ORG_FIELDS: { key: Exclude<keyof OrganizationData, "sameAs">; label: string; wide?: boolean }[] = [
  { key: "name", label: "Company name" },
  { key: "alternateName", label: "Short name" },
  { key: "email", label: "Email" },
  { key: "telephone", label: "Phone" },
  { key: "logo", label: "Logo link", wide: true },
  { key: "streetAddress", label: "Street address", wide: true },
  { key: "addressLocality", label: "City" },
  { key: "addressRegion", label: "State" },
  { key: "postalCode", label: "PIN code" },
  { key: "addressCountry", label: "Country code" },
];

function OrganizationDialog({ data, onClose, onSave }: { data: OrganizationData; onClose: () => void; onSave: (data: OrganizationData) => Promise<void> }) {
  const [values, setValues] = useState<OrganizationData>({ ...data });
  const [social, setSocial] = useState((data.sameAs ?? []).join("\n"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const links = social.split(/\s+/).map((link) => link.trim()).filter(Boolean);
    const bad = links.find((link) => !/^https:\/\//i.test(link));
    if (bad) return setError(`Social links must start with https:// (check "${bad}").`);
    setBusy(true);
    setError(null);
    const clean = Object.fromEntries(Object.entries(values).filter(([, value]) => typeof value === "string" && value.trim()).map(([key, value]) => [key, (value as string).trim()]));
    await onSave({ ...clean, ...(links.length ? { sameAs: links } : {}) });
    setBusy(false);
  }

  return (
    <Dialog title="Company details for Google" busy={busy} onClose={onClose} onSubmit={submit}>
      {error ? <p className="rounded-lg bg-[#fdecec] px-3 py-2 text-sm text-[#a12020]">{error}</p> : null}
      <p className="text-sm text-[#5b6b85]">Leave a field empty to keep the value shown in grey.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {ORG_FIELDS.map((field) => (
          <label key={field.key} className={`block text-sm font-semibold ${field.wide ? "sm:col-span-2" : ""}`}>
            {field.label}
            <input
              value={values[field.key] ?? ""}
              onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
              placeholder={ORGANIZATION_DEFAULTS[field.key]}
              maxLength={300}
              className={`${input} mt-1.5 font-normal`}
            />
          </label>
        ))}
      </div>
      <label className="block text-sm font-semibold">
        Social profiles (one link per line)
        <textarea
          value={social}
          onChange={(event) => setSocial(event.target.value)}
          rows={4}
          placeholder={"https://www.linkedin.com/company/…\nhttps://www.facebook.com/…"}
          className={`${input} mt-1.5 font-normal`}
        />
      </label>
    </Dialog>
  );
}

function JobDialog({ data, onClose, onSave }: { data: JobPostingData; onClose: () => void; onSave: (data: JobPostingData) => Promise<void> }) {
  const [datePosted, setDatePosted] = useState(data.datePosted ?? "");
  const [validThrough, setValidThrough] = useState(data.validThrough ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!isDate(datePosted)) return setError("Choose the date these roles were posted.");
    if (validThrough && validThrough < datePosted) return setError("The closing date must be after the posting date.");
    setBusy(true);
    setError(null);
    await onSave({ datePosted, ...(validThrough ? { validThrough } : {}) });
    setBusy(false);
  }

  return (
    <Dialog title="Job posting dates" busy={busy} onClose={onClose} onSubmit={submit}>
      {error ? <p className="rounded-lg bg-[#fdecec] px-3 py-2 text-sm text-[#a12020]">{error}</p> : null}
      <p className="text-sm text-[#5b6b85]">
        Google shows jobs in its job search only when they have a posting date. These dates apply to all {careers.openings.length} roles on the Career page.
      </p>
      <label className="block text-sm font-semibold">
        Posted on
        <input type="date" value={datePosted} onChange={(event) => setDatePosted(event.target.value)} required className={`${input} mt-1.5 font-normal`} />
      </label>
      <label className="block text-sm font-semibold">
        Applications close on (optional)
        <input type="date" value={validThrough} onChange={(event) => setValidThrough(event.target.value)} className={`${input} mt-1.5 font-normal`} />
      </label>
    </Dialog>
  );
}
