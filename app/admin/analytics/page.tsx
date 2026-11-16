import type { Metadata } from "next";
import { VisitorAnalyticsWorkspace } from "@/components/admin/visitor-analytics";

export const metadata: Metadata = {
  title: "Visitor Analytics | ALET India Admin",
};

export default function AdminVisitorAnalyticsPage() {
  return <VisitorAnalyticsWorkspace />;
}
