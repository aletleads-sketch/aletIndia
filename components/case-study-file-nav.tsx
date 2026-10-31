"use client";

import { useEffect, useState } from "react";
import { caseStudyFileNav } from "@/lib/case-study-sections";

type FileNavId = (typeof caseStudyFileNav)[number]["id"];

function asFileNavId(id: string): FileNavId | undefined {
  return caseStudyFileNav.find((item) => item.id === id)?.id;
}

export function CaseStudyFileNav() {
  const [activeId, setActiveId] = useState<FileNavId>(caseStudyFileNav[0]?.id ?? "challenge");

  useEffect(() => {
    const ids = caseStudyFileNav.map((item) => item.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const fromVisible = visible[0]?.target.id ? asFileNavId(visible[0].target.id) : undefined;
        if (fromVisible) {
          setActiveId(fromVisible);
          return;
        }

        // Fallback: nearest section above the viewport midpoint
        const mid = window.scrollY + window.innerHeight * 0.35;
        let current: FileNavId = ids[0];
        for (const el of elements) {
          const matched = asFileNavId(el.id);
          if (matched && el.offsetTop <= mid) current = matched;
        }
        setActiveId(current);
      },
      {
        root: null,
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.15, 0.35, 0.55, 0.75],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
      <p className="text-xs font-bold tracking-[0.18em] text-[#3d6b12] uppercase">In this file</p>
      <ul className="mt-4 space-y-2 text-sm font-bold">
        {caseStudyFileNav.map((item) => {
          const active = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? "true" : undefined}
                className={`block rounded-full px-3 py-2 transition ${
                  active
                    ? "bg-[#10210a] text-[#d6ff4a]"
                    : "text-[#10210a] hover:bg-[#10210a] hover:text-[#d6ff4a]"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
