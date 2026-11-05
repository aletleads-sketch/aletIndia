import type { Metadata } from "next";
import { ServicePage, serviceMetadata } from "@/components/service-page";
import { withSeoOverrides } from "@/lib/seo-overrides";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverrides("/ai-data-solutions", await serviceMetadata("ai-data"));
}

export default function Page() {
  return <ServicePage id="ai-data" />;
}
