"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { caseStudies } from "@/lib/content";

const cardColors = [
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

const SPEED = 0.35; // px per frame ~ slow continuous scroll

export function PortfolioSlider() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<number | null>(null);
  const halfWidthRef = useRef(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const measure = () => {
      halfWidthRef.current = scroller.scrollWidth / 2;
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(scroller);

    let frame = 0;
    const tick = () => {
      if (!pausedRef.current && halfWidthRef.current > 0) {
        scroller.scrollLeft += SPEED;
        if (scroller.scrollLeft >= halfWidthRef.current) {
          scroller.scrollLeft -= halfWidthRef.current;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const pause = () => {
      pausedRef.current = true;
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    };
    const scheduleResume = () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
      resumeTimer.current = window.setTimeout(() => {
        pausedRef.current = false;
      }, 2200);
    };

    const onWheel = () => {
      pause();
      scheduleResume();
    };
    const onScroll = () => {
      const half = halfWidthRef.current;
      if (half <= 0) return;
      if (scroller.scrollLeft >= half) {
        scroller.scrollLeft -= half;
      } else if (scroller.scrollLeft <= 0) {
        scroller.scrollLeft += half;
      }
    };

    let dragging = false;
    let dragStartX = 0;
    let dragScrollLeft = 0;

    const onPointerDown = (event: PointerEvent) => {
      pause();
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      dragStartX = event.clientX;
      dragScrollLeft = scroller.scrollLeft;
      scroller.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      scroller.scrollLeft = dragScrollLeft - (event.clientX - dragStartX);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (dragging) {
        dragging = false;
        try {
          scroller.releasePointerCapture(event.pointerId);
        } catch {
          /* already released */
        }
      }
      scheduleResume();
    };

    scroller.addEventListener("wheel", onWheel, { passive: true });
    scroller.addEventListener("pointerdown", onPointerDown);
    scroller.addEventListener("pointermove", onPointerMove);
    scroller.addEventListener("pointerup", onPointerUp);
    scroller.addEventListener("pointercancel", onPointerUp);
    scroller.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
      scroller.removeEventListener("wheel", onWheel);
      scroller.removeEventListener("pointerdown", onPointerDown);
      scroller.removeEventListener("pointermove", onPointerMove);
      scroller.removeEventListener("pointerup", onPointerUp);
      scroller.removeEventListener("pointercancel", onPointerUp);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, []);

  const loop = [...caseStudies, ...caseStudies];

  return (
    <div
      ref={scrollerRef}
      className="work-scroller mt-10 cursor-grab overflow-x-auto overscroll-x-contain pb-4 active:cursor-grabbing"
      aria-label="Portfolio projects"
    >
      <div className="flex w-max gap-7 px-[clamp(1.25rem,4vw,3.5rem)] py-5 xl:px-12">
        {loop.map((study, i) => {
          const colorIndex = i % caseStudies.length;
          const landscape = "landscape" in study && study.landscape;
          return (
            <article
              key={`${study.name}-${i}`}
              className={`hover-glow w-[82vw] shrink-0 overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_20px_60px_-30px_rgb(30_27_75_/_0.35)] sm:w-[32rem] xl:w-[36rem] ${
                colorIndex % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"
              }`}
              aria-hidden={i >= caseStudies.length}
            >
              <div
                className={`flex h-72 justify-center gap-3 px-5 ${
                  landscape ? "items-center py-6" : "items-end pt-10"
                } ${cardColors[colorIndex % cardColors.length]}`}
              >
                {study.screens.map((src) => (
                  <Image
                    key={`${src}-${i}`}
                    src={src}
                    alt=""
                    width={landscape ? 960 : 280}
                    height={landscape ? 540 : 560}
                    draggable={false}
                    className={
                      landscape
                        ? "h-auto max-h-60 w-full rounded-xl object-cover shadow-[0_18px_40px_-20px_rgb(0_0_0_/_0.45)]"
                        : "h-64 w-auto"
                    }
                  />
                ))}
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
                <h3 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {study.name}
                </h3>
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
        })}
      </div>
    </div>
  );
}
