"use client";

import { useRef, useState, type ReactNode } from "react";
import { uploadImage } from "@/lib/content-admin";
import { siteHref } from "@/lib/seo-admin";

/**
 * Form controls for each field type of lib/section-fields.ts. Every control is plain:
 * a label, the value, and (for lists) add / remove / move buttons.
 */

export const inputClass =
  "w-full rounded-lg border border-[#d4dbe7] bg-white px-3 py-2 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20";
const smallButton = "rounded-md border border-[#d4dbe7] bg-white px-2 py-1 text-xs font-semibold text-[#334155] hover:bg-[#f3f6fb] disabled:opacity-40";

type Image = { src: string; alt: string };
type LinkValue = { label: string; href: string };
type PolicyPart = { heading?: string; paragraphs: string[]; list?: string[] };
type Card = Record<string, string | string[]>;

export function FieldShell({ label, hint, onReset, children }: { label: string; hint?: string; onReset?: () => void; children: ReactNode }) {
  return (
    <div className="block">
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        {onReset ? (
          <button type="button" onClick={onReset} className="text-xs font-semibold text-[#1a63e8] hover:underline">
            Use website&apos;s original
          </button>
        ) : null}
      </div>
      {children}
      {hint ? <span className="mt-1 block text-xs text-[#5b6b85]">{hint}</span> : null}
    </div>
  );
}

export function TextInput({ value, onChange, multiline = false, placeholder }: { value: string; onChange: (value: string) => void; multiline?: boolean; placeholder?: string }) {
  return multiline ? (
    <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={Math.min(8, Math.max(3, Math.ceil(value.length / 90)))} placeholder={placeholder} className={`${inputClass} resize-y`} />
  ) : (
    <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={inputClass} />
  );
}

/** A list of anything, with buttons to move, remove and add entries. */
export function ListEditor<T>({
  items,
  onChange,
  render,
  blank,
  addLabel,
  fixed = false,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, update: (next: T) => void, index: number) => ReactNode;
  blank: () => T;
  addLabel: string;
  fixed?: boolean;
}) {
  const move = (from: number, to: number) => {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="rounded-xl border border-[#e3e8f1] bg-[#f8fafd] p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="mr-auto text-xs font-bold text-[#5b6b85]">#{index + 1}</span>
            {!fixed ? (
              <>
                <button type="button" className={smallButton} disabled={index === 0} onClick={() => move(index, index - 1)} aria-label="Move up">↑</button>
                <button type="button" className={smallButton} disabled={index === items.length - 1} onClick={() => move(index, index + 1)} aria-label="Move down">↓</button>
                <button type="button" className={`${smallButton} text-[#a12020]`} onClick={() => onChange(items.filter((_, i) => i !== index))}>Remove</button>
              </>
            ) : null}
          </div>
          {render(item, (next) => onChange(items.map((current, i) => (i === index ? next : current))), index)}
        </div>
      ))}
      {!fixed ? (
        <button type="button" className={smallButton} onClick={() => onChange([...items, blank()])}>
          + {addLabel}
        </button>
      ) : null}
    </div>
  );
}

export function ParagraphsInput({ value, onChange, addLabel = "Add a line" }: { value: string[]; onChange: (value: string[]) => void; addLabel?: string }) {
  return (
    <ListEditor
      items={value}
      onChange={onChange}
      blank={() => ""}
      addLabel={addLabel}
      render={(item, update) => <TextInput value={item} onChange={update} multiline={item.length > 70} />}
    />
  );
}

/** Shows a site path through this admin's origin, and full links as they are. */
const previewSrc = (src: string) => (src.startsWith("/") ? siteHref(src) : src);

export function ImageInput({ value, onChange }: { value: Image; onChange: (value: Image) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setProblem(null);
    const { url, error } = await uploadImage(file);
    setUploading(false);
    if (error || !url) return setProblem(error ?? "Upload failed.");
    setBroken(false);
    onChange({ ...value, src: url });
  };
  return (
    <div className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
      <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-lg border border-[#dfe5ef] bg-[#e9eef6]">
        {value.src && !broken ? (
          // A plain img: the preview must show exactly the stored file.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc(value.src)} alt={value.alt} onError={() => setBroken(true)} className="h-full w-full object-cover" />
        ) : (
          <span className="px-2 text-center text-xs text-[#5b6b85]">{broken ? "Picture not found" : "No picture"}</span>
        )}
      </div>
      <div className="space-y-2">
        <input
          value={value.src}
          onChange={(event) => {
            setBroken(false);
            onChange({ ...value, src: event.target.value });
          }}
          placeholder="/images/… or https://…"
          className={`${inputClass} font-mono text-xs`}
        />
        <input value={value.alt} onChange={(event) => onChange({ ...value, alt: event.target.value })} placeholder="Short description of the picture (for Google and screen readers)" className={inputClass} />
        <div className="flex items-center gap-2">
          <button type="button" className={smallButton} disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? "Uploading…" : "Upload a new picture"}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
          {problem ? <span className="text-xs text-[#a12020]">{problem}</span> : null}
        </div>
      </div>
    </div>
  );
}

