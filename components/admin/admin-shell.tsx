"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode, type SVGProps } from "react";
import type { Session } from "@supabase/supabase-js";
import { Loader } from "@/components/admin/loader";
import { SEO_NAV } from "@/lib/seo-admin";
import { getSupabase } from "@/lib/supabase-browser";
import { initials, memberName, type Profile } from "@/lib/leads";
import {
  BlogIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClientIcon,
  GearIcon,
  HomeIcon,
  InboxIcon,
  ImageIcon,
  LayersIcon,
  MenuIcon,
  QuoteIcon,
  SearchIcon,
  UsersIcon,
  XIcon,
} from "@/components/admin/icons";

type AdminContextValue = {
  profile: Profile;
  team: Profile[];
  refreshTeam: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside <AdminShell>");
  return value;
}

export const canManageLeads = (profile: Profile) => profile.role === "admin" || profile.role === "sales";

type NavLink = { label: string; href: string | null; also?: string[] };
type NavItem = {
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
  href?: string;
  /** Other paths that light this item up. */
  also?: string[];
  children?: readonly NavLink[];
  adminOnly?: boolean;
};

/** The Content Studio menu, in the order of the client's mockup. */
const CONTENT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: HomeIcon, also: ["/admin/activity"] },
  {
    label: "Homepage",
    icon: HomeIcon,
    children: [
      { label: "Edit homepage", href: "/admin/homepage" },
      { label: "Shared sections", href: "/admin/website?page=_shared" },
    ],
  },
  {
    label: "Pages & Services",
    icon: LayersIcon,
    children: [
      { label: "All pages", href: "/admin/pages", also: ["/admin/website"] },
      { label: "Services", href: "/admin/lists/services" },
    ],
  },
  {
    label: "Portfolio",
    icon: BriefcaseIcon,
    children: [
      { label: "Projects", href: "/admin/lists/projects" },
      { label: "Case studies", href: "/admin/lists/case_studies" },
      { label: "Client logos", href: "/admin/lists/client_logos" },
      { label: "Industries", href: "/admin/lists/industries" },
    ],
  },
  { label: "Blogs", href: "/admin/lists/blogs", icon: BlogIcon },
  { label: "Media Library", href: "/admin/media", icon: ImageIcon },
  { label: "SEO Manager", icon: SearchIcon, children: SEO_NAV, adminOnly: true },
  { label: "FAQs & Testimonials", href: "/admin/lists/faqs", icon: QuoteIcon, also: ["/admin/lists/testimonials"] },
  { label: "Careers", href: "/admin/lists/careers", icon: UsersIcon },
  {
    label: "Site Settings",
    icon: GearIcon,
    children: [
      { label: "General", href: "/admin/settings" },
      { label: "Menus", href: "/admin/lists/menu_items" },
    ],
  },
];

const BUSINESS_NAV: NavItem[] = [
  { label: "Leads", href: "/admin/leads", icon: InboxIcon },
  { label: "Users & Roles", href: "/admin/team", icon: ClientIcon, adminOnly: true },
];

/** Opens the menu on phones and folds it away on wide screens (the header's ☰ button). */
const NavToggleContext = createContext<() => void>(() => {});
export const useNavToggle = () => useContext(NavToggleContext);

const NAV_ITEM = "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium";
const NAV_ACTIVE = "bg-[#1a63e8] text-white shadow-lg shadow-blue-900/40";

