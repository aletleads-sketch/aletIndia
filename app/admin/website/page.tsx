import type { Metadata } from "next";
import { WebsiteContentWorkspace } from "@/components/admin/website-content";

export const metadata: Metadata = {
  title: "Edit page | ALET India Admin",
};

export default async function AdminWebsiteContentPage({ searchParams }: { searchParams: Promise<{ page?: string; section?: string }> }) {
  const { page, section } = await searchParams;
  return <WebsiteContentWorkspace key={page ?? "/"} initialPage={page ?? "/"} initialSection={section} />;
}
