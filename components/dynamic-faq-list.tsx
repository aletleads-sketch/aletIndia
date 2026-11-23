"use client";

import { type ReactNode, useEffect, useState } from "react";
import { getPublishedFaqs, type CmsFaq } from "@/lib/cms-client";

export function DynamicFaqList({ fallback }: { fallback: ReactNode }) {
  const [faqs, setFaqs] = useState<CmsFaq[] | null>(null);
  useEffect(() => { getPublishedFaqs().then(setFaqs).catch(() => setFaqs([])); }, []);
  if (!faqs?.length) return <>{fallback}</>;
  return <ul className="space-y-3">{faqs.map((faq) => <li key={faq.id}><details className="group rounded-2xl border border-line bg-white px-6 py-5 transition open:shadow-[0_20px_50px_-30px_rgb(30_27_75_/_0.4)]"><summary className="flex cursor-pointer items-center justify-between gap-6 text-base font-bold">{faq.question}<span className="faq-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-lg text-brand transition duration-300 group-open:bg-brand group-open:text-white">+</span></summary><p className="mt-4 text-sm leading-7 text-muted">{faq.answer}</p></details></li>)}</ul>;
}
