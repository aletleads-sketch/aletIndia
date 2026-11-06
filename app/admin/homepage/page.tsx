import type { Metadata } from "next";
import { WebsiteContentWorkspace } from "@/components/admin/website-content";

export const metadata: Metadata = {
  title: "Homepage | ALET India Admin",
};

export default async function AdminHomepagePage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const { section } = await searchParams;
  return <WebsiteContentWorkspace initialPage="/" initialSection={section} fixedPage />;
}
