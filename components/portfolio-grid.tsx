"use client";

import { useState } from "react";
import { CaseStudyCard } from "@/components/case-study-card";
import { caseStudies } from "@/lib/content";

type Study = (typeof caseStudies)[number];

const filters = ["All", "Mobile Apps", "Web", "Games"] as const;
type Filter = (typeof filters)[number];

function kind(study: Study): Exclude<Filter, "All"> {
  if (study.category.includes("Gam")) return "Games";
  if ("landscape" in study && study.landscape) return "Web";
  return "Mobile Apps";
}

export function PortfolioGrid() {
  const [active, setActive] = useState<Filter>("All");
  const items = caseStudies
    .map((study, index) => ({ study, index }))
    .filter(({ study }) => active === "All" || kind(study) === active);

  return (
    <>
      <div role="tablist" aria-label="Filter projects" className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const count =
            filter === "All"
              ? caseStudies.length
              : caseStudies.filter((study) => kind(study) === filter).length;
          return (
            <button
              key={filter}
              type="button"
              role="tab"
              aria-selected={active === filter}
              onClick={() => setActive(filter)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                active === filter
                  ? "bg-brand-gradient text-white shadow-[0_12px_30px_-12px_rgb(79_70_229_/_0.8)]"
                  : "bg-white text-ink ring-1 ring-line hover:text-brand"
              }`}
            >
              {filter}
              <span
                className={`rounded-full px-2 py-0.5 text-[0.7rem] ${
                  active === filter ? "bg-white/20" : "bg-surface text-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <ul className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {items.map(({ study, index }) => (
          <li key={`${study.name}-${index}`} className="scale-in">
            <CaseStudyCard study={study} colorIndex={index} className="h-full" />
          </li>
        ))}
      </ul>
    </>
  );
}
