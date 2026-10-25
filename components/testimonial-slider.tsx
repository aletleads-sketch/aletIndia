"use client";

import { useEffect, useState } from "react";
import { testimonials } from "@/lib/content";
import { getPublishedTestimonials, type CmsTestimonial } from "@/lib/cms-client";

const ROTATE_MS = 3000;

export function TestimonialSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cmsTestimonials, setCmsTestimonials] = useState<CmsTestimonial[] | null>(null);
  useEffect(() => { getPublishedTestimonials().then((rows) => setCmsTestimonials(rows.length ? rows : null)).catch(() => undefined); }, []);
  const items = cmsTestimonials?.map((item) => ({ quote:item.quote, name:item.client_name, role:[item.client_role,item.company].filter(Boolean).join(" · "), image:item.image_url || "/images/people/rk.jpg", fit:"cover" as const })) ?? testimonials;
  const count = items.length;

  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % count);
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, [paused, count, active]);

  const go = (step: number) => {
    setActive((i) => (i + step + count) % count);
  };

  return (
    <div className="grid gap-5 [overflow-anchor:none] lg:grid-cols-[1fr_auto] lg:items-end">
      <figure className="min-w-0">
        <svg
          viewBox="0 0 48 36"
          aria-hidden="true"
          className="h-7 w-9 fill-brand-2/80"
        >
          <path d="M0 36V22C0 9.6 6.4 2.3 19.2 0l2 4.6C14 6.6 10.6 10.6 10.4 16.6H20V36H0Zm28 0V22C28 9.6 34.4 2.3 47.2 0l2 4.6c-7.2 2-10.6 6-10.8 12H48V36H28Z" />
        </svg>

        {/* Stack all quotes so the tallest one locks section height */}
        <div className="relative mt-3 grid max-w-3xl">
          {items.map((t, i) => (
            <blockquote
              key={t.name}
              aria-hidden={i !== active}
              className={`col-start-1 row-start-1 text-xl leading-snug font-medium sm:text-2xl ${
                i === active
                  ? "testimonial-fade relative text-white"
                  : "invisible pointer-events-none select-none"
              }`}
            >
              {t.quote}
            </blockquote>
          ))}
        </div>

        <div className="relative mt-5 grid">
          {items.map((t, i) => (
            <figcaption
              key={t.name}
              aria-hidden={i !== active}
              className={`col-start-1 row-start-1 flex items-center gap-3 ${
                i === active ? "relative" : "invisible pointer-events-none"
              }`}
            >
              <img
                src={t.image}
                alt=""
                className={`h-11 w-11 rounded-full bg-white ring-2 ring-brand-2/60 ${
                  t.fit === "cover" ? "object-cover" : "object-contain p-1"
                }`}
              />
              <span>
                <span className="block text-sm font-semibold text-white">{t.name}</span>
                <span className="mt-0.5 block text-xs text-white/60">{t.role}</span>
              </span>
            </figcaption>
          ))}
        </div>
      </figure>

      <div
        className="flex flex-col items-start gap-3 sm:items-end"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPaused(false);
          }
        }}
      >
        <div className="flex gap-2" role="tablist" aria-label="Choose testimonial">
          {items.map((t, i) => (
            <button
              key={t.name}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show testimonial from ${t.name}`}
              onClick={() => setActive(i)}
              className={`relative h-2 overflow-hidden rounded-full transition-all duration-500 ${
                i === active ? "w-10 bg-white/25" : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            >
              {i === active && !paused ? (
                <span
                  key={`${active}-${paused}`}
                  className="testimonial-progress absolute inset-y-0 left-0 rounded-full bg-brand-2"
                />
              ) : null}
              {i === active && paused ? (
                <span className="absolute inset-0 rounded-full bg-brand-2" />
              ) : null}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <ArrowButton label="Previous testimonial" onClick={() => go(-1)} flip />
          <ArrowButton label="Next testimonial" onClick={() => go(1)} />
        </div>
      </div>
    </div>
  );
}

function ArrowButton({
  label,
  onClick,
  flip = false,
}: {
  label: string;
  onClick: () => void;
  flip?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-brand-2 hover:bg-brand-2 hover:text-night"
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className={`h-4 w-4 ${flip ? "rotate-180" : ""}`}
      >
        <path
          d="M3 8h10M9 4l4 4-4 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
