"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({ value }: { value: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    let started = false;

    const run = () => {
      if (started) return;
      started = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setCurrent(value);
        return;
      }
      const start = performance.now();
      const duration = 2800;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - progress) ** 3;
        setCurrent(Math.round(value * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        run();
        observer.disconnect();
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <span ref={ref}>{current.toLocaleString("en-IN")}</span>;
}
