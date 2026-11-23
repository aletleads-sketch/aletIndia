import type { Metadata } from "next";
import { SeoMetaTagsWorkspace } from "@/components/admin/seo-meta-tags";

export const metadata: Metadata = {
  title: "Meta Tags | ALET India Admin",
};

export default function AdminSeoMetaTagsPage() {
  return <SeoMetaTagsWorkspace />;
}
