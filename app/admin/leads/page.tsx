import type { Metadata } from "next";
import { LeadsWorkspace } from "@/components/admin/leads-workspace";

export const metadata: Metadata = {
  title: "Leads | ALET India Admin",
};

export default function AdminLeadsPage() {
  return <LeadsWorkspace />;
}
