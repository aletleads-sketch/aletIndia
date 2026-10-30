"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Arrow } from "@/components/ui";
import { caseStudyIndexEntries, caseStudyIndustries } from "@/lib/case-study-data";

type IndexEntry = (typeof caseStudyIndexEntries)[number];

const studyGreen = "#1a3314";
const studyGreenDeep = "#12240e";

function PreviewVisual({ entry }: { entry: IndexEntry }) {
  const src = entry.previewImage ?? entry.detail.study.screens[0];

  return (
    <div
      className="relative flex h-full min-h-[26rem] items-center justify-center overflow-hidden p-6 sm:min-h-[32rem] sm:p-8"
      style={{ backgroundColor: studyGreen }}
    >
      <Image
        src={src}
        alt=""
        width={380}
        height={760}
        sizes="(max-width: 768px) 60vw, 20rem"
        className="h-auto max-h-[min(32rem,72vh)] w-auto max-w-[88%] object-contain drop-shadow-[0_28px_48px_rgb(0_0_0_/_0.5)]"
      />
    </div>
  );
}

function StudyPreview({ entry }: { entry: IndexEntry }) {
  return (
    <article
      className="grid overflow-hidden rounded-[1.75rem] border border-white/12 shadow-[0_28px_70px_-40px_rgb(0_0_0_/_0.75)] backdrop-blur lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
      style={{ backgroundColor: `${studyGreenDeep}cc` }}
    >
      <PreviewVisual entry={entry} />
      <div
        className="flex flex-col justify-center px-6 py-8 sm:px-9 sm:py-10"
        style={{ backgroundColor: `${studyGreenDeep}e6` }}
      >
        <p className="text-xs font-bold tracking-[0.18em] text-[#b6f26d] uppercase">
          {entry.detail.study.name} · {entry.industry}
        </p>
        <h2 className="mt-4 text-3xl leading-[1.05] font-extrabold tracking-tight text-balance text-white sm:text-4xl lg:text-[2.35rem]">
          {entry.previewTitle}
        </h2>
        <p className="mt-5 max-w-md text-sm leading-7 text-white/70 sm:text-[0.98rem]">
          {entry.previewSummary}
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {entry.previewTags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80"
            >
              {tag}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link
            href={`/case-studies/${entry.slug}`}
            className="btn-sheen inline-flex items-center gap-2 rounded-full bg-[#d6ff4a] px-6 py-3 text-sm font-extrabold text-[#10210a] shadow-[0_12px_40px_-8px_rgb(214_255_74_/_0.45)] transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Open the full study <Arrow />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function CaseStudiesBrowser({ embedded = false }: { embedded?: boolean }) {
  const [industry, setIndustry] = useState<(typeof caseStudyIndustries)[number]>("All");
  const [activeSlug, setActiveSlug] = useState(caseStudyIndexEntries[0]?.slug ?? "tajika");

  const filtered = useMemo(() => {
    if (industry === "All") return caseStudyIndexEntries;
    return caseStudyIndexEntries.filter((entry) => entry.industry === industry);
  }, [industry]);

  const active =
    filtered.find((entry) => entry.slug === activeSlug) ?? filtered[0] ?? caseStudyIndexEntries[0];

  const selectIndustry = (next: (typeof caseStudyIndustries)[number]) => {
    setIndustry(next);
    const nextList =
      next === "All"
        ? caseStudyIndexEntries
        : caseStudyIndexEntries.filter((entry) => entry.industry === next);
    if (nextList.length && !nextList.some((entry) => entry.slug === activeSlug)) {
      setActiveSlug(nextList[0].slug);
    }
  };

  const shell = embedded
    ? "relative px-5 pb-20 text-white sm:px-8 xl:px-12"
    : "hero-mesh relative overflow-hidden px-5 pb-20 text-white sm:px-8 xl:px-12";

  return (
    <div className={shell}>
      {!embedded ? (
        <>
          <div className="dot-grid pointer-events-none absolute inset-0" />
          <div className="orb pointer-events-none absolute top-10 -right-24 h-80 w-80 rounded-full bg-brand/35 blur-3xl" />
          <div className="orb orb-b pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-brand-2/25 blur-3xl" />
        </>
      ) : null}
      <div className="relative mx-auto w-full max-w-[92rem] pt-6 sm:pt-10">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by industry">
          {caseStudyIndustries.map((tab) => {
            const selected = industry === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectIndustry(tab)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  selected
                    ? "text-white shadow-[0_10px_28px_-10px_rgb(26_51_20_/_0.85)]"
                    : "bg-white/10 text-white/80 hover:bg-white/15"
                }`}
                style={selected ? { backgroundColor: studyGreen } : undefined}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <div className="flex flex-col">
            <ul className="grid content-start gap-3">
              {filtered.map((entry, index) => {
                const pressed = active?.slug === entry.slug;
                return (
                  <li key={entry.slug}>
                    <button
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => setActiveSlug(entry.slug)}
                      className={`flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                        pressed
                          ? "border-[#2f5a24] text-white shadow-[0_12px_32px_-14px_rgb(26_51_20_/_0.9)]"
                          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      }`}
                      style={pressed ? { backgroundColor: studyGreen } : undefined}
                    >
                      <span className="text-2xl leading-none font-extrabold tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="block text-xs font-bold tracking-[0.16em] uppercase opacity-70">
                          {entry.industry}
                        </span>
                        <span className="mt-1 block text-lg font-extrabold">
                          {entry.detail.study.name}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {active ? <StudyPreview entry={active} /> : null}
        </div>

        <p className="mt-8 whitespace-nowrap text-sm leading-7 text-white/55 sm:text-[0.95rem]">
          Want something in this shape for your own product?{" "}
          <Link
            href="/contact-us"
            className="font-extrabold text-[#b6f26d] transition hover:brightness-110"
          >
            Start a conversation.
          </Link>
        </p>
      </div>
    </div>
  );
}
