"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { UserMenu, useAdmin } from "@/components/admin/admin-shell";
import { Loader } from "@/components/admin/loader";
import { pageUrl } from "@/lib/seo";
import { loadSeoSetting, publicUrl, publishSeoChanges, saveSeoSetting, SEO_LIMITS, siteHref } from "@/lib/seo-admin";
import { GENERAL_DEFAULTS, resolveGeneral, shareImageProblem, verificationCode, type GeneralSeoSettings } from "@/lib/seo-general-shared";

const input = "w-full rounded-lg border border-[#d4dbe7] px-3 py-2 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20";

type Form = Required<{ [K in keyof GeneralSeoSettings]: string }>;
const toForm = (value: GeneralSeoSettings): Form => ({
  siteName: value.siteName ?? "",
  defaultDescription: value.defaultDescription ?? "",
  defaultShareImage: value.defaultShareImage ?? "",
  googleVerification: value.googleVerification ?? "",
  bingVerification: value.bingVerification ?? "",
});

function Card({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#dfe5ef] bg-white">
      <div className="border-b border-[#eef1f6] px-5 py-4">
        <h2 className="font-bold">{title}</h2>
        <p className="mt-0.5 text-sm text-[#5b6b85]">{hint}</p>
      </div>
      <div className="space-y-4 px-5 py-4">{children}</div>
    </section>
  );
}

/** Shows a site path through this admin's origin (so local and dev previews work) and full links as they are. */
const previewSrc = (value: string) => (value.startsWith("/") ? siteHref(value) : value);

