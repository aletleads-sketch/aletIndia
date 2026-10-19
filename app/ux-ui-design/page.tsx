import type { Metadata } from "next";
import { ServicePage, serviceMetadata } from "@/components/service-page";

export const metadata: Metadata = serviceMetadata("ui-design");

export default function Page() {
  return <ServicePage id="ui-design" />;
}
