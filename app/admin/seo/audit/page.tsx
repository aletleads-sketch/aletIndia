import type { Metadata } from "next";
import { SeoAuditWorkspace } from "@/components/admin/seo-audit";

export const metadata: Metadata = {
  title: "SEO Audit | ALET India Admin",
};

export default function AdminSeoAuditPage() {
  return <SeoAuditWorkspace />;
}
