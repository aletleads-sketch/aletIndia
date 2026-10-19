import type { Metadata } from "next";
import { ServicePage, serviceMetadata } from "@/components/service-page";

export const metadata: Metadata = serviceMetadata("ai-data");

export default function Page() {
  return <ServicePage id="ai-data" />;
}