export function AdminShell({ children }: { children: ReactNode }) {
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [team, setTeam] = useState<Profile[]>([]);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,full_name,role,active")
        .eq("id", session.user.id)
        .single();
      if (cancelled) return;
      if (error || !data) return setProblem("Your account has no admin profile yet. Ask an admin to add you.");
      if (!data.active) return setProblem("Your admin access is switched off. Ask an admin to turn it back on.");
      setProblem(null);
      setProfile(data as Profile);
      const members = await loadTeam();
      if (!cancelled) setTeam(members ?? [data as Profile]);
    })();
    return () => {
      cancelled = true;
    };
  }, [session, supabase]);

  const refreshTeam = useCallback(async () => {
    const members = await loadTeam();
    if (members) setTeam(members);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setTeam([]);
  }, [supabase]);

  let content: ReactNode;
  if (session === undefined || (session && !profile && !problem)) {
    content = <Loader label="Loading your workspace…" className="h-full" />;
  } else if (!session) {
    content = <SignIn />;
  } else if (problem || !profile) {
    content = (
      <CenteredNote>
        <p>{problem}</p>
        <button type="button" onClick={signOut} className="mt-4 rounded-lg bg-[#0b57d0] px-4 py-2 text-sm font-semibold text-white">
          Sign out
        </button>
      </CenteredNote>
    );
  } else {
    content = (
      <AdminContext.Provider value={{ profile, team, refreshTeam, signOut }}>
        <Frame>{children}</Frame>
      </AdminContext.Provider>
    );
  }

  // The public site's header and footer still render underneath; the admin covers them.
  return <div className="admin-root fixed inset-0 z-[100] overflow-hidden bg-[#eef2f8] font-sans text-[#0f1b33]">{content}</div>;
}

/** Active members, used for assignee pickers and author names. */
async function loadTeam() {
  const { data } = await getSupabase().from("profiles").select("id,email,full_name,role,active").eq("active", true);
  return (data as Profile[] | null)?.sort((a, b) => memberName(a).localeCompare(memberName(b))) ?? null;
}

const isActive = (pathname: string | null, href: string | null | undefined) =>
  Boolean(href && pathname && (href === "/admin" ? /\/admin\/?$/.test(pathname) : pathname.endsWith(href) || pathname.includes(`${href}/`)));

