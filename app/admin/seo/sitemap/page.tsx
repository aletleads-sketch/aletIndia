import type { Metadata } from "next";
import { SeoSitemapWorkspace } from "@/components/admin/seo-sitemap";

export const metadata: Metadata = {
  title: "Sitemap & Robots | ALET India Admin",
};

export default function AdminSeoSitemapPage() {
  return <SeoSitemapWorkspace />;
}
