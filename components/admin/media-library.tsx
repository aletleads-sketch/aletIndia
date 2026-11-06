"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { CheckIcon, CopyIcon, FileIcon, FolderIcon, ImageIcon, SearchIcon, TrashIcon, UploadIcon, VideoIcon, XIcon } from "@/components/admin/icons";
import { Loader } from "@/components/admin/loader";
import { Notice, StudioHeader, card, formatDate, imageSrc, primaryButton, selectClass } from "@/components/admin/studio-ui";
import { CONTENT_ROLES, uploadImage, uploadMedia } from "@/lib/content-admin";
import { deleteMedia, formatSize, listMedia, type MediaFile } from "@/lib/studio";

const field = "w-full rounded-lg border border-[#d4dbe7] bg-white px-3 py-2 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20";
const TYPES = [
  { value: "", label: "All Types" },
  { value: "image/jpeg", label: "JPG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WebP" },
  { value: "image/gif", label: "GIF" },
  { value: "video/mp4", label: "MP4" },
  { value: "application/pdf", label: "PDF" },
];

/** The folders on the left of the library: files grouped by kind. */
const KINDS = [
  { value: "", label: "All Files", icon: FolderIcon },
  { value: "image", label: "Images", icon: ImageIcon },
  { value: "video", label: "Videos", icon: VideoIcon },
  { value: "document", label: "Documents", icon: FileIcon },
] as const;
const kindOf = (file: MediaFile) => (file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document");
const ACCEPT_ALL = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf";

/** A readable name for a stored file: the upload time prefix removed. */
const displayName = (name: string) => name.replace(/^\d{10,}-/, "");

function useMedia(enabled: boolean) {
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    const result = await listMedia();
    setFiles(result.files);
    setError(result.error);
  }, []);
  useEffect(() => {
    if (!enabled) return;
    // Loading on open is the point; the state updates happen after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [enabled, load]);
  return { files, error, load, setFiles };
}

function useUploader(onDone: () => Promise<void>, anyKind = false) {
  const [uploading, setUploading] = useState(0);
  const [problems, setProblems] = useState<string[]>([]);
  const upload = async (list: FileList | File[] | null | undefined) => {
    const chosen = [...(list ?? [])];
    if (!chosen.length) return [] as string[];
    setProblems([]);
    setUploading(chosen.length);
    const urls: string[] = [];
    const failed: string[] = [];
    for (const file of chosen) {
      const { url, error } = await (anyKind ? uploadMedia(file) : uploadImage(file));
      if (url) urls.push(url);
      else failed.push(`${file.name}: ${error}`);
      setUploading((count) => count - 1);
    }
    setProblems(failed);
    await onDone();
    return urls;
  };
  return { uploading, problems, upload };
}

function MediaGrid({
  files,
  selected,
  onSelect,
  ticked,
  onTick,
}: {
  files: MediaFile[];
  selected?: string | null;
  onSelect: (file: MediaFile) => void;
  ticked?: Set<string>;
  onTick?: (file: MediaFile) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {files.map((file) => (
        <div
          key={file.path}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(file)}
          onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && onSelect(file)}
          className={`group cursor-pointer overflow-hidden rounded-xl border bg-white text-left transition hover:shadow-md ${selected === file.path ? "border-[#1a63e8] ring-2 ring-[#1a63e8]/30" : "border-[#e3e8f1]"}`}
        >
          <span className="relative block aspect-[4/3] bg-[repeating-conic-gradient(#eef2f8_0%_25%,#f8fafd_0%_50%)] bg-[length:16px_16px]">
            {kindOf(file) === "image" ? (
              // A plain img: the library shows exactly the stored file.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageSrc(file.url)} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : kindOf(file) === "video" ? (
              <video src={imageSrc(file.url)} muted preload="metadata" className="h-full w-full bg-black object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center bg-[#fdecec] text-[#c62828]">
                <FileIcon className="h-10 w-10" />
              </span>
            )}
            {file.source === "website" ? <span className="absolute right-2 bottom-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#334155] shadow">Website</span> : null}
            {onTick && file.source === "upload" ? (
              <input
                type="checkbox"
                aria-label={`Select ${displayName(file.name)}`}
                checked={ticked?.has(file.path) ?? false}
                onClick={(event) => event.stopPropagation()}
                onChange={() => onTick(file)}
                className="absolute top-2 left-2 h-5 w-5 rounded border-white accent-[#1a63e8] shadow"
              />
            ) : null}
            {selected === file.path ? (
              <span className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-[#1a63e8] text-white">
                <CheckIcon className="h-4 w-4" />
              </span>
            ) : null}
          </span>
          <span className="block px-3 py-2">
            <span className="block truncate text-xs font-semibold">{displayName(file.name)}</span>
            <span className="block text-[11px] text-[#5b6b85]">
              {formatSize(file.size)} · {formatDate(file.created)}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function useFilters(files: MediaFile[] | null, kind = "") {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (files ?? []).filter((file) => (!query || file.name.toLowerCase().includes(query)) && (!type || file.type === type) && (!kind || kindOf(file) === kind));
  }, [files, search, type, kind]);
  const controls = (
    <>
      <label className="relative min-w-48 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search media…" className={`${field} pl-9`} />
      </label>
      <select value={type} onChange={(event) => setType(event.target.value)} aria-label="File type" className={selectClass}>
        {TYPES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
  return { shown, controls };
}

/** The media library screen: every uploaded picture, with upload, copy link and delete. */
export function MediaLibrary() {
  const { profile } = useAdmin();
  const canEdit = CONTENT_ROLES.has(profile.role);
  const { files, error, load, setFiles } = useMedia(canEdit);
  const { uploading, problems, upload } = useUploader(load, true);
  const [kind, setKind] = useState("");
  const { shown, controls } = useFilters(files, kind);
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  if (!canEdit) return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins, editors and marketing can manage media.</div>;

  const drop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void upload(event.dataTransfer.files).then(uploaded);
  };

  const tick = (file: MediaFile) =>
    setTicked((current) => {
      const next = new Set(current);
      if (next.has(file.path)) next.delete(file.path);
      else next.add(file.path);
      return next;
    });

  const removeTicked = async () => {
    const paths = [...ticked];
    if (!paths.length || !window.confirm(`Delete ${paths.length} file${paths.length === 1 ? "" : "s"} for good? Any page still using them will show a broken image.`)) return;
    for (const path of paths) {
      const problem = await deleteMedia(path);
      if (problem) return setNotice(`Could not delete: ${problem}`);
    }
    setFiles((current) => current?.filter((item) => !ticked.has(item.path)) ?? current);
    setTicked(new Set());
    setSelected(null);
    setNotice(`Deleted ${paths.length} file${paths.length === 1 ? "" : "s"}.`);
  };

  const uploaded = (urls: string[]) => urls.length && setNotice(`Uploaded ${urls.length} file${urls.length === 1 ? "" : "s"}.`);

  const copy = async (file: MediaFile) => {
    await navigator.clipboard.writeText(file.url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const remove = async (file: MediaFile) => {
    if (!window.confirm(`Delete “${displayName(file.name)}” for good? Any page still using this picture will show a broken image.`)) return;
    const problem = await deleteMedia(file.path);
    if (problem) return setNotice(`Could not delete: ${problem}`);
    setFiles((current) => current?.filter((item) => item.path !== file.path) ?? current);
    setSelected(null);
    setNotice("Deleted.");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <StudioHeader
        crumbs={[{ label: "CMS", href: "/admin" }, { label: "Media Library" }]}
        title="Media Library"
        subtitle="Manage images, videos and other files."
        actions={
          <>
            <button type="button" onClick={() => input.current?.click()} disabled={uploading > 0} className={primaryButton}>
              <UploadIcon className="h-4 w-4" /> {uploading ? `Uploading ${uploading}…` : "Upload Media"}
            </button>
            <input ref={input} type="file" multiple accept={ACCEPT_ALL} className="hidden" onChange={(event) => void upload(event.target.files).then(uploaded)} />
          </>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-5 pb-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] 2xl:grid-cols-[14rem_minmax(0,1fr)_20rem]">
          <nav className={`${card} h-fit p-3`} aria-label="Folders">
            {KINDS.map(({ value, label, icon: Icon }) => {
              const count = (files ?? []).filter((file) => !value || kindOf(file) === value).length;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setKind(value)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[15px] ${kind === value ? "bg-[#e8f0ff] font-semibold text-[#1a4fb8]" : "text-[#334155] hover:bg-[#f5f7fb]"}`}
                >
                  <Icon className="h-4.5 w-4.5" /> {label} <span className="ml-auto text-xs text-[#5b6b85]">({count})</span>
                </button>
              );
            })}
          </nav>
          <div className="min-w-0 space-y-4">
            {notice ? <Notice>{notice}</Notice> : null}
            {error ? <Notice tone="bad">{error}</Notice> : null}
            {problems.map((problem) => (
              <Notice key={problem} tone="bad">
                {problem}
              </Notice>
            ))}
            <section
              className={`${card} p-4 ${dragging ? "ring-2 ring-[#1a63e8]" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={drop}
            >
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {controls}
                <span className="text-sm text-[#5b6b85]">{files ? `${shown.length} file${shown.length === 1 ? "" : "s"}` : ""}</span>
              </div>
              {ticked.size ? (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-[#f5f9ff] px-3 py-2 text-sm">
                  <span className="font-semibold">{ticked.size} selected</span>
                  <button type="button" onClick={() => void removeTicked()} className="rounded-lg px-3 py-1 font-semibold text-[#a12020] hover:bg-[#fdecec]">
                    Delete
                  </button>
                  <button type="button" onClick={() => setTicked(new Set())} className="ml-auto text-[#5b6b85] hover:underline">
                    Clear
                  </button>
                </div>
              ) : null}
              {!files ? (
                <Loader label="Loading media…" />
              ) : shown.length ? (
                <MediaGrid files={shown} selected={selected?.path} onSelect={setSelected} ticked={ticked} onTick={tick} />
              ) : (
                <button type="button" onClick={() => input.current?.click()} className="grid w-full place-items-center rounded-xl border-2 border-dashed border-[#cfd8e6] p-10 text-center text-sm text-[#5b6b85] hover:border-[#1a63e8]">
                  <UploadIcon className="h-8 w-8 text-[#94a3b8]" />
                  <span className="mt-2 font-semibold text-[#0f1b33]">{files.length ? "Nothing matches." : "No uploads yet."}</span>
                  <span>Drop files here or click to upload: pictures up to 6 MB, MP4 videos up to 50 MB, PDFs up to 20 MB.</span>
                </button>
              )}
              {files?.length ? <p className="mt-4 text-xs text-[#5b6b85]">Tip: drag files from your computer onto this box to upload them.</p> : null}
            </section>
          </div>
          <aside className={`${card} h-fit p-5 lg:col-start-2 2xl:col-start-auto 2xl:sticky 2xl:top-0`}>
            {selected ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-extrabold break-all">{displayName(selected.name)}</h2>
                  <button type="button" aria-label="Close" onClick={() => setSelected(null)} className="rounded-lg p-1 text-[#5b6b85] hover:bg-[#f3f6fb]">
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
                {kindOf(selected) === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageSrc(selected.url)} alt="" className="max-h-56 w-full rounded-lg border border-[#e3e8f1] object-contain" />
                ) : kindOf(selected) === "video" ? (
                  <video src={selected.url} controls className="max-h-56 w-full rounded-lg bg-black" />
                ) : (
                  <a href={selected.url} target="_blank" rel="noreferrer" className="block rounded-lg border border-[#e3e8f1] p-4 text-center text-sm font-semibold text-[#1a63e8] hover:underline">
                    Open the PDF ↗
                  </a>
                )}
                <dl className="grid grid-cols-[5rem_minmax(0,1fr)] gap-y-1 text-sm">
                  <dt className="text-[#5b6b85]">Size</dt>
                  <dd>{formatSize(selected.size)}</dd>
                  <dt className="text-[#5b6b85]">Type</dt>
                  <dd>{selected.type.split("/")[1]?.toUpperCase() || "—"}</dd>
                  <dt className="text-[#5b6b85]">Uploaded</dt>
                  <dd>{formatDate(selected.created)}</dd>
                </dl>
                <input readOnly value={selected.url} onFocus={(event) => event.target.select()} className={`${field} font-mono text-xs`} />
                <button type="button" onClick={() => void copy(selected)} className={`${primaryButton} w-full justify-center`}>
                  <CopyIcon className="h-4 w-4" /> {copied ? "Copied!" : "Copy link"}
                </button>
{selected.source === "upload" ? (
                <button type="button" onClick={() => void remove(selected)} className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#a12020] hover:bg-[#fdecec]">
                  <TrashIcon className="h-4 w-4" /> Delete
                </button>
                ) : (
                  <p className="text-xs text-[#5b6b85]">This picture came with the website design. Use its path in any picture field; it cannot be deleted here.</p>
                )}
              </div>
            ) : (
              <div className="text-sm text-[#5b6b85]">
                <h2 className="mb-2 font-extrabold text-[#0f1b33]">How it works</h2>
                <p>Click a file to see its details, copy its link or delete it. Tick several to delete them together.</p>
                <p className="mt-2">In any picture field, press “Choose from library” to use one of these.</p>
                <p className="mt-2">Pictures marked “Website” came with the website design. They can be used anywhere but not deleted.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

/** A pop-up to pick (or upload) a picture from the library. */
export function MediaPicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const { files, error, load } = useMedia(true);
  const { uploading, problems, upload } = useUploader(load);
  const { shown, controls } = useFilters(files, "image");
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-[#0f1b33]/50 p-4" role="dialog" aria-modal="true" aria-label="Media library" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-[#e3e8f1] px-5 py-4">
          <h2 className="mr-auto text-lg font-extrabold">Choose a picture</h2>
          <button type="button" onClick={() => input.current?.click()} disabled={uploading > 0} className="inline-flex items-center gap-2 rounded-lg border border-[#d4dbe7] px-3 py-2 text-sm font-semibold hover:bg-[#f3f6fb]">
            <UploadIcon className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload new"}
          </button>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(event) =>
              void upload(event.target.files).then((urls) => {
                if (urls[0]) onPick(urls[0]);
              })
            }
          />
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-2 text-[#5b6b85] hover:bg-[#f3f6fb]">
            <XIcon />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-[#eef1f6] px-5 py-3">{controls}</div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {error ? <Notice tone="bad">{error}</Notice> : null}
          {problems.map((problem) => (
            <Notice key={problem} tone="bad">
              {problem}
            </Notice>
          ))}
          {!files ? <Loader label="Loading media…" /> : shown.length ? <MediaGrid files={shown} selected={selected?.path} onSelect={setSelected} /> : <p className="py-10 text-center text-sm text-[#5b6b85]">No pictures yet. Press “Upload new”.</p>}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[#e3e8f1] px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-[#d4dbe7] px-4 py-2.5 text-sm font-semibold">
            Cancel
          </button>
          <button type="button" disabled={!selected} onClick={() => selected && onPick(selected.url)} className={primaryButton}>
            Use this picture
          </button>
        </div>
      </div>
    </div>
  );
}