function Frame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { profile } = useAdmin();
  const [open, setOpen] = useState(false);
  const [folded, setFolded] = useState(false);
  const toggleNav = useCallback(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) setFolded((value) => !value);
    else setOpen(true);
  }, []);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const content = ["admin", "editor", "marketing"].includes(profile.role);
  const allowed = (item: NavItem) => !item.adminOnly || profile.role === "admin";
  const groups = [
    { title: "Website", items: content ? CONTENT_NAV.filter(allowed) : [] },
    { title: "Business", items: BUSINESS_NAV.filter(allowed) },
  ].filter((group) => group.items.length);

  const renderItem = (item: NavItem) => {
    const { label, icon: Icon } = item;
    if (item.children) {
      const linkActive = (child: NavLink) => isActive(pathname, child.href) || Boolean(child.also?.some((path) => isActive(pathname, path)));
      const childActive = item.children.some(linkActive);
      const isOpen = expanded[label] ?? childActive;
      return (
        <div key={label}>
          <button
            type="button"
            aria-expanded={isOpen}
            onClick={() => setExpanded((current) => ({ ...current, [label]: !isOpen }))}
            className={`${NAV_ITEM} ${childActive ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10"}`}
          >
            <Icon />
            <span className="truncate">{label}</span>
            <ChevronRightIcon className={`ml-auto h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
          </button>
          {isOpen ? (
            <div className="mt-1 mb-2 ml-6 space-y-0.5 border-l border-white/15 pl-3">
              {item.children.map((entry) =>
                entry.href ? (
                  <Link
                    key={entry.label}
                    href={entry.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium ${linkActive(entry) ? "bg-[#1a63e8] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                  >
                    {entry.label}
                  </Link>
                ) : (
                  <span key={entry.label} aria-disabled="true" title="Coming soon" className="flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/35">
                    <span className="truncate">{entry.label}</span>
                    <span className="ml-auto shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] tracking-wide uppercase">Soon</span>
                  </span>
                ),
              )}
            </div>
          ) : null}
        </div>
      );
    }
    const active = isActive(pathname, item.href) || Boolean(item.also?.some((path) => isActive(pathname, path)));
    return (
      <Link key={label} href={item.href ?? "/admin"} onClick={() => setOpen(false)} className={`${NAV_ITEM} ${active ? NAV_ACTIVE : "text-white/80 hover:bg-white/10"}`}>
        <Icon />
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-full">
      {open ? <button type="button" aria-label="Close menu" className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setOpen(false)} /> : null}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-gradient-to-b from-[#0b1f3f] to-[#081732] text-white transition-transform lg:static lg:translate-x-0 ${folded ? "lg:hidden" : ""} ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center justify-between">
            <Image src="/images/logo-white.png" alt="ALET India" width={322} height={90} className="h-11 w-auto" />
            <button type="button" aria-label="Close menu" className="lg:hidden" onClick={() => setOpen(false)}>
              <XIcon />
            </button>
          </div>
          <p className="mt-4 flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">
            <span className="h-px flex-1 bg-white/20" />
            {content ? "Content Studio" : "Workspace"}
            <span className="h-px flex-1 bg-white/20" />
          </p>
        </div>
        <nav className="admin-scroll-dark flex-1 space-y-5 overflow-y-auto px-3 pb-6">
          {groups.map((group) => (
            <div key={group.title} className="space-y-1">
              {group.title !== "Website" ? <p className="px-4 pb-1 text-[11px] font-bold tracking-[0.14em] text-white/40 uppercase">{group.title}</p> : null}
              {group.items.map(renderItem)}
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <button
          type="button"
          aria-label="Open menu"
          className="absolute top-3 left-4 z-10 rounded-lg bg-white p-2 shadow lg:hidden"
          onClick={() => setOpen(true)}
        >
          <MenuIcon />
        </button>
        <NavToggleContext.Provider value={toggleNav}>{children}</NavToggleContext.Provider>
      </div>
    </div>
  );
}

export function UserMenu() {
  const { profile, signOut } = useAdmin();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = memberName(profile);

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
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-3 rounded-full py-1 pr-2 pl-1 hover:bg-[#e8eef8]">
        <Avatar name={name} />
        <span className="hidden text-sm font-semibold sm:block">{name}</span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-[#dfe5ef] bg-white p-2 shadow-xl">
          <p className="truncate px-3 pt-1 text-sm font-semibold">{name}</p>
          <p className="truncate px-3 text-xs text-[#5b6b85]">{profile.email}</p>
          <p className="px-3 pt-1 pb-2 text-xs text-[#5b6b85] capitalize">Role: {profile.role}</p>
          <button type="button" onClick={signOut} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#c62828] hover:bg-[#fdecec]">
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

const AVATAR_TONES = ["bg-[#dbe7ff] text-[#1a4fb8]", "bg-[#dcf5e4] text-[#1c7a3e]", "bg-[#fde9d7] text-[#a4520f]", "bg-[#efe1fb] text-[#6b2fa6]"];

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const tone = AVATAR_TONES[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_TONES.length];
  const dims = size === "sm" ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm";
  return <span className={`grid shrink-0 place-items-center rounded-full font-bold ${dims} ${tone}`}>{initials(name)}</span>;
}

function CenteredNote({ children }: { children: ReactNode }) {
  return <div className="grid h-full place-items-center p-6 text-center text-sm text-[#5b6b85]">{<div>{children}</div>}</div>;
}

function SignIn() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    const { error: signInError } = await getSupabase().auth.signInWithPassword({
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
    });
    setBusy(false);
    if (signInError) setError(signInError.message);
  }

  return (
    <div className="grid h-full place-items-center bg-[#0b1f3f] p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <Image src="/images/logo-dark.png" alt="ALET India" width={322} height={90} className="h-12 w-auto" />
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Sign in to admin</h1>
        <p className="mt-1 text-sm text-[#5b6b85]">Use the email and password your admin set up in Supabase.</p>
        <label className="mt-6 block text-xs font-semibold tracking-wide text-[#5b6b85] uppercase" htmlFor="admin-email">
          Email
        </label>
        <input id="admin-email" name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-lg border border-[#d4dbe7] px-3 py-2.5 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20" />
        <label className="mt-4 block text-xs font-semibold tracking-wide text-[#5b6b85] uppercase" htmlFor="admin-password">
          Password
        </label>
        <input id="admin-password" name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-lg border border-[#d4dbe7] px-3 py-2.5 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20" />
        {error ? <p className="mt-3 text-sm text-[#c62828]">{error}</p> : null}
        <button type="submit" disabled={busy} className="mt-6 w-full rounded-lg bg-[#0b57d0] py-3 text-sm font-semibold text-white hover:bg-[#0a4bb5] disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
