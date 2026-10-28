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
  "bg-[#0f766e]",
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
  const framed = "framed" in study && study.framed;
  const mockup = "mockup" in study && study.mockup;
  const single = study.screens.length === 1;
  const browserPreview = landscape && study.name === "All Deliveries" && !mockup;
  return (
    <article
      className={`hover-glow overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_20px_60px_-30px_rgb(30_27_75_/_0.35)] ${className}`}
      aria-hidden={hidden || undefined}
    >
      <div
        className={`flex h-72 justify-center ${
          mockup
            ? "items-center bg-[#0d7c8c] px-3 py-4"
            : landscape
              ? `flex-col items-center gap-2 px-5 ${single ? "justify-center py-6" : "py-4"}`
              : "items-end gap-3 px-5 pt-10"
        } ${mockup ? "" : cardColors[colorIndex % cardColors.length]}`}
      >
        {mockup ? (
          <Image
            src={study.screens[0]}
            alt=""
            width={1200}
            height={700}
            draggable={false}
            className="max-h-full w-full object-contain drop-shadow-[0_16px_28px_rgb(0_0_0_/_0.28)]"
          />
        ) : landscape ? (
          <>
            <div
              className={`relative w-full overflow-hidden rounded-[1.35rem] border-[8px] border-[#161b27] bg-[#161b27] p-1.5 shadow-[0_18px_35px_-18px_rgb(0_0_0_/_0.7)] ${
                single ? "max-w-[29rem]" : "max-w-[22rem]"
              }`}
            >
              <span
                className="absolute top-[0.32rem] left-1/2 z-10 h-1.5 w-10 -translate-x-1/2 rounded-full bg-[#080b12]"
                aria-hidden="true"
              />
              {browserPreview ? (
                <div className="relative z-10 flex h-8 items-end bg-[#dfe3ea] px-2 pt-1.5">
                  <span className="flex h-6 min-w-36 items-center rounded-t-lg bg-white px-3 text-[0.55rem] font-semibold text-[#3b4352] shadow-[0_-1px_3px_rgb(0_0_0_/_0.08)]">
                    <span className="mr-1.5 h-2 w-2 rounded-full bg-[#f04438]" aria-hidden="true" />
                    Courier &amp; Logistics
                  </span>
                </div>
              ) : null}
              <div
                className={`relative overflow-hidden rounded-[0.85rem] bg-[#aab5c8] ${
                  browserPreview ? "aspect-[16/8.5] rounded-t-none" : "aspect-video"
                }`}
              >
                <Image
                  src={study.screens[0]}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 30rem"
                  draggable={false}
                  className={`object-cover ${
                    browserPreview
                      ? "scale-[1.11] -translate-y-[4.7%]"
                      : "object-center"
                  }`}
                />
              </div>
            </div>
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
              className={
                framed
                  ? "h-64 w-auto rounded-t-[1.6rem] border-[5px] border-b-0 border-night bg-white object-cover object-top shadow-[0_18px_35px_-12px_rgb(0_0_0_/_0.55)]"
                  : "h-64 w-auto"
              }
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
