"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { getPublishedMenu, type CmsMenuItem } from "@/lib/cms-client";

type NavigationItem = CmsMenuItem & { children: CmsMenuItem[] };

const fallbackMenu: NavigationItem[] = [
  { id: "home", label: "Home", href: "/", parent_id: null, sort_order: 10, visible: true, children: [] },
  { id: "services", label: "Services", href: "/services", parent_id: null, sort_order: 20, visible: true, children: [
    { id: "mobile", label: "Mobile Application Development", href: "/mobile-app-development", parent_id: "services", sort_order: 10, visible: true },
    { id: "cross", label: "Cross-functional Application Development", href: "/cross-functional-application", parent_id: "services", sort_order: 20, visible: true },
    { id: "web", label: "Web Application Development", href: "/web-application", parent_id: "services", sort_order: 30, visible: true },
    { id: "ai", label: "AI & Data Solutions", href: "/ai-data-solutions", parent_id: "services", sort_order: 40, visible: true },
    { id: "salesforce", label: "Salesforce Solutions", href: "/salesforce-solutions", parent_id: "services", sort_order: 50, visible: true },
    { id: "game", label: "Game Development", href: "/game-development", parent_id: "services", sort_order: 60, visible: true },
    { id: "graphic", label: "Graphic Designing", href: "/graphic-design", parent_id: "services", sort_order: 70, visible: true },
    { id: "ux", label: "UX/UI Designing", href: "/ux-ui-design", parent_id: "services", sort_order: 80, visible: true },
    { id: "marketing", label: "Digital Marketing", href: "/digital-marketing", parent_id: "services", sort_order: 90, visible: true },
  ] },
  { id: "about", label: "About Us", href: "/about-us", parent_id: null, sort_order: 30, visible: true, children: [] },
  { id: "portfolio", label: "Portfolio", href: "/portfolio", parent_id: null, sort_order: 40, visible: true, children: [] },
  { id: "case-studies", label: "Case Studies", href: "/case-studies", parent_id: null, sort_order: 45, visible: true, children: [] },
  { id: "career", label: "Career", href: "/career", parent_id: null, sort_order: 50, visible: true, children: [] },
  { id: "blogs", label: "Blogs", href: "/blogs", parent_id: null, sort_order: 60, visible: true, children: [] },
  { id: "contact", label: "Contact Us", href: "/contact-us", parent_id: null, sort_order: 70, visible: true, children: [] },
];

function makeNavigation(items: CmsMenuItem[]): NavigationItem[] {
  const navigation = items
    .filter((item) => !item.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({
      ...item,
      children: items.filter((child) => child.parent_id === item.id).sort((a, b) => a.sort_order - b.sort_order),
    }));

  if (!navigation.some((item) => item.href === "/case-studies")) {
    const portfolioIndex = navigation.findIndex((item) => item.href === "/portfolio");
    navigation.splice(portfolioIndex >= 0 ? portfolioIndex + 1 : navigation.length, 0, {
      id: "case-studies",
      label: "Case Studies",
      href: "/case-studies",
      parent_id: null,
      sort_order: 45,
      visible: true,
      children: [],
    });
  }

  return navigation;
}

function groupServiceLinks(children: CmsMenuItem[]) {
  const groups = new Map<string, CmsMenuItem[]>([
    ["Development", []],
    ["Designing", []],
    ["Digital Marketing", []],
  ]);

  children.forEach((child) => {
    const text = `${child.label} ${child.href}`.toLowerCase();
    const group = /graphic|ux\/?ui|ui\/?ux|design/.test(text)
      ? "Designing"
      : /marketing|seo|social|ppc/.test(text)
        ? "Digital Marketing"
        : "Development";
    groups.get(group)?.push(child);
  });

  return [...groups.entries()]
    .filter(([, items]) => items.length)
    .map(([label, items]) => ({ label, items }));
}

// Temporary display labels for local review. The CMS still controls links,
// order, visibility, and any services added later.
const mainBranchServiceLabels: Record<string, string> = {
  "/mobile-app-development": "Mobile Application Development",
  "/cross-functional-application": "Cross-functional Application Development",
  "/web-application": "Web Application Development",
  "/ai-data-solutions": "AI & Data Solutions",
  "/salesforce-solutions": "Salesforce Solutions",
  "/graphic-design": "Graphic Designing",
  "/ux-ui-design": "UX/UI Designing",
};