export function SeoSettingsWorkspace() {
  const { profile } = useAdmin();
  const isAdmin = profile.role === "admin";
  const [saved, setSaved] = useState<Form | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);

  const load = useCallback(async () => {
    const { value, error: loadError } = await loadSeoSetting<GeneralSeoSettings>("general");
    if (loadError) setError(loadError);
    const next = toForm(value);
    setSaved(next);
    setForm(next);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    // Loading on open is the point of this screen; the state updates happen after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [isAdmin, load]);

  if (!isAdmin) {
    return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins can manage SEO.</div>;
  }

  const set = (key: keyof Form, value: string) => {
    setNotice(null);
    setError(null);
    if (key === "defaultShareImage") setImageBroken(false);
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const changed = form && saved ? JSON.stringify(form) !== JSON.stringify(saved) : false;
  const effective = form ? resolveGeneral(form) : null;
  const descriptionLength = effective?.defaultDescription.length ?? 0;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    const google = verificationCode(form.googleVerification);
    const bing = verificationCode(form.bingVerification);
    const problem =
      (form.siteName.trim().length > 60 ? "Keep the site name under 60 characters." : null) ??
      (form.defaultDescription.trim().length > SEO_LIMITS.description.hard ? `Keep the description under ${SEO_LIMITS.description.hard} characters.` : null) ??
      shareImageProblem(form.defaultShareImage) ??
      (google === null ? "The Google code does not look right. Paste the whole <meta> tag or just the content value." : null) ??
      (bing === null ? "The Bing code does not look right. Paste the whole <meta> tag or just the content value." : null);
    if (problem) return setError(problem);

    const value: GeneralSeoSettings = {};
    if (form.siteName.trim()) value.siteName = form.siteName.trim();
    if (form.defaultDescription.trim()) value.defaultDescription = form.defaultDescription.trim();
    if (form.defaultShareImage.trim()) value.defaultShareImage = form.defaultShareImage.trim();
    if (google) value.googleVerification = google;
    if (bing) value.bingVerification = bing;

    setSaving(true);
    setError(null);
    setNotice(null);
    const saveError = await saveSeoSetting("general", value);
    if (saveError) {
      setSaving(false);
      return setError(saveError);
    }
    const next = toForm(value);
    setSaved(next);
    setForm(next);
    const publishError = await publishSeoChanges();
    setSaving(false);
    setNotice(publishError ?? "SEO settings saved. The website uses them from now on.");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#dfe5ef] bg-white px-5 py-4 pl-16 lg:px-8">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[28px]">SEO Settings</h1>
          <p className="text-sm text-[#5b6b85]">Website-wide defaults and search engine verification</p>
        </div>
        <UserMenu />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        {!form || !effective ? <Loader /> : null}
        {form && effective ? (
          <form onSubmit={submit} className="mx-auto max-w-4xl space-y-5">
            {notice ? <p className="rounded-xl border border-[#bfe5cc] bg-[#eaf7ef] p-4 text-sm text-[#1c7a3e]">{notice}</p> : null}

            <Card title="Website defaults" hint="Used by pages that do not set their own. Leave a field empty to keep the built-in value shown in grey.">
              <label className="block">
                <span className="text-sm font-semibold">Site name</span>
                <input value={form.siteName} onChange={(event) => set("siteName", event.target.value)} placeholder={GENERAL_DEFAULTS.siteName} maxLength={60} className={`${input} mt-1`} />
                <span className="mt-1 block text-xs text-[#5b6b85]">Shown above the title when a link is shared on Facebook, LinkedIn or WhatsApp.</span>
              </label>
              <label className="block">
                <span className="flex items-center justify-between text-sm font-semibold">
                  Default description
                  <span className={`text-xs font-semibold ${descriptionLength > SEO_LIMITS.description.max || descriptionLength < SEO_LIMITS.description.min ? "text-[#8a5a00]" : "text-[#1c7a3e]"}`}>
                    {descriptionLength} / {SEO_LIMITS.description.max}
                  </span>
                </span>
                <textarea
                  value={form.defaultDescription}
                  onChange={(event) => set("defaultDescription", event.target.value)}
                  placeholder={GENERAL_DEFAULTS.defaultDescription}
                  rows={3}
                  className={`${input} mt-1 resize-y`}
                />
                <span className="mt-1 block text-xs text-[#5b6b85]">Only used where a page has no description of its own. Each page&apos;s own text is edited in Meta Tags.</span>
              </label>
            </Card>

            <Card title="Default share image" hint="The picture shown when a page is shared and has no image of its own. Best size: 1200 × 630 pixels.">
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_18rem]">
                <label className="block">
                  <span className="text-sm font-semibold">Image link</span>
                  <input
                    value={form.defaultShareImage}
                    onChange={(event) => set("defaultShareImage", event.target.value)}
                    placeholder={GENERAL_DEFAULTS.defaultShareImage}
                    className={`${input} mt-1`}
                  />
                  <span className="mt-1 block text-xs text-[#5b6b85]">A site image path (/images/…) or a full https:// link to a JPG, PNG or WebP.</span>
                  {imageBroken ? <span className="mt-2 block text-sm text-[#a12020]">This image does not load. Check the link.</span> : null}
                </label>
                <div className="overflow-hidden rounded-xl border border-[#dfe5ef] bg-[#f7f9fc]" aria-label="Share preview">
                  {/* A plain img: the preview must show exactly the file Facebook and WhatsApp will fetch. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSrc(effective.defaultShareImage)}
                    alt="Default share image preview"
                    onError={() => setImageBroken(true)}
                    className="aspect-[1200/630] w-full bg-[#e6ebf3] object-cover"
                  />
                  <div className="px-3 py-2">
                    <p className="text-[11px] tracking-wide text-[#5b6b85] uppercase">{new URL(pageUrl("/")).hostname}</p>
                    <p className="truncate text-sm font-semibold">{effective.siteName}</p>
                    <p className="line-clamp-2 text-xs text-[#5b6b85]">{effective.defaultDescription}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Search engine verification" hint="Proves to Google and Bing that you own the website, so you can use their webmaster tools.">
              <label className="block">
                <span className="text-sm font-semibold">Google Search Console</span>
                <input
                  value={form.googleVerification}
                  onChange={(event) => set("googleVerification", event.target.value)}
                  placeholder='<meta name="google-site-verification" content="…" />'
                  className={`${input} mt-1 font-mono`}
                />
                <span className="mt-1 block text-xs text-[#5b6b85]">
                  In{" "}
                  <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="font-semibold text-[#0b57d0] hover:underline">
                    Search Console
                  </a>
                  , add the property {publicUrl("/")} and choose &quot;HTML tag&quot;. Paste the tag here, save, then press Verify there.
                </span>
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Bing Webmaster Tools</span>
                <input
                  value={form.bingVerification}
                  onChange={(event) => set("bingVerification", event.target.value)}
                  placeholder='<meta name="msvalidate.01" content="…" />'
                  className={`${input} mt-1 font-mono`}
                />
                <span className="mt-1 block text-xs text-[#5b6b85]">Optional. Same steps in Bing Webmaster Tools (&quot;HTML Meta Tag&quot; option).</span>
              </label>
            </Card>

            <div className={`${changed ? "sticky bottom-0" : ""} flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-[#dfe5ef] bg-white px-5 py-3 shadow-sm`}>
              {error ? <p className="w-full rounded-lg bg-[#fdecec] px-3 py-2 text-sm text-[#a12020]">{error}</p> : null}
              {changed ? <span className="mr-auto text-sm font-semibold text-[#8a5a00]">Unsaved changes</span> : null}
              <button
                type="button"
                disabled={!changed || saving}
                onClick={() => {
                  setForm(saved);
                  setError(null);
                  setImageBroken(false);
                }}
                className="rounded-xl border border-[#d4dbe7] px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
              >
                Discard
              </button>
              <button type="submit" disabled={!changed || saving} className="rounded-xl bg-[#1a63e8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
                {saving ? "Saving…" : "Save settings"}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
