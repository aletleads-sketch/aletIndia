"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ComponentType, type SVGProps } from "react";
import { Avatar, useAdmin } from "@/components/admin/admin-shell";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BlogIcon,
  BriefcaseIcon,
  ChevronRightIcon,
  ClockIcon,
  DotsIcon,
  FileIcon,
  HomeIcon,
  ImageIcon,
  LayersIcon,
  PencilIcon,
  QuoteIcon,
  UsersIcon,
} from "@/components/admin/icons";
import { Loader } from "@/components/admin/loader";
import { StatusPill, StudioHeader, card, formatDate, formatTime } from "@/components/admin/studio-ui";
import { CONTENT_ROLES } from "@/lib/content-admin";
import { memberName } from "@/lib/leads";
import { CONTENT_TABLES, describeActivity, editHref, loadActivity, loadStatusCounts, type Activity } from "@/lib/studio";
import { getSupabase } from "@/lib/supabase-browser";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;
const DAY = 24 * 3600 * 1000;
const LIST_TABLES = ["services", "projects", "case_studies", "blogs", "faqs", "testimonials", "client_logos", "industries", "careers"];

/** Icon and tile colours for each kind of content, as in the mockup's rows. */
export const KIND_LOOK: Record<string, { icon: Icon; tile: string }> = {
  page_sections: { icon: HomeIcon, tile: "bg-[#e8f0ff] text-[#1a63e8]" },
  site_pages: { icon: FileIcon, tile: "bg-[#e8f0ff] text-[#1a63e8]" },
  services: { icon: LayersIcon, tile: "bg-[#efe9ff] text-[#5b3cc4]" },
  projects: { icon: BriefcaseIcon, tile: "bg-[#e3f6f4] text-[#0f766e]" },
  case_studies: { icon: BriefcaseIcon, tile: "bg-[#e3f6f4] text-[#0f766e]" },
  blogs: { icon: BlogIcon, tile: "bg-[#fff1e6] text-[#c2620f]" },
  faqs: { icon: QuoteIcon, tile: "bg-[#fdeef4] text-[#b0285d]" },
  testimonials: { icon: QuoteIcon, tile: "bg-[#fdeef4] text-[#b0285d]" },
  client_logos: { icon: ImageIcon, tile: "bg-[#eef1f6] text-[#475569]" },
  industries: { icon: LayersIcon, tile: "bg-[#eef1f6] text-[#475569]" },
  careers: { icon: UsersIcon, tile: "bg-[#e3f6ea] text-[#1c7a3e]" },
  menu_items: { icon: FileIcon, tile: "bg-[#eef1f6] text-[#475569]" },
};

type Data = { pages: { path: string; status: string }[]; counts: Record<string, Record<string, number>>; activity: Activity[]; error: string | null; now: number };

