import { getPublishedFaqs, type CmsFaq } from "@/lib/cms-client";

/** `faqs.topic` values the website reads. */
export type FaqTopic = "home" | "contact";

let faqs: Promise<CmsFaq[]> | null = null;

/**
 * Published FAQs for one part of the site, in CMS sort order. Like blogs, read once per
 * production build (a CMS change goes live with the next deploy) and fresh in `next dev`.
 */
export async function getFaqs(topic: FaqTopic) {
  const load = () => getPublishedFaqs();
  const rows = process.env.NODE_ENV !== "production" ? await load() : await (faqs ??= load());
  return rows.filter((faq) => (faq.topic ?? "").trim().toLowerCase() === topic);
}
