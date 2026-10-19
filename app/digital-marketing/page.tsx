import type { Metadata } from "next";
import { ServicePage, serviceMetadata } from "@/components/service-page";

export const metadata: Metadata = serviceMetadata("digital-marketing");

export default function Page() {
  return <ServicePage id="digital-marketing" />;
}
