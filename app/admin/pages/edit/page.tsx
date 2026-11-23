import type { Metadata } from "next";
import { CustomPageEditor } from "@/components/admin/custom-page-editor";

export const metadata: Metadata = {
  title: "Edit Page | ALET India Admin",
};

export default async function AdminCustomPageEdit({ searchParams }: { searchParams: Promise<{ path?: string }> }) {
  const { path = "" } = await searchParams;
  return <CustomPageEditor key={path} path={path} />;
}
