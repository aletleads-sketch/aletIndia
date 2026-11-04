"use client";

import { useEffect, useRef } from "react";
import { getYearsOfExperience } from "@/lib/content";

const format = (n: number) => n.toLocaleString("en-IN");

// The page is built ahead of time, so the year can roll over before the next build.
// suppressHydrationWarning lets the visitor's clock win without a React warning.
export function YearsCountUp() {
  return <CountUp value={getYearsOfExperience()} />;
}

export function YearsSinceFounding() {
  return <span suppressHydrationWarning>{getYearsOfExperience()}+</span>;
}

/**
 * Renders the real number in the HTML, so search engines and no-JS readers see it.
 * When the number starts off-screen it resets to 0 and counts up as it scrolls in.
 */
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visible = node.getBoundingClientRect().top < window.innerHeight;
    if (reduced || visible) {
      node.textContent = format(value);
      return;
    }

    node.textContent = "0";
    let frame = 0;
    const run = () => {
      const start = performance.now();
      const duration = 2800;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        node.textContent = format(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        run();
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} suppressHydrationWarning>
      {format(value)}
    </span>
  );
}
