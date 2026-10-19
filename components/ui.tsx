import type { ReactNode } from "react";

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] uppercase ${
        light ? "text-brand-2" : "text-brand"
      }`}
    >
      <span
        className={`h-0.5 w-6 rounded-full ${light ? "bg-brand-2" : "bg-brand"}`}
        aria-hidden="true"
      />
      {children}
    </p>
  );
}

export function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
