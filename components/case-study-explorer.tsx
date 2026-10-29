"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Arrow } from "@/components/ui";
import { caseStudies, industries, type CaseStudy } from "@/lib/case-studies";

export function CaseStudyExplorer() {
  const filters = industries();
  const [industry, setIndustry] = useState("All");
  const [slug, setSlug] = useState(caseStudies[0].slug);

  const visible = useMemo(
    () =>
      industry === "All" ? caseStudies : caseStudies.filter((study) => study.industry === industry),
    [industry],
  );

  const selected = visible.find((study) => study.slug === slug) ?? visible[0];

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by industry">
        {filters.map((item) => {
          const on = item === industry;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                setIndustry(item);
                const next = caseStudies.find((study) => item === "All" || study.industry === item);
                if (next) setSlug(next.slug);
              }}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                on ? "bg-[#d6ff4a] text-[#10210a]" : "bg-white/10 text-white/80 hover:bg-white/15"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <ul className="grid content-start gap-3">
          {visible.map((study, index) => (
            <li key={study.slug}>
              <button
                type="button"
                onClick={() => setSlug(study.slug)}
                aria-pressed={study.slug === selected.slug}
                className={`flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                  study.slug === selected.slug
                    ? "border-[#d6ff4a] bg-[#d6ff4a] text-[#10210a]"
                    : "border-white/10 bg-white/5 text-white hover:border-white/30"
                }`}
              >
                <span className="font-syne text-2xl leading-none font-extrabold tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-xs font-bold tracking-[0.16em] uppercase opacity-70">
                    {study.industry}
                  </span>
                  <span className="mt-1 block text-lg font-extrabold">{study.client}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <Stage study={selected} />
      </div>
    </div>
  );
}

function Stage({ study }: { study: CaseStudy }) {
  return (
    <article className="grid overflow-hidden rounded-[2rem] bg-[#10210a] text-white lg:grid-cols-[0.9fr_1.1fr]">
      <div className="flex min-h-[22rem] items-end justify-center bg-[#1a3314] p-8">
        <Image
          key={study.cover}
          src={study.cover}
          alt={study.coverAlt}
          width={720}
          height={1280}
          className="max-h-[28rem] w-auto rounded-[1.4rem] object-contain shadow-[0_30px_60px_-20px_rgb(0_0_0_/_0.65)]"
        />
      </div>
      <div className="flex flex-col justify-between p-7 sm:p-10">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-[#d6ff4a] uppercase">
            {study.client} · {study.industry}
          </p>
          <h2 className="font-syne mt-4 text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
            {study.title}
          </h2>
          <p className="mt-5 text-base leading-7 text-white/70">{study.summary}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {study.services.map((service) => (
              <li
                key={service}
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/80"
              >
                {service}
              </li>
            ))}
          </ul>
        </div>
        <Link
          href={`/case-studies/${study.slug}`}
          className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-[#d6ff4a] px-5 py-3 text-sm font-extrabold text-[#10210a] transition hover:-translate-y-0.5"
        >
          Open the full study
          <Arrow />
        </Link>
      </div>
    </article>
  );
}