function serviceNavLabel(item: CmsMenuItem) {
  if (!item.href) return item.label;
  return mainBranchServiceLabels[item.href] || item.label;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [navigation, setNavigation] = useState<NavigationItem[]>(fallbackMenu);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 12); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  useEffect(() => { let cancelled = false; getPublishedMenu().then((items) => { if (!cancelled && items.length) setNavigation(makeNavigation(items)); }).catch(() => undefined); return () => { cancelled = true; }; }, []);
  useEffect(() => { document.body.style.overflow = menuOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [menuOpen]);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); setOpenItemId(null); } }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);
  useEffect(() => { if (!openItemId) return; const onPointerDown = (event: PointerEvent) => { if (!dropdownRef.current?.contains(event.target as Node)) setOpenItemId(null); }; document.addEventListener("pointerdown", onPointerDown); return () => document.removeEventListener("pointerdown", onPointerDown); }, [openItemId]);
  const solid = scrolled || menuOpen;
  const closeAll = () => { setMenuOpen(false); setOpenItemId(null); };
  const linkClass = `nav-link shrink-0 whitespace-nowrap text-[0.94rem] font-semibold transition-colors xl:text-[1.04rem] ${solid ? "text-ink" : "text-white/90 hover:text-white"}`;
  return <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? "border-b border-line/70 bg-white/85 shadow-[0_10px_40px_-15px_rgb(30_27_75_/_0.25)] backdrop-blur-xl" : "bg-transparent"}`}>
    <div className="mx-auto flex h-[6.05rem] w-full max-w-[92rem] items-center justify-between gap-4 px-5 sm:px-8 xl:px-12">
      <Link href="/" aria-label="ALET India home" onClick={closeAll}><Logo light={!solid} /></Link>
      <nav ref={dropdownRef} className="hidden items-center gap-4 min-[1180px]:flex xl:gap-5" aria-label="Primary">
        {navigation.map((item) => item.children.length ? <div key={item.id} className="relative"><button type="button" className={`${linkClass} flex items-center gap-1.5`} aria-expanded={openItemId === item.id} onClick={() => setOpenItemId((current) => current === item.id ? null : item.id)}>{item.label}<Chevron open={openItemId === item.id} /></button>{openItemId === item.id ? <div className="menu-pop absolute top-[calc(100%+0.9rem)] left-1/2 max-h-[min(70vh,32rem)] w-[24rem] -translate-x-1/2 overflow-y-auto rounded-2xl border border-line bg-white p-5 text-ink shadow-[0_30px_60px_-20px_rgb(30_27_75_/_0.35)]"><div className="grid gap-4">{groupServiceLinks(item.children).map((group) => <section key={group.label}><p className="text-[0.68rem] font-semibold tracking-[0.18em] text-brand uppercase">{group.label}</p><ul className="mt-2 space-y-1.5">{group.items.map((child) => <li key={child.id}><Link href={child.href || "/"} onClick={closeAll} className="text-[1.15rem] text-ink/80 transition hover:text-brand">{serviceNavLabel(child)}</Link></li>)}</ul></section>)}</div></div> : null}</div> : <Link key={item.id} href={item.href || "/"} className={linkClass} onClick={closeAll}>{item.label}</Link>)}
      </nav>
      <div className="flex shrink-0 items-center gap-3"><Link href="/contact-us" className="btn-sheen bg-brand-gradient hidden whitespace-nowrap rounded-full px-5 py-2.5 text-base font-bold text-white shadow-[0_10px_30px_-10px_rgb(79_70_229_/_0.8)] transition hover:-translate-y-0.5 sm:inline-flex xl:px-6 xl:text-[1.05rem]">Inquire Now</Link><button type="button" className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border px-3 min-[1180px]:hidden ${solid ? "border-line text-ink" : "border-white/25 text-white"}`} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => { setMenuOpen((open) => !open); setOpenItemId(null); }}>{menuOpen ? <span aria-hidden="true" className="text-xl leading-none">×</span> : <span aria-hidden="true" className="flex flex-col gap-1.5"><span className="block h-px w-4 bg-current" /><span className="block h-px w-4 bg-current" /><span className="block h-px w-4 bg-current" /></span>}<span className="text-sm font-bold">Menu</span></button></div>
    </div>
    {menuOpen ? <div className="max-h-[calc(100dvh-6.05rem)] overflow-y-auto border-t border-line bg-white px-5 py-5 min-[1180px]:hidden"><nav className="mx-auto flex max-w-6xl flex-col gap-5" aria-label="Mobile">{navigation.map((item) => <div key={item.id}>{item.children.length ? <><Link href={item.href || "/"} className="text-[1.3rem] font-semibold" onClick={closeAll}>{item.label}</Link><div className="mt-4 ml-3 space-y-5 border-l border-line pl-4">{groupServiceLinks(item.children).map((group) => <section key={group.label}><p className="text-[0.7rem] font-semibold tracking-[0.18em] text-brand uppercase">{group.label}</p><ul className="mt-2 space-y-2.5">{group.items.map((child) => <li key={child.id}><Link href={child.href || "/"} className="block text-[1rem] font-semibold leading-6 text-muted transition hover:text-brand" onClick={closeAll}>{serviceNavLabel(child)}</Link></li>)}</ul></section>)}</div></> : <Link href={item.href || "/"} className="text-[1.3rem] font-semibold" onClick={closeAll}>{item.label}</Link>}</div>)}<Link href="/contact-us" onClick={closeAll} className="bg-brand-gradient mt-2 inline-flex w-fit rounded-full px-6 py-2.5 text-[1.15rem] font-bold text-white">Inquire Now</Link></nav></div> : null}
  </header>;
}

function Chevron({ open }: { open: boolean }) { return <svg viewBox="0 0 12 12" aria-hidden="true" className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`}><path d="M2 4.2 6 8l4-3.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