export function StudioDashboard() {
  const { profile, team } = useAdmin();
  const canEdit = CONTENT_ROLES.has(profile.role);
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    if (!canEdit) return;
    let cancelled = false;
    (async () => {
      const [pages, counts, activity] = await Promise.all([
        getSupabase().from("site_pages").select("path,status"),
        loadStatusCounts(LIST_TABLES),
        loadActivity(new Date(Date.now() - 35 * DAY)),
      ]);
      if (cancelled) return;
      setData({
        pages: ((pages.data as { path: string; status: string }[] | null) ?? []).filter((page) => page.path !== "_shared" && !page.path.includes("[")),
        counts,
        activity: activity.activity,
        error: pages.error?.message ?? activity.error,
        now: Date.now(),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [canEdit]);

  const names = useMemo(() => new Map(team.map((member) => [member.id, memberName(member)])), [team]);

  if (!canEdit) return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">Only admins, editors and marketing can change website content.</div>;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <StudioHeader crumbs={[{ label: "CMS" }, { label: "Dashboard" }]} title="Content Dashboard" subtitle="Manage your website in one place." />
        <div className="px-4 pt-5 pb-8 lg:px-8">{!data ? <Loader label="Loading your website…" /> : <DashboardBody data={data} names={names} />}</div>
      </div>
    </div>
  );
}

function DashboardBody({ data, names }: { data: Data; names: Map<string, string> }) {
  const { counts, activity, now } = data;
  const thisWeek = activity.filter((item) => now - new Date(item.at).getTime() < 7 * DAY);
  const published = (table: string) => counts[table]?.published ?? 0;
  const total = (status: string) => LIST_TABLES.reduce((sum, table) => sum + (counts[table]?.[status] ?? 0), 0) + data.pages.filter((page) => page.status === status).length;
  // How many items reached each state this week (an item counts once, at its latest change).
  const latestThisWeek = new Map<string, Activity>();
  for (const item of thisWeek) {
    const key = `${item.table_name}:${item.row_id}`;
    if (!latestThisWeek.has(key)) latestThisWeek.set(key, item);
  }
  const movedTo = (status: string, tables?: string[]) =>
    [...latestThisWeek.values()].filter((item) => item.action !== "deleted" && item.status === status && (!tables || tables.includes(item.table_name))).length;

  const recent: Activity[] = [];
  const seen = new Set<string>();
  for (const item of activity) {
    const key = `${item.table_name}:${item.row_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    recent.push(item);
    if (recent.length === 5) break;
  }

  const weeks = Array.from({ length: 5 }, (_, index) => {
    const end = now - (4 - index) * 7 * DAY;
    const start = end - 7 * DAY;
    const count = activity.filter((item) => {
      const time = new Date(item.at).getTime();
      return time > start && time <= end && item.action !== "deleted" && item.status === "published";
    }).length;
    return { start: new Date(start + DAY), end: new Date(end), count };
  });

  return (
    <div className="space-y-6">
      {data.error ? <p className="rounded-xl border border-[#f3c4c4] bg-[#fdecec] px-4 py-3 text-sm text-[#a12020]">Some numbers could not load: {data.error}</p> : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileIcon} tone="blue" label="Published Pages" value={data.pages.filter((page) => page.status === "published").length} delta={movedTo("published", ["site_pages", "page_sections"])} href="/admin/pages" />
        <StatCard icon={PencilIcon} tone="amber" label="Drafts" value={total("draft")} delta={movedTo("draft")} />
        <StatCard icon={BlogIcon} tone="violet" label="Blog Posts" value={published("blogs")} delta={movedTo("published", ["blogs"])} href="/admin/lists/blogs" />
        <StatCard icon={ClockIcon} tone="rose" label="Pending Reviews" value={total("review")} delta={movedTo("review")} />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="min-w-0 space-y-6">
        <section className={`${card} overflow-hidden`}>
          <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
            <div>
              <h2 className="text-[22px] font-extrabold">Recent Changes</h2>
              <p className="text-[15px] text-[#5b6b85]">Latest content updates on your website.</p>
            </div>
            <Link href="/admin/activity" className="mt-2 inline-flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-[#1a63e8] hover:underline">
              View All Activity <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          {recent.length ? <ActivityTable rows={recent} names={names} /> : <p className="px-6 pb-6 text-sm text-[#5b6b85]">Nothing has changed yet. Every save from now on shows up here with who made it.</p>}
        </section>

        <section className={`${card} p-6`}>
          <h2 className="text-[22px] font-extrabold">Website at a Glance</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Glance icon={LayersIcon} tone="blue" label="Services" value={published("services")} href="/admin/lists/services" />
            <Glance icon={BriefcaseIcon} tone="green" label="Portfolio Items" value={published("projects")} href="/admin/lists/projects" />
            <Glance icon={QuoteIcon} tone="violet" label="Testimonials" value={published("testimonials")} href="/admin/lists/testimonials" />
            <Glance icon={UsersIcon} tone="rose" label="Job Openings" value={published("careers")} href="/admin/lists/careers" />
          </div>
        </section>

        </div>
        <div className="space-y-6">
        <section className={`${card} p-5`}>
          <h2 className="text-[22px] font-extrabold">Quick Actions</h2>
          <p className="text-[15px] text-[#5b6b85]">Create, update or manage content quickly.</p>
          <div className="mt-4 space-y-2.5">
            <QuickAction icon={BlogIcon} label="New Blog" href="/admin/lists/blogs?new=1" />
            <QuickAction icon={HomeIcon} label="Edit Homepage" href="/admin/homepage" />
            <QuickAction icon={ImageIcon} label="Upload Media" href="/admin/media" />
          </div>
        </section>
        <section className={`${card} p-5`}>
          <h2 className="text-[22px] font-extrabold">Publishing Activity</h2>
          <p className="text-[15px] text-[#5b6b85]">Content published over the last 30 days.</p>
          <WeekBars weeks={weeks} />
        </section>
        </div>
      </div>
    </div>
  );
}

/** The Recent Changes table, also used (longer) on the activity page. */
export function ActivityTable({ rows, names }: { rows: Activity[]; names: Map<string, string> }) {
  return (
    <div className="overflow-x-auto px-3 pb-3">
      <table className="w-full min-w-[44rem] text-left text-sm">
        <thead className="text-[15px] font-semibold text-[#1e293b]">
          <tr className="bg-[#f3f6fb]">
            <th className="rounded-l-xl px-4 py-3.5">Content</th>
            <th className="px-3 py-3.5">Type</th>
            <th className="px-3 py-3.5">Status</th>
            <th className="px-3 py-3.5">Last Updated</th>
            <th className="px-3 py-3.5">Owner</th>
            <th className="rounded-r-xl px-2 py-3.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eef1f6]">
          {rows.map((item) => {
            const kind = CONTENT_TABLES[item.table_name] ?? { type: item.table_name, tone: "bg-[#eef1f6] text-[#475569]" };
            const look = KIND_LOOK[item.table_name] ?? KIND_LOOK.menu_items;
            const RowIcon = look.icon;
            const who = item.actor ? (names.get(item.actor) ?? "Team member") : "System";
            const title = item.title || (item.row_id?.includes("#") ? item.row_id.split("#")[1].replace(/_/g, " ") : "Untitled");
            const deleted = item.action === "deleted";
            return (
              <tr key={item.id} className="hover:bg-[#f8fafd]">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3.5">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${look.tile}`}>
                      <RowIcon className="h-6 w-6" />
                    </span>
                    <span className="min-w-0">
                      {deleted ? (
                        <span className="block truncate text-[15px] font-semibold line-through">{title}</span>
                      ) : (
                        <Link href={editHref(item.table_name, item.row_id)} className="block truncate text-[15px] font-semibold hover:text-[#1a63e8]">
                          {title}
                        </Link>
                      )}
                      <span className="block truncate text-[13px] text-[#5b6b85]">{deleted ? "Deleted" : describeActivity(item)}</span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-[13px] font-semibold ${kind.tone}`}>{kind.type}</span>
                </td>
                <td className="px-3 py-3">{deleted ? <span className="text-xs text-[#5b6b85]">—</span> : <StatusPill status={item.status} />}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="block text-[15px]">{formatDate(item.at)}</span>
                  <span className="text-[13px] text-[#5b6b85] uppercase">{formatTime(item.at)}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="flex items-center gap-2.5">
                    <Avatar name={who} size="sm" />
                    <span className="truncate text-[15px]">{who}</span>
                  </span>
                </td>
                <td className="px-2 py-3">{deleted ? null : <RowMenu href={editHref(item.table_name, item.row_id)} />}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** The ⋮ button at the end of a row. */
export function RowMenu({ href, view, onEdit }: { href?: string; view?: string; onEdit?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label="More actions" onClick={() => setOpen((value) => !value)} className="rounded-lg p-1.5 text-[#334155] hover:bg-[#eef2f8]">
        <DotsIcon />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-[#dfe5ef] bg-white p-1.5 text-sm shadow-xl">
          {onEdit ? (
            <button type="button" onClick={() => { setOpen(false); onEdit(); }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-[#f5f7fb]">
              Edit
            </button>
          ) : href ? (
            <Link href={href} className="block rounded-lg px-3 py-2 hover:bg-[#f5f7fb]">
              Edit
            </Link>
          ) : null}
          {view ? (
            <a href={view} target="_blank" rel="noreferrer" className="block rounded-lg px-3 py-2 hover:bg-[#f5f7fb]">
              View on website
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const TONES = {
  blue: { box: "border-[#b9d3fb] bg-gradient-to-br from-[#eaf3ff] to-[#f7fbff]", icon: "bg-[#d6e6ff] text-[#1a63e8]" },
  amber: { box: "border-[#f8d9b0] bg-gradient-to-br from-[#fff4e6] to-[#fffaf3]", icon: "bg-[#ffe3c2] text-[#d9730d]" },
  violet: { box: "border-[#d4cdf7] bg-gradient-to-br from-[#f1eeff] to-[#f9f8ff]", icon: "bg-[#e2dcff] text-[#5b3cc4]" },
  rose: { box: "border-[#f6c4d0] bg-gradient-to-br from-[#ffeef2] to-[#fff8fa]", icon: "bg-[#ffd9e2] text-[#d9304f]" },
  green: { box: "border-[#c9ecd6] bg-gradient-to-br from-[#e9f8ef] to-[#f6fcf8]", icon: "text-[#1c9a55]" },
} as const;

function StatCard({ icon: Icon, tone, label, value, delta, href }: { icon: Icon; tone: keyof typeof TONES; label: string; value: number; delta: number; href?: string }) {
  const body = (
    <div className={`flex h-full gap-4 rounded-2xl border p-5 ${TONES[tone].box} ${href ? "transition hover:-translate-y-0.5 hover:shadow-md" : ""}`}>
      <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${TONES[tone].icon}`}>
        <Icon className="h-7 w-7" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[17px] font-semibold whitespace-nowrap text-[#1e293b]">{label}</span>
        <span className="mt-1 block text-[40px] leading-none font-extrabold tracking-tight">{value}</span>
        <span className="mt-3 flex items-center gap-1 text-[15px] whitespace-nowrap text-[#334155]">
          {delta ? <ArrowUpIcon className="h-4 w-4 text-[#16a34a]" /> : <ArrowDownIcon className="h-4 w-4 text-[#94a3b8]" />}
          <span className={delta ? "text-[#16a34a]" : "text-[#5b6b85]"}>{delta ? `+${delta}` : "0"}</span> this week
        </span>
      </span>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function QuickAction({ icon: Icon, label, href }: { icon: Icon; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-xl border border-[#dbe5f5] bg-[#f5f9ff] px-5 py-3.5 text-[17px] font-semibold hover:border-[#9fc0f7] hover:bg-[#eaf2ff]">
      <Icon className="h-7 w-7 text-[#1a63e8]" />
      {label}
      <ChevronRightIcon className="ml-auto h-5 w-5 text-[#334155]" />
    </Link>
  );
}

function Glance({ icon: Icon, tone, label, value, href }: { icon: Icon; tone: keyof typeof TONES; label: string; value: number; href: string }) {
  const color = { blue: "text-[#1a63e8]", green: "text-[#1c9a55]", violet: "text-[#5b3cc4]", rose: "text-[#c2264f]", amber: "text-[#d9730d]" }[tone];
  return (
    <Link href={href} className={`group rounded-xl border p-5 transition hover:shadow-md ${TONES[tone].box}`}>
      <Icon className={`h-7 w-7 ${color}`} />
      <span className="mt-3 block text-[17px] font-medium text-[#1e293b]">{label}</span>
      <span className="mt-1 block text-[30px] leading-none font-extrabold">{value}</span>
    </Link>
  );
}

const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", timeZone: "Asia/Kolkata" });
const month = new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "Asia/Kolkata" });

function WeekBars({ weeks }: { weeks: { start: Date; end: Date; count: number }[] }) {
  const top = Math.max(10, Math.ceil(Math.max(...weeks.map((week) => week.count)) / 2) * 2);
  const ticks = Array.from({ length: 6 }, (_, index) => Math.round((top * (5 - index)) / 5));
  return (
    <div className="mt-5">
      <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2">
        <div className="flex h-36 flex-col justify-between text-right text-[13px] text-[#334155]">
          {ticks.map((tick) => (
            <span key={tick} className="-my-1.5 leading-none">
              {tick}
            </span>
          ))}
        </div>
        <div className="relative flex h-36 items-end justify-around gap-3 border-b border-l border-[#cbd5e1] px-2">
          {ticks.slice(0, -1).map((tick) => (
            <span key={tick} aria-hidden="true" className="absolute inset-x-0 border-t border-[#eef1f6]" style={{ bottom: `${(tick / top) * 100}%` }} />
          ))}
          {weeks.map((week) => (
            <div key={week.end.toISOString()} className="group relative flex h-full w-full max-w-12 items-end justify-center">
              <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-md bg-[#0f1b33] px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow transition group-hover:opacity-100">
                {week.count} published
              </span>
              <span
                role="img"
                aria-label={`${week.count} published`}
                className="relative w-full rounded-t-[5px] bg-gradient-to-t from-[#1a63e8] to-[#3d8bff]"
                style={{ height: `${(week.count / top) * 100}%`, minHeight: week.count ? 4 : 0 }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 ml-9 flex justify-around gap-2 text-center text-[13px] leading-tight text-[#334155]">
        {weeks.map((week) => {
          const sameMonth = month.format(week.start) === month.format(week.end);
          return (
            <span key={week.end.toISOString()} className="w-full max-w-16">
              {sameMonth ? `${day.format(week.start)}–${day.format(week.end)}` : `${day.format(week.start)} ${month.format(week.start)} –`}
              <br />
              {sameMonth ? month.format(week.end) : `${day.format(week.end)} ${month.format(week.end)}`}
            </span>
          );
        })}
      </div>
    </div>
  );
}
