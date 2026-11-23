import type { Metadata } from "next";
import { SeoSettingsWorkspace } from "@/components/admin/seo-settings";

export const metadata: Metadata = {
  title: "SEO Settings | ALET India Admin",
};

export default function AdminSeoSettingsPage() {
  return <SeoSettingsWorkspace />;
}
