import type { Metadata } from "next";
import { ServicePage, serviceMetadata } from "@/components/service-page";

export const metadata: Metadata = serviceMetadata("web-apps");

export default function Page() {
  return <ServicePage id="web-apps" />;
}
