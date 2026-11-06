import type { Metadata } from "next";
import { StudioBackup } from "@/components/admin/studio-backup";

export const metadata: Metadata = {
  title: "Backup | ALET India Admin",
};

export default function AdminBackupPage() {
  return <StudioBackup />;
}
