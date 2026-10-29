"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { services } from "@/lib/content";

const links = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Career", href: "/career" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact Us", href: "/contact-us" },
];

const groups = ["Development", "Designing", "Digital Marketing"] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setServicesOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!servicesOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!servicesRef.current?.contains(event.target as Node)) setServicesOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [servicesOpen]);

  const solid = scrolled || menuOpen;
  const closeAll = () => {
    setMenuOpen(false);
    setServicesOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? "border-b border-line/70 bg-white/85 shadow-[0_10px_40px_-15px_rgb(30_27_75_/_0.25)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[6.05rem] w-full max-w-[92rem] items-center justify-between gap-4 px-5 sm:px-8 xl:px-12">
        <Link href="/" aria-label="ALET India home" onClick={closeAll}>
          <Logo light={!solid} />
        </Link>

        <nav className="hidden items-center gap-3.5 xl:gap-5 lg:flex" aria-label="Primary">
          <Link
            href="/"
            className={`nav-link text-[0.95rem] font-semibold transition-colors xl:text-[1.05rem] ${solid ? "text-ink" : "text-white/90 hover:text-white"}`}
          >
            Home
          </Link>
          <div ref={servicesRef} className="relative">
            <button
              type="button"
              className={`nav-link flex items-center gap-1.5 text-[0.95rem] font-semibold transition-colors xl:text-[1.05rem] ${solid ? "text-ink" : "text-white/90 hover:text-white"}`}
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen((open) => !open)}
            >
              Services
              <Chevron open={servicesOpen} />
            </button>
            {servicesOpen ? (
              <div className="menu-pop absolute top-[calc(100%+0.9rem)] left-1/2 max-h-[min(70vh,32rem)] w-[24rem] -translate-x-1/2 overflow-y-auto rounded-2xl border border-line bg-white p-5 text-ink shadow-[0_30px_60px_-20px_rgb(30_27_75_/_0.35)]">
                <ServiceMenu onNavigate={closeAll} />
              </div>
            ) : null}
          </div>
          {links.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link text-[0.95rem] font-semibold transition-colors xl:text-[1.05rem] ${solid ? "text-ink" : "text-white/90 hover:text-white"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/contact-us"
            className="btn-sheen bg-brand-gradient hidden rounded-full px-6 py-2.5 text-[1.15rem] font-bold text-white shadow-[0_10px_30px_-10px_rgb(79_70_229_/_0.8)] transition hover:-translate-y-0.5 sm:inline-flex"
          >
            Inquire Now
          </Link>
          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border lg:hidden ${
              solid ? "border-line text-ink" : "border-white/25 text-white"
            }`}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => {
              setMenuOpen((open) => !open);
              setServicesOpen(false);
            }}
          >
            <span className="sr-only">Menu</span>
            {menuOpen ? (
              <span aria-hidden="true" className="text-xl leading-none">
                ×
              </span>
            ) : (
              <span aria-hidden="true" className="flex flex-col gap-1.5">
                <span className="block h-px w-4 bg-current" />
                <span className="block h-px w-4 bg-current" />
                <span className="block h-px w-4 bg-current" />
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="max-h-[calc(100dvh-6.05rem)] overflow-y-auto border-t border-line bg-white px-5 py-5 lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-4" aria-label="Mobile">
            <Link href="/" className="text-[1.3rem] font-semibold" onClick={closeAll}>
              Home
            </Link>
            <ServiceMenu onNavigate={closeAll} />
            {links.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[1.3rem] font-semibold"
                onClick={closeAll}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact-us"
              onClick={closeAll}
              className="bg-brand-gradient mt-2 inline-flex w-fit rounded-full px-6 py-2.5 text-[1.15rem] font-bold text-white"
            >
              Inquire Now
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function ServiceMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="grid gap-4">
      {groups.map((group) => (
        <div key={group}>
          <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-brand uppercase">
            {group}
          </p>
          <ul className="mt-2 space-y-1.5">
            {services
              .filter((service) => service.group === group)
              .map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/${service.slug}`}
                    onClick={onNavigate}
                    className="text-[1.15rem] text-ink/80 transition hover:text-brand"
                  >
                    {service.nav}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M2 4.2 6 8l4-3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
