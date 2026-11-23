import type { Metadata } from "next";
import { WebsiteContentWorkspace } from "@/components/admin/website-content";

export const metadata: Metadata = {
  title: "Site Settings | ALET India Admin",
};

export default function AdminSettingsPage() {
  return <WebsiteContentWorkspace settings />;
}
