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
    <div className="mt-6">
      {/* Outer darkest green — thumbs sit on this layer */}
      <div className="rounded-[1.75rem] bg-[#0f2109] p-3 sm:p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-4">
          {/* Big green layout — main preview only */}
          <div className="min-w-0 flex-1 rounded-[1.35rem] bg-[#1a3315] p-[30px]">
            <div
              className={`mx-auto flex h-full min-h-[22rem] items-center justify-center ${
                wide ? "max-w-xl" : "max-w-[13.5rem] sm:max-w-[14.5rem]"
              }`}
            >
              <Image
                src={current.src}
                alt={current.alt}
                width={wide ? 1400 : 820}
                height={wide ? 900 : 1460}
                sizes={wide ? "(max-width: 1024px) 70vw, 36rem" : "(max-width: 1024px) 40vw, 14.5rem"}
                className="h-auto w-full rounded-[0.85rem] shadow-[0_18px_40px_-18px_rgb(0_0_0_/_0.55)]"
                priority
              />
            </div>
          </div>

          {/* Screenshots outside the big layout */}
          <ul className="grid shrink-0 grid-cols-4 gap-2 self-center lg:w-[5rem] lg:grid-cols-1 lg:gap-3 lg:self-start lg:pt-1">
            {screens.map((screen, index) => {
              const selected = index === active;
              const thumbWide = isWideScreen(screen.src);
              return (
                <li key={screen.src}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    aria-label={`Show ${screen.alt}`}
                    onClick={() => setActive(index)}
                    className={`w-full overflow-hidden rounded-[0.7rem] bg-[#1a3315] ring-2 transition ${
                      selected ? "ring-[#d6ff4a]" : "ring-transparent hover:ring-white/20"
                    }`}
                  >
                    <Image
                      src={screen.src}
                      alt=""
                      width={thumbWide ? 260 : 160}
                      height={thumbWide ? 160 : 284}
                      sizes="80px"
                      className="h-auto w-full"
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
