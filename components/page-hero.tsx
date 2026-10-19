import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui";

export function PageHero({
  crumb,
  title,
  accent,
  intro,
  image,
  imageAlt = "",
  actions = true,
  children,
}: {
  crumb: string;
  title: string;
  accent?: string;
  intro?: string;
  image?: string;
  imageAlt?: string;
  actions?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className="hero-mesh relative overflow-hidden text-white">
      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="orb pointer-events-none absolute top-16 -right-24 h-80 w-80 rounded-full bg-brand/40 blur-3xl" />
      <div className="orb orb-b pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-2/30 blur-3xl" />

      <div
        className={`relative mx-auto grid w-full max-w-[92rem] items-center gap-12 px-5 pt-36 pb-24 sm:px-8 xl:px-12 lg:pt-40 lg:pb-28 ${
          image ? "lg:grid-cols-[1.1fr_0.9fr]" : ""
        }`}
      >
        <div className={image ? "" : "mx-auto max-w-3xl text-center"}>
          <nav
            aria-label="Breadcrumb"
            className="rise glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-white/80"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span aria-hidden="true" className="text-white/40">
              /
            </span>
            <span className="text-white">{crumb}</span>
          </nav>
          <h1 className="rise d1 mt-7 text-4xl leading-[1.06] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {title} {accent ? <span className="text-gradient">{accent}</span> : null}
          </h1>
          {intro ? (
            <p
              className={`rise d2 mt-6 text-base leading-7 text-white/70 sm:text-lg ${
                image ? "max-w-2xl" : "mx-auto max-w-2xl"
              }`}
            >
              {intro}
            </p>
          ) : null}
          {actions ? (
            <div className={`rise d3 mt-9 flex flex-wrap gap-3 ${image ? "" : "justify-center"}`}>
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
          ) : null}
          {children}
        </div>

        {image ? (
          <div className="rise d2 relative mx-auto w-full max-w-xl">
            <div
              className="spin-slow pointer-events-none absolute -inset-8 rounded-full border border-dashed border-white/15"
              aria-hidden="true"
            />
            <div className="relative rotate-[-2deg] overflow-hidden rounded-[2rem] border-[6px] border-white shadow-[0_40px_80px_-20px_rgb(0_0_0_/_0.6)]">
              <Image
                src={image}
                alt={imageAlt}
                width={1200}
                height={800}
                priority
                className="h-72 w-full object-cover sm:h-80"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-night/30 via-transparent to-brand/20"
                aria-hidden="true"
              />
            </div>
          </div>
        ) : null}
      </div>

      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-16 w-full fill-white"
      >
        <path d="M0 80V40C240 0 480 0 720 30s480 50 720 10v40H0Z" />
      </svg>
    </section>
  );
}
