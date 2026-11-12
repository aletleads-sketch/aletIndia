import type { Metadata } from "next";
import { SeoKeywordsWorkspace } from "@/components/admin/seo-keywords";

export const metadata: Metadata = {
  title: "Keywords Tracking | ALET India Admin",
};

export default function AdminSeoKeywordsPage() {
  return <SeoKeywordsWorkspace />;
}
