import type { Metadata } from "next";
import { ServicePage, serviceMetadata } from "@/components/service-page";
import { withSeoOverrides } from "@/lib/seo-overrides";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverrides("/mobile-app-development", await serviceMetadata("mobile-apps"));
}

export default function Page() {
  return <ServicePage id="mobile-apps" />;
}
