import type { Metadata } from "next";
import { SeoRankingsWorkspace } from "@/components/admin/seo-rankings";

export const metadata: Metadata = {
  title: "Ranking Monitor | ALET India Admin",
};

export default function AdminSeoRankingsPage() {
  return <SeoRankingsWorkspace />;
}
