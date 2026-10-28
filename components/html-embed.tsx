"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type HtmlEmbedProps = {
  src: string;
  title: string;
  className?: string;
  fallbackHeight?: number;
};

/**
 * Keeps our locally hosted, same-origin design embeds flush with their content.
 * This avoids visible blank space (or clipping) when the source HTML changes
 * layout at a different screen width.
 */
export function HtmlEmbed({ src, title, className, fallbackHeight = 800 }: HtmlEmbedProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  const measure = useCallback(() => {
    const document = frameRef.current?.contentDocument;
    if (!document) return;

    const nextHeight = Math.ceil(
      Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0),
    );

    if (nextHeight > 0) setHeight(nextHeight);
  }, []);

  useEffect(() => {
    const onWindowResize = () => measure();
    window.addEventListener("resize", onWindowResize);

    // The iframe can finish loading before React attaches its onLoad handler,
    // so also measure after hydration.
    const measurementTimers = [0, 150, 700, 1_500, 3_000].map((delay) =>
      window.setTimeout(measure, delay),
    );

    return () => {
      window.removeEventListener("resize", onWindowResize);
      measurementTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [measure]);

  const handleLoad = () => {
    measure();
    window.setTimeout(measure, 150);
    window.setTimeout(measure, 700);
  };

  return (
    <iframe
      ref={frameRef}
      title={title}
      src={src}
      onLoad={handleLoad}
      className={className}
      style={{ height: height ?? fallbackHeight }}
    />
  );
}
