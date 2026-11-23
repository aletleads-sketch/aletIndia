import type { Metadata } from "next";
import { StudioActivity } from "@/components/admin/studio-activity";

export const metadata: Metadata = {
  title: "All Activity | ALET India Admin",
};

export default function AdminActivityPage() {
  return <StudioActivity />;
}
