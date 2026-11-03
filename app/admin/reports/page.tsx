import type { Metadata } from "next";
import { ReportsWorkspace } from "@/components/admin/reports-workspace";

export const metadata: Metadata = {
  title: "Reports | ALET India Admin",
};

export default function AdminReportsPage() {
  return <ReportsWorkspace />;
}
