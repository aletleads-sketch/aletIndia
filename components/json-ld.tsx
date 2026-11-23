import { jsonLd } from "@/lib/seo";

/** Renders structured data for Google. Pass the objects that are switched on; empty renders nothing. */
export function JsonLd({ items }: { items: Record<string, unknown>[] }) {
  return items.map((data, index) => (
    <script key={`${String(data["@type"])}-${index}`} type="application/ld+json" dangerouslySetInnerHTML={jsonLd(data)} />
  ));
}
