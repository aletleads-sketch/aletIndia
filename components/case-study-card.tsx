import Image from "next/image";
import { caseStudies } from "@/lib/content";

export const cardColors = [
  "bg-[#5b4bdb]",
  "bg-[#0e7490]",
  "bg-[#c2410c]",
  "bg-[#1d4ed8]",
  "bg-[#ea580c]",
  "bg-[#be185d]",
  "bg-[#7c3aed]",
  "bg-[#14532d]",
  "bg-[#b45309]",
];

export function CaseStudyCard({
  study,
  colorIndex,
  className = "",
  hidden = false,
}: {
  study: (typeof caseStudies)[number];
  colorIndex: number;
  className?: string;
  hidden?: boolean;
}) {
  const landscape = "landscape" in study && study.landscape;
  return (
    <article
      className={`hover-glow overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_20px_60px_-30px_rgb(30_27_75_/_0.35)] ${className}`}
      aria-hidden={hidden || undefined}
    >
      <div
        className={`flex h-72 justify-center px-5 ${
          landscape ? "flex-col items-center gap-2 py-4" : "items-end gap-3 pt-10"
        } ${cardColors[colorIndex % cardColors.length]}`}
      >
        {landscape ? (
          <>
            <Image
              src={study.screens[0]}
              alt=""
              width={960}
              height={540}
              draggable={false}
              className="h-auto max-h-32 w-full rounded-xl object-cover shadow-[0_12px_28px_-16px_rgb(0_0_0_/_0.45)]"
            />
            {study.screens.length > 1 ? (
              <div className="flex items-end justify-center gap-2">
                {study.screens.slice(1).map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={280}
                    height={560}
                    draggable={false}
                    className="h-36 w-auto drop-shadow-[0_12px_20px_rgb(0_0_0_/_0.35)]"
                  />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          study.screens.map((src) => (
            <Image
              key={src}
              src={src}
              alt=""
              width={280}
              height={560}
              draggable={false}
              className="h-64 w-auto"
            />
          ))
        )}
      </div>
      <div className="bg-white p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white p-1.5">
            <Image
              src={study.logo}
              alt=""
              width={60}
              height={60}
              draggable={false}
              className="max-h-7 w-auto object-contain"
            />
          </span>
          <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">
            {study.category}
          </p>
        </div>
        <h3 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{study.name}</h3>
        <p className="mt-4 text-sm leading-7 text-muted sm:text-base">{study.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {study.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
