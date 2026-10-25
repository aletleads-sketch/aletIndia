"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { getPublishedProjects, type CmsProject, typeLabel } from "@/lib/cms-client";

type Filter = "All" | "Mobile Apps" | "Web" | "Games";

function ProjectCard({ project }: { project: CmsProject }) {
  return (
    <article className="group overflow-hidden rounded-[1.7rem] bg-white ring-1 ring-line shadow-[0_18px_45px_-30px_rgb(15_23_42_/_0.4)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-night">
        {project.cover_image_url ? (
          <img src={project.cover_image_url} alt={project.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="hero-mesh flex h-full items-end p-7"><span className="text-3xl font-extrabold text-white">{project.name}</span></div>
        )}
        <span className="absolute top-4 left-4 rounded-full bg-night/75 px-3 py-1 text-[0.65rem] font-bold tracking-[0.14em] text-white uppercase backdrop-blur">{typeLabel(project.project_type)}</span>
      </div>
      <div className="p-6">
        <p className="text-xs font-bold tracking-[0.13em] text-brand uppercase">{project.industry || "Featured project"}</p>
        <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">{project.name}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{project.summary}</p>
        {project.platforms.length ? <ul className="mt-5 flex flex-wrap gap-2">{project.platforms.map((platform) => <li key={platform} className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-ink/75">{platform}</li>)}</ul> : null}
      </div>
    </article>
  );
}

export function DynamicPortfolioGrid({ fallback, serviceSlug }: { fallback: ReactNode; serviceSlug?: string }) {
  const [projects, setProjects] = useState<CmsProject[] | null>(null);
  const [active, setActive] = useState<Filter>("All");

  useEffect(() => {
    let cancelled = false;
    getPublishedProjects().then((items) => {
      if (!cancelled) setProjects(serviceSlug ? items.filter((item) => item.service_slugs.includes(serviceSlug)) : items);
    }).catch(() => { if (!cancelled) setProjects([]); });
    return () => { cancelled = true; };
  }, [serviceSlug]);

  const filtered = useMemo(() => projects?.filter((project) => active === "All" || typeLabel(project.project_type) === active) ?? [], [active, projects]);
  if (!projects?.length) return <>{fallback}</>;
  const filters: Filter[] = ["All", "Mobile Apps", "Web", "Games"];

  return (
    <>
      {!serviceSlug ? <div role="tablist" aria-label="Filter projects" className="flex flex-wrap gap-2">{filters.map((filter) => { const count = filter === "All" ? projects.length : projects.filter((project) => typeLabel(project.project_type) === filter).length; return <button key={filter} type="button" role="tab" aria-selected={active === filter} onClick={() => setActive(filter)} className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${active === filter ? "bg-brand-gradient text-white shadow-[0_12px_30px_-12px_rgb(79_70_229_/_0.8)]" : "bg-white text-ink ring-1 ring-line hover:text-brand"}`}>{filter}<span className={`rounded-full px-2 py-0.5 text-[0.7rem] ${active === filter ? "bg-white/20" : "bg-surface text-muted"}`}>{count}</span></button>; })}</div> : null}
      <ul className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">{filtered.map((project) => <li key={project.id} className="scale-in"><ProjectCard project={project} /></li>)}</ul>
    </>
  );
}
