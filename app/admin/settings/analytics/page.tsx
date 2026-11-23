import type { Metadata } from "next";
import { StudioAnalytics } from "@/components/admin/studio-analytics";

export const metadata: Metadata = {
  title: "Analytics | ALET India Admin",
};

export default function AdminAnalyticsPage() {
  return <StudioAnalytics />;
}
