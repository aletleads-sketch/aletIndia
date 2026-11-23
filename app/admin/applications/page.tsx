import type { Metadata } from "next";
import { ApplicationsWorkspace } from "@/components/admin/applications-workspace";

export const metadata: Metadata = {
  title: "Job applications | ALET India Admin",
};

export default function AdminApplicationsPage() {
  return <ApplicationsWorkspace />;
}
