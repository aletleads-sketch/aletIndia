"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { inputClass } from "@/components/admin/content-fields";
import { EyeIcon, PencilIcon, PlusIcon, SearchIcon, XIcon } from "@/components/admin/icons";
import { Loader } from "@/components/admin/loader";
import { Notice, StatusPill, StudioHeader, card, formatDate, primaryButton, secondaryButton } from "@/components/admin/studio-ui";
import { CONTENT_ROLES, loadEditablePages, previewPath, type EditablePage } from "@/lib/content-admin";
import { siteHref } from "@/lib/seo-admin";
import blogSlugs from "@/lib/blog-slugs.json";
import { RESERVED_SLUGS, slugFrom, slugPattern } from "@/lib/custom-pages";
import { createCustomPage, listCustomPages, type CustomPageInfo } from "@/lib/custom-pages-admin";

const pageAddress = (path: string) => (path === "_shared" ? "Many pages" : path.replace("[slug]", "…"));
const pageLabel = (page: EditablePage) => (page.path === "_shared" ? "Shared sections (footer, forms…)" : page.path === "/" ? "Homepage" : page.name);

/** Every page of the website, with how many sections it has and when it last changed. */
export function StudioPages() {
  const { profile } = useAdmin();
  const canEdit = CONTENT_ROLES.has(profile.role);
  const [pages, setPages] = useState<EditablePage[] | null>(null);
  const [custom, setCustom] = useState<CustomPageInfo[]>([]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!canEdit) return;
    let cancelled = false;
    Promise.all([loadEditablePages(), listCustomPages()]).then(([result, made]) => {
      if (cancelled) return;
      setPages(result.pages);
      setCustom(made.pages);
      setError(result.error ?? made.error);
    });
    return () => {
      cancelled = true;
    };
  }, [canEdit]);

  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (pages ?? []).filter((page) => !query || `${pageLabel(page)} ${page.path}`.toLowerCase().includes(query));
  }, [pages, search]);
  const shownCustom = custom.filter((page) => !search.trim() || `${page.name} ${page.path}`.toLowerCase().includes(search.trim().toLowerCase()));

  if (!canEdit) return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins, editors and marketing can change website content.</div>;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <StudioHeader
        crumbs={[{ label: "CMS", href: "/admin" }, { label: "Pages" }]}
        title="Pages"
        subtitle="Create and manage website pages."
        actions={
          <button type="button" onClick={() => setAdding(true)} className={primaryButton}>
            <PlusIcon className="h-4 w-4" /> Add Page
          </button>
        }
      />
      {adding ? <AddPageDialog taken={new Set([...(pages ?? []).map((page) => page.path), ...custom.map((page) => page.path)])} onClose={() => setAdding(false)} /> : null}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-8">
        {!pages ? (
          <Loader label="Loading pages…" />
        ) : (
          <div className="mx-auto max-w-7xl space-y-4">
            {error ? <Notice tone="bad">{error}</Notice> : null}
            <section className={`${card} overflow-hidden`}>
              <div className="flex flex-wrap items-center gap-3 border-b border-[#eef1f6] p-4">
                <label className="relative min-w-56 flex-1">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search pages…" className={`${inputClass} pl-9`} />
                </label>
                <span className="text-sm text-[#5b6b85]">{pages.length + custom.length} pages</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead className="bg-[#f5f7fb] text-xs font-semibold text-[#5b6b85]">
                    <tr>
                      <th className="px-4 py-3">Page title</th>
                      <th className="px-3 py-3">Address</th>
                      <th className="px-3 py-3">Sections</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Last modified</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef1f6]">
                    {shownCustom.map((page) => {
                      const edit = `/admin/pages/edit?path=${encodeURIComponent(page.path)}`;
                      return (
                        <tr key={page.path} className="hover:bg-[#f8fafd]">
                          <td className="px-4 py-3">
                            <Link href={edit} className="font-semibold hover:text-[#1a63e8]">
                              {page.name}
                            </Link>
                            <span className="ml-2 rounded-full bg-[#eaf1ff] px-2 py-0.5 text-[11px] font-semibold text-[#1a4fb8]">New page</span>
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-[#334155]">{page.path}</td>
                          <td className="px-3 py-3 text-[#334155]">—</td>
                          <td className="px-3 py-3">
                            <StatusPill status={page.status} />
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-[#334155]">{formatDate(page.updated_at)}</td>
                          <td className="px-4 py-3">
                            <span className="flex justify-end gap-1">
                              <Link href={edit} aria-label={`Edit ${page.name}`} className="rounded-lg p-2 text-[#5b6b85] hover:bg-[#eaf1ff] hover:text-[#1a63e8]">
                                <PencilIcon className="h-4 w-4" />
                              </Link>
                              <a href={siteHref(page.path)} target="_blank" rel="noreferrer" aria-label="Open on the website" className="rounded-lg p-2 text-[#5b6b85] hover:bg-[#eaf1ff] hover:text-[#1a63e8]">
                                <EyeIcon className="h-4 w-4" />
                              </a>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {shown.map((page) => {
                      const edit = page.path === "/" ? "/admin/homepage" : `/admin/website?page=${encodeURIComponent(page.path)}`;
                      const updated = page.sections.map((section) => section.updated_at).sort().at(-1);
                      return (
                        <tr key={page.path} className="hover:bg-[#f8fafd]">
                          <td className="px-4 py-3">
                            <Link href={edit} className="font-semibold hover:text-[#1a63e8]">
                              {pageLabel(page)}
                            </Link>
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-[#334155]">{pageAddress(page.path)}</td>
                          <td className="px-3 py-3 text-[#334155]">{page.sections.length}</td>
                          <td className="px-3 py-3">
                            <StatusPill status="published" />
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-[#334155]">{formatDate(updated)}</td>
                          <td className="px-4 py-3">
                            <span className="flex justify-end gap-1">
                              <Link href={edit} aria-label={`Edit ${pageLabel(page)}`} className="rounded-lg p-2 text-[#5b6b85] hover:bg-[#eaf1ff] hover:text-[#1a63e8]">
                                <PencilIcon className="h-4 w-4" />
                              </Link>
                              <a href={siteHref(previewPath(page.path))} target="_blank" rel="noreferrer" aria-label="Open on the website" className="rounded-lg p-2 text-[#5b6b85] hover:bg-[#eaf1ff] hover:text-[#1a63e8]">
                                <EyeIcon className="h-4 w-4" />
                              </a>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
            <p className="text-xs text-[#5b6b85]">
              The blog and case study pages share one layout each; their articles are edited under Blogs and Portfolio → Case studies. Page titles for Google are set in SEO Manager → Meta Tags.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const legacySlugs = new Set(blogSlugs as string[]);

/** Add Page: a name and an address; the page starts as a draft with a hero, a text block and the contact form. */
function AddPageDialog({ taken, onClose }: { taken: Set<string>; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const address = slugTouched ? slug : slugFrom(name);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setProblem("Give the page a name.");
    if (!slugPattern.test(address)) return setProblem("The address must be lowercase words joined by dashes, e.g. our-team.");
    if (RESERVED_SLUGS.has(address) || legacySlugs.has(address) || taken.has(`/${address}`)) return setProblem("The website already uses this address. Choose another.");
    setBusy(true);
    setProblem(null);
    const error = await createCustomPage(name.trim(), address);
    if (error) {
      setBusy(false);
      return setProblem(error);
    }
    router.push(`/admin/pages/edit?path=${encodeURIComponent(`/${address}`)}`);
  };

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-[#0f1b33]/50 p-4" role="dialog" aria-modal="true" aria-label="Add a page" onClick={onClose}>
      <form onSubmit={submit} onClick={(event) => event.stopPropagation()} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Add Page</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-1.5 text-[#5b6b85] hover:bg-[#f3f6fb]">
            <XIcon />
          </button>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Page name</span>
          <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Our Team" className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Address (URL slug)</span>
          <span className="flex items-center gap-1 text-sm text-[#5b6b85]">
            aletindia.com/
            <input
              value={address}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value.toLowerCase());
              }}
              placeholder="our-team"
              className={`${inputClass} font-mono`}
            />
          </span>
        </label>
        <p className="text-xs text-[#5b6b85]">The page starts as a draft with a hero banner, a text block and the contact form. Add, remove and reorder sections, then set it to Published.</p>
        {problem ? <Notice tone="bad">{problem}</Notice> : null}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={secondaryButton}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={primaryButton}>
            <PlusIcon className="h-4 w-4" /> {busy ? "Creating…" : "Create Page"}
          </button>
        </div>
      </form>
    </div>
  );
}
