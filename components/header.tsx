"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { getPublishedMenu, type CmsMenuItem } from "@/lib/cms-client";

type NavigationItem = CmsMenuItem & { children: CmsMenuItem[] };

const fallbackMenu: NavigationItem[] = [
  { id: "home", label: "Home", href: "/", parent_id: null, sort_order: 10, visible: true, children: [] },
  { id: "services", label: "Services", href: "/services", parent_id: null, sort_order: 20, visible: true, children: [
    { id: "mobile", label: "Mobile Apps", href: "/mobile-app-development", parent_id: "services", sort_order: 10, visible: true },
    { id: "cross", label: "Cross-platform Apps", href: "/cross-functional-application", parent_id: "services", sort_order: 20, visible: true },
    { id: "web", label: "Web Development", href: "/web-application", parent_id: "services", sort_order: 30, visible: true },
    { id: "design", label: "UX/UI Design", href: "/ux-ui-design", parent_id: "services", sort_order: 40, visible: true },
  ] },
  { id: "about", label: "About Us", href: "/about-us", parent_id: null, sort_order: 30, visible: true, children: [] },
  { id: "portfolio", label: "Portfolio", href: "/portfolio", parent_id: null, sort_order: 40, visible: true, children: [] },
  { id: "career", label: "Career", href: "/career", parent_id: null, sort_order: 50, visible: true, children: [] },
  { id: "blogs", label: "Blogs", href: "/blogs", parent_id: null, sort_order: 60, visible: true, children: [] },
  { id: "contact", label: "Contact Us", href: "/contact-us", parent_id: null, sort_order: 70, visible: true, children: [] },
];

function makeNavigation(items: CmsMenuItem[]): NavigationItem[] {
  return items.filter((item) => !item.parent_id).sort((a, b) => a.sort_order - b.sort_order).map((item) => ({ ...item, children: items.filter((child) => child.parent_id === item.id).sort((a, b) => a.sort_order - b.sort_order) }));
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

export function Header() {
  const pathname = usePathname();
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
  // The home hero is dark, so the reference header starts transparent there.
  // Every inner page gets a solid header immediately so the logo and links
  // always remain readable against light page content.
  const solid = pathname !== "/" || scrolled || menuOpen;
  const closeAll = () => { setMenuOpen(false); setOpenItemId(null); };
  const linkClass = `nav-link text-[1.02rem] font-semibold transition-colors xl:text-[1.12rem] ${solid ? "text-ink" : "text-white/90 hover:text-white"}`;
  return <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? "border-b border-line/70 bg-white/85 shadow-[0_10px_40px_-15px_rgb(30_27_75_/_0.25)] backdrop-blur-xl" : "bg-transparent"}`}>
    <div className="mx-auto flex h-[6.05rem] w-full max-w-[92rem] items-center justify-between gap-4 px-5 sm:px-8 xl:px-12">
      <Link href="/" aria-label="ALET India home" onClick={closeAll}><Logo light={!solid} /></Link>
      <nav ref={dropdownRef} className="hidden items-center gap-5 xl:gap-7 lg:flex" aria-label="Primary">
        {navigation.map((item) => item.children.length ? <div key={item.id} className="relative" onMouseEnter={() => setOpenItemId(item.id)} onMouseLeave={() => setOpenItemId(null)}><button type="button" className={`${linkClass} flex items-center gap-1.5`} aria-expanded={openItemId === item.id} onClick={() => setOpenItemId((current) => current === item.id ? null : item.id)}>{item.label}<Chevron open={openItemId === item.id} /></button>{openItemId === item.id ? <div className="menu-pop absolute top-[calc(100%+0.9rem)] left-1/2 max-h-[calc(100dvh-7.4rem)] w-[36.5rem] -translate-x-1/2 overflow-y-auto rounded-[1.35rem] border border-line bg-white px-8 py-7 text-ink shadow-[0_30px_60px_-20px_rgb(30_27_75_/_0.35)]">{groupServiceLinks(item.children).map((group) => <section key={group.label} className="mb-6 last:mb-0"><p className="mb-3 text-[0.9rem] font-bold tracking-[0.2em] text-brand uppercase">{group.label}</p><ul className="space-y-1">{group.items.map((child) => <li key={child.id}><Link href={child.href || "/"} onClick={closeAll} className="block py-0.5 text-[1.72rem] leading-[1.42] font-medium tracking-[-0.035em] text-ink/90 transition hover:text-brand">{child.label}</Link></li>)}</ul></section>)}</div> : null}</div> : <Link key={item.id} href={item.href || "/"} className={linkClass} onClick={closeAll}>{item.label}</Link>)}
      </nav>
      <div className="flex items-center gap-3"><Link href="/contact-us" className="btn-sheen bg-brand-gradient hidden rounded-full px-6 py-2.5 text-[1.15rem] font-bold text-white shadow-[0_10px_30px_-10px_rgb(79_70_229_/_0.8)] transition hover:-translate-y-0.5 sm:inline-flex">Inquire Now</Link><button type="button" className={`inline-flex h-10 w-10 items-center justify-center rounded-full border lg:hidden ${solid ? "border-line text-ink" : "border-white/25 text-white"}`} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => { setMenuOpen((open) => !open); setOpenItemId(null); }}>{menuOpen ? <span aria-hidden="true" className="text-xl leading-none">×</span> : <span aria-hidden="true" className="flex flex-col gap-1.5"><span className="block h-px w-4 bg-current" /><span className="block h-px w-4 bg-current" /><span className="block h-px w-4 bg-current" /></span>}</button></div>
    </div>
    {menuOpen ? <div className="max-h-[calc(100dvh-6.05rem)] overflow-y-auto border-t border-line bg-white px-5 py-5 lg:hidden"><nav className="mx-auto flex max-w-6xl flex-col gap-4" aria-label="Mobile">{navigation.map((item) => <div key={item.id}>{item.children.length ? <><Link href={item.href || "/"} className="text-[1.3rem] font-semibold" onClick={closeAll}>{item.label}</Link><ul className="mt-2 ml-3 space-y-2 border-l border-line pl-4">{item.children.map((child) => <li key={child.id}><Link href={child.href || "/"} className="text-[1rem] font-semibold text-muted" onClick={closeAll}>{child.label}</Link></li>)}</ul></> : <Link href={item.href || "/"} className="text-[1.3rem] font-semibold" onClick={closeAll}>{item.label}</Link>}</div>)}<Link href="/contact-us" onClick={closeAll} className="bg-brand-gradient mt-2 inline-flex w-fit rounded-full px-6 py-2.5 text-[1.15rem] font-bold text-white">Inquire Now</Link></nav></div> : null}
  </header>;
}

function Chevron({ open }: { open: boolean }) { return <svg viewBox="0 0 12 12" aria-hidden="true" className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`}><path d="M2 4.2 6 8l4-3.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>; }
