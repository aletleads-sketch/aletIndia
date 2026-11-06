import type { Metadata } from "next";
import { StudioPages } from "@/components/admin/studio-pages";

export const metadata: Metadata = {
  title: "Pages | ALET India Admin",
};

export default function AdminPagesPage() {
  return <StudioPages />;
}
