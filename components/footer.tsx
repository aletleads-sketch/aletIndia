import type { ReactNode } from "react";
import Link from "next/link";
import { InquireNowButton } from "@/components/inquire-modal";
import { Logo } from "@/components/logo";
import { loadFields, loadSiteContent } from "@/lib/site-content";
import type { MenuLink } from "@/lib/site-content-shared";
import { assetPath } from "@/lib/site-path";

const defaultSocialLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/aletindiasoftwares/home/",
    Icon: LinkedInIcon,
  },
  {
    label: "X",
    href: "https://x.com/AletIndia",
    Icon: XIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61575215143054",
    Icon: FacebookIcon,
  },
] as const;

const socialIcon = (label: string) => defaultSocialLinks.find((link) => link.label.toLowerCase() === label.toLowerCase())?.Icon ?? LinkIcon;

export async function Footer() {
  const [content, copy] = await Promise.all([loadSiteContent(), loadFields("_shared#footer")]);
  const { company, companyLinks, legalLinks, services } = content;
  const socialLinks = (content.socialLinks.length ? content.socialLinks : defaultSocialLinks).map((link) => ({ ...link, Icon: socialIcon(link.label) }));
  const orDefault = (stored: MenuLink[], fallback: MenuLink[]) => (stored.length ? stored : fallback);
  const development = orDefault(
    content.footerDevelopment,
    services.filter((service) => service.group === "Development").map((service) => ({ label: service.nav, href: `/${service.slug}` })),
  );
  const designing = orDefault(
    content.footerDesigning,
    services
      .filter((service) => service.group === "Designing")
      .map((service) => ({ label: service.nav === "UX/UI Designing" ? "UX/UI Design" : "Graphic Design", href: `/${service.slug}` })),
  );
  const marketing = orDefault(
    content.footerMarketing,
    (services.find((service) => service.id === "digital-marketing")?.channels ?? []).map((channel) => ({ label: channel, href: "/digital-marketing" })),
  );

  return (
    <footer className="relative overflow-hidden bg-night text-white">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto w-full max-w-[92rem] px-5 sm:px-8 xl:px-12">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 py-10 md:flex-row md:items-center">
          <p className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            {copy.headline} <span className="text-gradient">{copy.headlineAccent}</span>
          </p>
          <InquireNowButton className="btn-sheen bg-brand-gradient inline-flex shrink-0 items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5">
            {copy.buttonLabel}
          </InquireNowButton>
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
            <ul className="mt-6 flex items-center gap-3" aria-label="Social media">
              {socialLinks.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn title="Development">
            {development.map((link) => (
              <FooterLink key={link.href + link.label} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Designing">
            {designing.map((link) => (
              <FooterLink key={link.href + link.label} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Digital Marketing">
            {marketing.map((link) => (
              <FooterLink key={link.label} href={link.href}>
                {link.label}
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
            {copy.copyright}
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
  const isHttp = href.startsWith("http");
  const isPdf = href.toLowerCase().endsWith(".pdf");
  return (
    <li>
      {isHttp || isPdf ? (
        <a
          href={isPdf ? assetPath(href) : href}
          target="_blank"
          rel="noreferrer"
          className={className}
        >
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

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.81-5.96 6.81H1.69l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23zm-1.16 17.52h1.83L7.08 4.13H5.11l11.97 15.64z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M22.68 0H1.32A1.32 1.32 0 0 0 0 1.32v21.36A1.32 1.32 0 0 0 1.32 24h11.5v-9.29H9.69V11.1h3.13V8.41c0-3.1 1.89-4.79 4.66-4.79 1.33 0 2.47.1 2.8.14v3.24h-1.92c-1.5 0-1.8.72-1.8 1.76v2.31h3.6l-.47 3.61h-3.13V24h6.12A1.32 1.32 0 0 0 24 22.68V1.32A1.32 1.32 0 0 0 22.68 0z" />
    </svg>
  );
}

/** For a social link added in the admin that has no icon of its own. */
function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
    </svg>
  );
}
