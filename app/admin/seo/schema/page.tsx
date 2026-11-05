import type { Metadata } from "next";
import { SeoSchemaWorkspace } from "@/components/admin/seo-schema";

export const metadata: Metadata = {
  title: "Schema Markup | ALET India Admin",
};

export default function AdminSeoSchemaPage() {
  return <SeoSchemaWorkspace />;
}
