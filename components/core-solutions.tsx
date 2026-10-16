"use client";

import { useEffect, useState } from "react";
import { coreSolutions } from "@/lib/content";

const icons = [
  <path
    key="dev"
    d="M8 8 4.5 12 8 16M16 8l3.5 4L16 16M13 6l-2 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  <path
    key="enh"
    d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M6.2 6.2l2.1 2.1M15.7 15.7l2.1 2.1M17.8 6.2l-2.1 2.1M8.3 15.7l-2.1 2.1M12 8.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6Z"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  />,
  <path
    key="up"
    d="M12 19V6m0 0-4.5 4.5M12 6l4.5 4.5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
];

export function CoreSolutionsList() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % coreSolutions.length);
    }, 3800);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <ol
      className="relative mt-8 space-y-3 [overflow-anchor:none]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span
        className="solution-rail pointer-events-none absolute top-6 bottom-6 left-[1.65rem] w-px bg-line"
        aria-hidden="true"
      >
        <span
          className="solution-rail-fill absolute inset-x-0 top-0 origin-top bg-brand-gradient transition-transform duration-700 ease-out"
          style={{
            height: "100%",
            transform: `scaleY(${(active + 1) / coreSolutions.length})`,
          }}
        />
      </span>

      {coreSolutions.map((item, index) => {
        const isActive = index === active;
        return (
          <li key={item.title}>
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-pressed={isActive}
              className={`solution-card group relative flex min-h-[9.5rem] w-full gap-5 rounded-2xl border p-5 text-left transition-colors duration-500 ${
                isActive
                  ? "border-brand/30 bg-white shadow-[0_22px_50px_-28px_rgb(79_70_229_/_0.55)]"
                  : "border-transparent bg-surface/60 hover:border-line hover:bg-white"
              }`}
            >
              <span
                className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-500 ${
                  isActive
                    ? "bg-brand-gradient text-white shadow-[0_12px_28px_-10px_rgb(79_70_229_/_0.75)]"
                    : "bg-white text-brand shadow-sm ring-1 ring-line"
                }`}
              >
                {isActive ? <span className="solution-ring" aria-hidden="true" /> : null}
                <svg viewBox="0 0 24 24" className="relative h-6 w-6" aria-hidden="true">
                  {icons[index]}
                </svg>
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center justify-between gap-3">
                  <span
                    className={`block text-lg font-bold transition-colors ${
                      isActive ? "text-ink" : "text-ink/70"
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-[0.7rem] font-bold tracking-[0.16em] text-muted/60 uppercase">
                    0{index + 1}
                  </span>
                </span>
                <span
                  className={`mt-1.5 block flex-1 text-sm leading-7 ${
                    isActive ? "text-muted" : "text-muted/70"
                  }`}
                >
                  {item.description}
                </span>
                <span
                  className={`solution-progress mt-4 block h-1 overflow-hidden rounded-full bg-line ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {isActive ? (
                    <span
                      key={active}
                      className="solution-progress-bar block h-full rounded-full bg-brand-gradient"
                    />
                  ) : null}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
