import type { Metadata } from "next";
import { ServicePage, serviceMetadata } from "@/components/service-page";

export const metadata: Metadata = serviceMetadata("salesforce");

export default function Page() {
  return <ServicePage id="salesforce" />;
}
