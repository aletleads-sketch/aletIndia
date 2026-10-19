"use client";

import { useEffect, useRef } from "react";
import { CaseStudyCard } from "@/components/case-study-card";
import { caseStudies } from "@/lib/content";

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
        {loop.map((study, i) => (
          <CaseStudyCard
            key={`${study.name}-${i}`}
            study={study}
            colorIndex={i % caseStudies.length}
            hidden={i >= caseStudies.length}
            className={`w-[82vw] shrink-0 sm:w-[32rem] xl:w-[36rem] ${
              (i % caseStudies.length) % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
