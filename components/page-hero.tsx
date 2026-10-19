import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui";

export function Breadcrumb({ crumb, className = "" }: { crumb: string; className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-white/80 ${className}`}
    >
      <Link href="/" className="hover:text-white">
        Home
      </Link>
      <span aria-hidden="true" className="text-white/40">
        /
      </span>
      <span className="text-white">{crumb}</span>
    </nav>
  );
}

export function Wave({ className = "fill-white" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`absolute inset-x-0 bottom-0 h-16 w-full ${className}`}
    >
      <path d="M0 80V40C240 0 480 0 720 30s480 50 720 10v40H0Z" />
    </svg>
  );
}

export function HeroActions({ center = false }: { center?: boolean }) {
  return (
    <div className={`rise d3 mt-9 flex flex-wrap gap-3 ${center ? "justify-center" : ""}`}>
      <Link
        href="/contact-us"
        className="btn-sheen bg-brand-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_-8px_rgb(79_70_229_/_0.8)] transition hover:-translate-y-0.5"
      >
        Get a Free Consultation
        <Arrow />
      </Link>
      <Link
        href="/portfolio"
        className="glass inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
      >
        View Our Work
      </Link>
    </div>
  );
}

export function PhotoHero({
  crumb,
  image,
  imageAlt = "",
  align = "left",
  tint = "from-night via-night/80 to-night/30",
  className = "min-h-[38rem] lg:min-h-[44rem]",
  style,
  children,
}: {
  crumb: string;
  image: string;
  imageAlt?: string;
  align?: "left" | "center" | "bottom";
  tint?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const layout =
    align === "center"
      ? "items-center justify-center text-center"
      : align === "bottom"
        ? "items-end"
        : "items-center";
  return (
    <section className={`relative flex overflow-hidden bg-night text-white ${className}`} style={style}>
      <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover" />
      <div
        className={`pointer-events-none absolute inset-0 ${
          align === "center" ? "bg-night/70" : `bg-gradient-to-r ${tint}`
        }`}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night/80 to-transparent"
        aria-hidden="true"
      />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" />
      <div
        className={`relative mx-auto flex w-full max-w-[92rem] px-5 pt-36 pb-28 sm:px-8 xl:px-12 lg:pt-40 ${layout}`}
      >
        <div className={align === "center" ? "mx-auto max-w-3xl" : "max-w-3xl"}>
          <Breadcrumb crumb={crumb} className="rise" />
          {children}
        </div>
      </div>
      <Wave />
    </section>
  );
}

export function HeroTitle({
  title,
  accent,
  className = "",
}: {
  title: string;
  accent?: string;
  className?: string;
}) {
  return (
    <h1
      className={`rise d1 mt-7 text-4xl leading-[1.06] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl ${className}`}
    >
      {title} {accent ? <span className="text-gradient">{accent}</span> : null}
    </h1>
  );
}
