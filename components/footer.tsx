import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import {
  company,
  companyLinks,
  legalLinks,
  services,
} from "@/lib/content";

export function Footer() {
  const year = 2026;

  return (
    <footer className="relative overflow-hidden bg-night text-white">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto w-full max-w-[92rem] px-5 sm:px-8 xl:px-12">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 py-10 md:flex-row md:items-center">
          <p className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Have an idea? <span className="text-gradient">Let&apos;s turn it into reality.</span>
          </p>
          <Link
            href="/contact-us"
            className="btn-sheen bg-brand-gradient inline-flex shrink-0 items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
          >
            Inquire Now
          </Link>
        </div>

        <div className="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo light />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/60">
              {company.address}
            </p>
            <a
              href={company.phoneHref}
              className="mt-4 block text-sm font-semibold text-white hover:text-brand-2"
            >
              {company.phone}
            </a>
            <a
              href={`mailto:${company.email}`}
              className="mt-2 inline-block text-sm font-semibold text-brand-2 hover:underline"
            >
              {company.email}
            </a>
          </div>

          <FooterColumn title="Development">
            {services
              .filter((service) => service.group === "Development")
              .map((service) => (
                <FooterLink key={service.id} href={`/${service.slug}`}>
                  {service.nav}
                </FooterLink>
              ))}
          </FooterColumn>

          <FooterColumn title="Designing">
            {services
              .filter((service) => service.group === "Designing")
              .map((service) => (
                <FooterLink key={service.id} href={`/${service.slug}`}>
                  {service.nav === "UX/UI Designing" ? "UX/UI Design" : "Graphic Design"}
                </FooterLink>
              ))}
          </FooterColumn>

          <FooterColumn title="Digital Marketing">
            {services
              .find((service) => service.id === "digital-marketing")
              ?.channels?.map((channel) => (
                <FooterLink key={channel} href="/digital-marketing">
                  {channel}
                </FooterLink>
              ))}
          </FooterColumn>

          <FooterColumn title="Company">
            {companyLinks.map((link) => (
              <FooterLink key={link.label} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/50">
            Copyright © {year} ALET INDIA. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="lg:col-span-2">
      <h2 className="text-sm font-bold text-white">{title}</h2>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const className = "text-sm text-white/60 transition hover:translate-x-0.5 hover:text-white";
  return (
    <li>
      {href.startsWith("http") ? (
        <a href={href} target="_blank" rel="noreferrer" className={className}>
          {children}
        </a>
      ) : (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
    </li>
  );
}
