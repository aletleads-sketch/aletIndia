import type { Metadata } from "next";
import { WebsiteListsWorkspace } from "@/components/admin/website-lists";

export const metadata: Metadata = {
  title: "Website Lists | ALET India Admin",
};

export default async function AdminWebsiteListsPage({ searchParams }: { searchParams: Promise<{ list?: string }> }) {
  const { list } = await searchParams;
  return <WebsiteListsWorkspace initialTable={list} />;
}