export function ImagesInput({ value, onChange }: { value: Image[]; onChange: (value: Image[]) => void }) {
  return <ListEditor items={value} onChange={onChange} blank={() => ({ src: "", alt: "" })} addLabel="Add a picture" render={(item, update) => <ImageInput value={item} onChange={update} />} />;
}

export function LinkInput({ value, onChange }: { value: LinkValue; onChange: (value: LinkValue) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <input value={value.label} onChange={(event) => onChange({ ...value, label: event.target.value })} placeholder="Button text" className={inputClass} />
      <input value={value.href} onChange={(event) => onChange({ ...value, href: event.target.value })} placeholder="/contact-us or https://…" className={`${inputClass} font-mono text-xs`} />
    </div>
  );
}

export function PolicyInput({ value, onChange }: { value: PolicyPart[]; onChange: (value: PolicyPart[]) => void }) {
  return (
    <ListEditor
      items={value}
      onChange={onChange}
      blank={() => ({ heading: "", paragraphs: [""] })}
      addLabel="Add a part"
      render={(part, update) => (
        <div className="space-y-3">
          <input value={part.heading ?? ""} onChange={(event) => update({ ...part, heading: event.target.value })} placeholder="Heading (leave empty for none)" className={`${inputClass} font-semibold`} />
          <div>
            <p className="mb-1 text-xs font-semibold text-[#5b6b85]">Paragraphs</p>
            <ParagraphsInput value={part.paragraphs} onChange={(paragraphs) => update({ ...part, paragraphs })} addLabel="Add a paragraph" />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-[#5b6b85]">Bullet points (optional)</p>
            <ParagraphsInput
              value={part.list ?? []}
              onChange={(list) => {
                const { list: _old, ...rest } = part;
                void _old;
                update(list.length ? { ...rest, list } : rest);
              }}
              addLabel="Add a bullet point"
            />
          </div>
        </div>
      )}
    />
  );
}

const nice = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

/** Cards that all have the same parts; the parts come from the website's own first card. */
export function ItemsInput({ value, template, onChange }: { value: Card[]; template: Card[]; onChange: (value: Card[]) => void }) {
  const shape = template[0] ?? value[0] ?? {};
  const keys = Object.keys(shape).filter((key) => key !== "id");
  const blank = (): Card => Object.fromEntries(Object.entries(shape).map(([key, part]) => [key, Array.isArray(part) ? [] : ""]));
  return (
    <ListEditor
      items={value}
      onChange={onChange}
      blank={blank}
      addLabel="Add a card"
      render={(card, update) => (
        <div className="space-y-2">
          {keys.map((key) => {
            const part = card[key] ?? shape[key];
            const label = key === "image" ? "Picture" : nice(key);
            if (Array.isArray(part)) {
              return (
                <div key={key}>
                  <p className="mb-1 text-xs font-semibold text-[#5b6b85]">{label}</p>
                  <ParagraphsInput value={part} onChange={(next) => update({ ...card, [key]: next })} />
                </div>
              );
            }
            if (key === "image") {
              return (
                <div key={key}>
                  <p className="mb-1 text-xs font-semibold text-[#5b6b85]">{label}</p>
                  <ImageInput value={{ src: String(part ?? ""), alt: "" }} onChange={(next) => update({ ...card, [key]: next.src })} />
                </div>
              );
            }
            const long = String(shape[key] ?? "").length > 60;
            return (
              <label key={key} className="block">
                <span className="mb-1 block text-xs font-semibold text-[#5b6b85]">{label}</span>
                <TextInput value={String(part ?? "")} onChange={(next) => update({ ...card, [key]: next })} multiline={long} />
              </label>
            );
          })}
        </div>
      )}
    />
  );
}

/** The words of a custom-designed block, one box per piece of text, in page order. */
export function HtmlTextsInput({ value, original, onChange }: { value: string[]; original: string[]; onChange: (value: string[]) => void }) {
  const [filter, setFilter] = useState("");
  const shown = value.map((text, index) => ({ text, index })).filter(({ text, index }) => !filter || `${text} ${original[index] ?? ""}`.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="space-y-2">
      <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Find a word…" className={inputClass} />
      <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
        {shown.map(({ text, index }) => (
          <div key={index} className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-2">
            <span className="pt-2 text-right text-xs font-bold text-[#5b6b85]">{index + 1}</span>
            <TextInput value={text} onChange={(next) => onChange(value.map((current, i) => (i === index ? next : current)))} multiline={text.length > 70} placeholder={original[index]} />
          </div>
        ))}
      </div>
      <p className="text-xs text-[#5b6b85]">The design stays the same; only the words change. Keep the order — box 5 is always the 5th piece of text in the design.</p>
    </div>
  );
}
