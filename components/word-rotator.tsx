"use client";

import { useEffect, useState } from "react";

export function WordRotator({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % words.length),
      2400,
    );
    return () => window.clearInterval(id);
  }, [words.length]);

  return (
    <span className="relative inline-block" aria-live="polite">
      <span key={words[index]} className="word-in text-gradient">
        {words[index]}
      </span>
    </span>
  );
}
