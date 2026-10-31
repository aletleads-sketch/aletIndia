"use client";

import Image from "next/image";
import { useState } from "react";
import type { DemoCaseStudy } from "@/lib/case-study-data";

function isWideScreen(src: string) {
  const lower = src.toLowerCase();
  return (
    lower.includes("website") ||
    lower.includes("all-deiveries") ||
    lower.includes("web-live") ||
    lower.includes("all-deliveries-web")
  );
}

export function CaseStudyScreens({ screens }: { screens: DemoCaseStudy["screens"] }) {
  const [active, setActive] = useState(0);
  const current = screens[active] ?? screens[0];

  if (!current) return null;

  const wide = isWideScreen(current.src);

  return (
    <div className="mt-6 w-full max-w-full min-w-0">
      {/* Outer navy shell — thumbs sit on this layer */}
      <div className="overflow-hidden rounded-[1.75rem] bg-[#080e24] p-3 sm:p-4">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-4">
          {/* Big blue layout — main preview only */}
          <div
            className={`min-w-0 flex-1 overflow-hidden rounded-[1.35rem] bg-[#0b1433] ${
              wide ? "p-3 sm:p-4" : "p-5 sm:p-[30px]"
            }`}
          >
            <div
              className={`relative mx-auto w-full max-w-full ${
                wide
                  ? "aspect-[16/10]"
                  : "aspect-[9/19] max-w-[13.5rem] sm:max-w-[14.5rem]"
              }`}
            >
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes={wide ? "(max-width: 1024px) 100vw, 70vw" : "(max-width: 1024px) 45vw, 14.5rem"}
                className="object-contain object-center drop-shadow-[0_18px_40px_-18px_rgb(0_0_0_/_0.55)]"
                priority
              />
            </div>
          </div>

          {/* Thumbnails: equal-size cells so mobile row stays aligned */}
          <ul className="grid w-full min-w-0 shrink-0 grid-cols-4 items-stretch gap-2 lg:w-[5rem] lg:grid-cols-1 lg:gap-3 lg:self-start">
            {screens.map((screen, index) => {
              const selected = index === active;
              return (
                <li key={screen.src} className="min-w-0">
                  <button
                    type="button"
                    aria-pressed={selected}
                    aria-label={`Show ${screen.alt}`}
                    onClick={() => setActive(index)}
                    className={`relative aspect-[9/16] w-full overflow-hidden rounded-[0.7rem] bg-transparent ring-2 transition ${
                      selected ? "ring-[#818cf8]" : "ring-white/15 hover:ring-white/35"
                    }`}
                  >
                    <Image
                      src={screen.src}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 22vw, 80px"
                      className="object-contain object-center p-0.5"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
