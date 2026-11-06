"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAdmin, useNavToggle, UserMenu } from "@/components/admin/admin-shell";
import { ArrowLeftIcon, BellIcon, ExternalIcon, MenuIcon } from "@/components/admin/icons";
import { memberName } from "@/lib/leads";
import { siteHref } from "@/lib/seo-admin";
import { CONTENT_TABLES, editHref, loadActivity, type Activity } from "@/lib/studio";

/** Shared pieces of the Content Studio screens: header, pills, thumbnails, dates. */

export const card = "rounded-2xl border border-[#e3e8f1] bg-white shadow-[0_1px_2px_rgba(15,27,51,0.04)]";
export const primaryButton = "inline-flex items-center gap-2 rounded-xl bg-[#1a63e8] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1554c8] disabled:opacity-40";
export const secondaryButton = "inline-flex items-center gap-2 rounded-xl border border-[#d4dbe7] bg-white px-4 py-2.5 text-sm font-semibold text-[#1e293b] hover:bg-[#f3f6fb] disabled:opacity-40";

export type Crumb = { label: string; href?: string };

/** The top bar and page title of every Content Studio screen, as in the client's mockup. */
export function StudioHeader({ crumbs, title, subtitle, actions, back, badge }: { crumbs: Crumb[]; title: string; subtitle?: string; actions?: ReactNode; back?: string; badge?: ReactNode }) {
  const toggleNav = useNavToggle();
  return (
    <header className="shrink-0">
      <div className="flex h-[70px] items-center gap-4 border-b border-[#e3e8f1] bg-white px-5 pl-16 lg:px-8">
        <button type="button" onClick={toggleNav} aria-label="Show or hide the menu" className="hidden rounded-lg p-1.5 text-[#334155] hover:bg-[#f3f6fb] lg:block">
          <MenuIcon className="h-6 w-6" />
        </button>
        <nav aria-label="Breadcrumb" className="mr-auto flex min-w-0 items-center gap-2 text-[17px] text-[#5b6b85]">
          {crumbs.map((crumb, index) => (
            <span key={crumb.label} className="flex min-w-0 items-center gap-2">
              {index ? <span aria-hidden="true">/</span> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="truncate hover:text-[#1a63e8]">
                  {crumb.label}
                </Link>
              ) : (
                <span className={`truncate ${index === crumbs.length - 1 ? "font-semibold text-[#0f1b33]" : ""}`}>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
        <a href={siteHref("/")} target="_blank" rel="noreferrer" className="hidden items-center gap-2 text-[15px] font-semibold text-[#1a63e8] hover:underline sm:inline-flex">
          <ExternalIcon /> View Website
        </a>
        <span className="hidden items-center gap-2 rounded-full bg-[#e6f6ec] px-4 py-1.5 text-[15px] font-semibold text-[#1c7a3e] md:inline-flex">
          <span className="h-2.5 w-2.5 rounded-full bg-[#22a35a]" /> Live
        </span>
        <span className="hidden h-8 w-px bg-[#e3e8f1] md:block" />
        <NotificationBell />
        <UserMenu />
      </div>
      <div className="flex flex-wrap items-end gap-4 px-5 pt-7 pb-2 lg:px-8">
        <div className="mr-auto flex min-w-0 items-start gap-3">
          {back ? (
            <Link href={back} aria-label="Back" className="mt-1.5 rounded-lg p-1 text-[#334155] hover:bg-white">
              <ArrowLeftIcon />
            </Link>
          ) : null}
          <div className="min-w-0 border-l-4 border-[#1a63e8] pl-5">
            <h1 className="flex flex-wrap items-center gap-3 text-[28px] leading-tight font-extrabold tracking-tight lg:text-[34px]">
              {title}
              {badge}
            </h1>
            {subtitle ? <p className="mt-1 text-[15px] text-[#5b6b85] lg:text-base">{subtitle}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

const SEEN_KEY = "studio-bell-seen";

/** The bell: the latest saves by the team, with a red dot when someone else changed something. */
function NotificationBell() {
  const { team, profile } = useAdmin();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Activity[]>([]);
  const [seen, setSeen] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadActivity(new Date(Date.now() - 14 * 24 * 3600 * 1000)).then(({ activity }) => {
      if (cancelled) return;
      setItems(activity.slice(0, 8));
      try {
        setSeen(Number(window.localStorage.getItem(SEEN_KEY)) || 0);
      } catch {
        // No storage: the dot shows until the bell is opened.
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);

  const fresh = items.some((item) => item.actor !== profile.id && new Date(item.at).getTime() > seen);
  const names = new Map(team.map((member) => [member.id, memberName(member)]));

  const toggle = () => {
    setOpen((value) => !value);
    const now = Date.now();
    setSeen(now);
    try {
      window.localStorage.setItem(SEEN_KEY, String(now));
    } catch {
      // Ignored: the dot comes back next visit.
    }
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={toggle} aria-label="Notifications" className="relative rounded-full p-2 text-[#334155] hover:bg-[#f3f6fb]">
        <BellIcon className="h-6 w-6" />
        {fresh ? <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#ef4444]" /> : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-[#dfe5ef] bg-white p-2 shadow-xl">
          <p className="px-3 pt-1 pb-2 text-sm font-bold">Latest changes</p>
          {items.length ? (
            items.map((item) => (
              <Link key={item.id} href={editHref(item.table_name, item.row_id)} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-[#f5f7fb]">
                <span className="block truncate text-sm font-semibold">{item.title || "Untitled"}</span>
                <span className="block text-xs text-[#5b6b85]">
                  {CONTENT_TABLES[item.table_name]?.type ?? "Content"} {item.action} by {item.actor ? (names.get(item.actor) ?? "a team member") : "System"} · {timeAgo(item.at)}
                </span>
              </Link>
            ))
          ) : (
            <p className="px-3 pb-2 text-sm text-[#5b6b85]">Nothing new yet.</p>
          )}
          <Link href="/admin/activity" onClick={() => setOpen(false)} className="mt-1 block rounded-lg px-3 py-2 text-center text-sm font-semibold text-[#1a63e8] hover:bg-[#f5f7fb]">
            View all activity
          </Link>
        </div>
      ) : null}
    </div>
  );
}

const STATUS_TONES: Record<string, string> = {
  published: "bg-[#e6f6ec] text-[#1c7a3e]",
  draft: "bg-[#eef1f6] text-[#475569]",
  review: "bg-[#fff4e0] text-[#c2620f]",
  scheduled: "bg-[#fff4e0] text-[#a4520f]",
  archived: "bg-[#fdecec] text-[#a12020]",
  hidden: "bg-[#eef1f6] text-[#475569]",
};

export function StatusPill({ status }: { status: string | null | undefined }) {
  const value = status || "published";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_TONES[value] ?? STATUS_TONES.draft}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value}
    </span>
  );
}

export function TypePill({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full bg-[#eaf1ff] px-2.5 py-0.5 text-xs font-semibold text-[#1a4fb8]">{children}</span>;
}

/** Shows a site path through this admin's origin, and full links as they are. */
export const imageSrc = (src: string) => (src.startsWith("/") ? siteHref(src) : src);

export function Thumb({ src, alt = "", fit = "cover", size = "md" }: { src?: unknown; alt?: string; fit?: "cover" | "contain"; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "h-9 w-9" : size === "lg" ? "h-16 w-24" : "h-11 w-14";
  const path = typeof src === "string" ? src : "";
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border border-[#e3e8f1] bg-[#eef2f8] ${dims}`}>
      {path ? (
        // A plain img: thumbnails show the exact stored file.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageSrc(path)} alt={alt} loading="lazy" className={`h-full w-full ${fit === "contain" ? "object-contain p-1" : "object-cover"}`} />
      ) : (
        <span className="text-[10px] font-semibold text-[#94a3b8]">No image</span>
      )}
    </span>
  );
}

const india = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const indiaTime = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

export const formatDate = (value: unknown) => (typeof value === "string" && value ? india.format(new Date(value)) : "—");
export const formatTime = (value: unknown) => (typeof value === "string" && value ? indiaTime.format(new Date(value)) : "");

export function timeAgo(value: string) {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(value);
}

export function Notice({ tone = "good", children }: { tone?: "good" | "bad" | "warn"; children: ReactNode }) {
  const tones = { good: "border-[#bfe5cc] bg-[#eaf7ef] text-[#1c7a3e]", bad: "border-[#f3c4c4] bg-[#fdecec] text-[#a12020]", warn: "border-[#f1dfb5] bg-[#fff8e8] text-[#7a5200]" };
  return <p className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>{children}</p>;
}

/** A compact select for toolbars (inputs elsewhere are full width). */
export const selectClass = "rounded-lg border border-[#d4dbe7] bg-white px-3 py-2 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20";
