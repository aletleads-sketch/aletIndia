import type { Metadata } from "next";
import { SeoDashboardWorkspace } from "@/components/admin/seo-dashboard";

export const metadata: Metadata = {
  title: "SEO Dashboard | ALET India Admin",
};

export default function AdminSeoDashboardPage() {
  return <SeoDashboardWorkspace />;
}
