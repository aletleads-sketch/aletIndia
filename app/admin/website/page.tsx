import type { Metadata } from "next";
import { WebsiteContentWorkspace } from "@/components/admin/website-content";

export const metadata: Metadata = {
  title: "Website Content | ALET India Admin",
};

export default function AdminWebsiteContentPage() {
  return <WebsiteContentWorkspace />;
}
