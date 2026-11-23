import type { Metadata } from "next";
import { ServicePage, serviceMetadata } from "@/components/service-page";
import { withSeoOverrides } from "@/lib/seo-overrides";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverrides("/cross-functional-application", await serviceMetadata("cross-platform"));
}

export default function Page() {
  return <ServicePage id="cross-platform" />;
}
