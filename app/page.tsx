import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { canonical } from "@/lib/seo";
import { withSeoOverrides } from "@/lib/seo-overrides";
import { JsonLd } from "@/components/json-ld";
import { loadSiteContent } from "@/lib/site-content";
import { loadSchemaSettings } from "@/lib/seo-schema";
import { faqSchema } from "@/lib/seo-schema-shared";

const baseMetadata: Metadata = { alternates: canonical("/") };

export function generateMetadata() {
  return withSeoOverrides("/", baseMetadata);
}

export default async function Home() {
  const [schema, { faqs }] = await Promise.all([loadSchemaSettings(), loadSiteContent()]);
  return (
    <>
      <JsonLd items={schema.faq.enabled ? [faqSchema(faqs)] : []} />
      <HomePage />
    </>
  );
}
