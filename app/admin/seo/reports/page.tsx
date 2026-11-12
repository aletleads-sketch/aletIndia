import type { Metadata } from "next";
import { SeoReportsWorkspace } from "@/components/admin/seo-reports";

export const metadata: Metadata = {
  title: "SEO Reports | ALET India Admin",
};

export default function AdminSeoReportsPage() {
  return <SeoReportsWorkspace />;
}
