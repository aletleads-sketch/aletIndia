"use client";

import Image from "next/image";
import { useState } from "react";
import type { CaseStudy } from "@/lib/case-studies";

export function ScreenSwitcher({ study }: { study: CaseStudy }) {
  const [active, setActive] = useState(0);
  const screen = study.screens[active] ?? study.screens[0];

  return (
    <div className="grid gap-4 rounded-[2rem] bg-[#10210a] p-4 text-white sm:p-6 lg:grid-cols-[minmax(0,1fr)_9rem]">
      <div className="flex min-h-[24rem] items-center justify-center rounded-[1.4rem] bg-[#1a3314] p-6">
        <Image
          key={screen.src}
          src={screen.src}
          alt={screen.alt}
          width={900}
          height={1400}
          priority
          className="max-h-[32rem] w-auto rounded-2xl object-contain"
        />
      </div>
      <ul className="grid grid-cols-4 gap-2 lg:grid-cols-1">
        {study.screens.map((item, index) => (
          <li key={item.src}>
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-pressed={index === active}
              aria-label={`Show ${item.alt}`}
              className={`flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-[#1a3314] p-1 ring-2 transition ${
                index === active ? "ring-[#d6ff4a]" : "ring-transparent hover:ring-white/30"
              }`}
            >
              <Image src={item.src} alt="" width={160} height={280} className="max-h-20 w-auto object-contain" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ApproachSteps({ steps }: { steps: CaseStudy["approach"] }) {
  const [active, setActive] = useState(0);
  const step = steps[active];

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-[14rem_minmax(0,1fr)]">
      <ol className="grid gap-2">
        {steps.map((item, index) => (
          <li key={item.title}>
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-pressed={index === active}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                index === active
                  ? "bg-[#10210a] text-[#d6ff4a]"
                  : "bg-white text-[#10210a] ring-1 ring-[#10210a]/10 hover:ring-[#10210a]/30"
              }`}
            >
              <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              {item.title}
            </button>
          </li>
        ))}
      </ol>
      <div className="rounded-[1.6rem] bg-white p-6 ring-1 ring-[#10210a]/10 sm:p-8">
        <p className="text-xs font-bold tracking-[0.18em] text-[#3d6b12] uppercase">
          Step {String(active + 1).padStart(2, "0")}
        </p>
        <h3 className="font-syne mt-3 text-2xl font-extrabold tracking-tight">{step.title}</h3>
        <p className="mt-4 text-base leading-7 text-[#10210a]/75">{step.body}</p>
      </div>
    </div>
  );
}
