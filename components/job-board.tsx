"use client";

import { useMemo, useState } from "react";
import { Arrow, Photo } from "@/components/ui";
import { careers } from "@/lib/pages";

const openings = careers.openings;
const departments = ["All", ...new Set(openings.map((job) => job.department))];

export function JobBoard() {
  const [department, setDepartment] = useState("All");
  const visible = useMemo(
    () => openings.filter((job) => department === "All" || job.department === department),
    [department],
  );
  const [selectedId, setSelectedId] = useState(openings[0].id);
  const selected = visible.find((job) => job.id === selectedId) ?? visible[0];

  return (
    <div>
      <div role="tablist" aria-label="Filter roles" className="flex flex-wrap gap-2">
        {departments.map((item) => {
          const count =
            item === "All" ? openings.length : openings.filter((job) => job.department === item).length;
          const active = department === item;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setDepartment(item)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                active
                  ? "bg-ink text-white"
                  : "bg-white text-ink ring-1 ring-line hover:text-accent"
              }`}
            >
              {item}
              <span className={`rounded-full px-2 py-0.5 text-[0.7rem] ${active ? "bg-white/15" : "bg-surface text-muted"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <ul className="space-y-3">
          {visible.map((job) => {
            const active = job.id === selected.id;
            return (
              <li key={job.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(job.id)}
                  aria-pressed={active}
                  className={`w-full rounded-[1.4rem] px-5 py-5 text-left transition ${
                    active
                      ? "bg-night text-white shadow-[0_20px_50px_-30px_rgb(6_10_31_/_0.8)]"
                      : "bg-white text-ink ring-1 ring-line hover:ring-ink/30"
                  }`}
                >
                  <span className={`text-xs font-bold tracking-[0.16em] uppercase ${active ? "text-amber-300" : "text-accent"}`}>
                    {job.department}
                  </span>
                  <span className="mt-2 block text-xl font-extrabold tracking-tight">{job.title}</span>
                  <span className={`mt-2 block text-sm ${active ? "text-white/70" : "text-muted"}`}>
                    {job.experience} · {job.location}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <article className="overflow-hidden rounded-[2rem] bg-white ring-1 ring-line lg:sticky lg:top-32">
          <Photo src={selected.image} alt="" className="h-52 sm:h-60" sizes="(max-width: 1024px) 100vw, 40vw" />
          <div className="p-7 sm:p-9">
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Hiring now
            </p>
            <h3 className="mt-4 text-3xl font-extrabold tracking-tight">{selected.title}</h3>
            <p className="mt-3 text-base leading-7 text-ink/75">{selected.summary}</p>
            <dl className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Experience", selected.experience],
                ["Type", selected.type],
                ["Location", selected.location],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#fff7ed] px-4 py-3">
                  <dt className="text-[0.68rem] font-bold tracking-[0.16em] text-accent uppercase">{label}</dt>
                  <dd className="mt-1 text-sm font-extrabold">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <JobList title="What you will do" items={selected.responsibilities} />
              <JobList title="What you bring" items={selected.skills} />
            </div>
            <a
              href={`mailto:${careers.email}?subject=${encodeURIComponent(`Application: ${selected.title}`)}`}
              className="btn-sheen mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              Apply for this role
              <Arrow />
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}

function JobList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-extrabold tracking-[0.16em] text-ink uppercase">{title}</h4>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-ink/75">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
