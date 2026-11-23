import type { Metadata } from "next";
import { SeoRedirectsWorkspace } from "@/components/admin/seo-redirects";

export const metadata: Metadata = {
  title: "Redirects | ALET India Admin",
};

export default function AdminSeoRedirectsPage() {
  return <SeoRedirectsWorkspace />;
}
