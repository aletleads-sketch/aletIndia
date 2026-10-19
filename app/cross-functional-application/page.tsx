import type { Metadata } from "next";
import { ServicePage, serviceMetadata } from "@/components/service-page";

export const metadata: Metadata = serviceMetadata("cross-platform");

export default function Page() {
  return <ServicePage id="cross-platform" />;
}
