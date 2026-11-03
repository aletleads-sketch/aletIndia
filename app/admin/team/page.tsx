import type { Metadata } from "next";
import { TeamWorkspace } from "@/components/admin/team-workspace";

export const metadata: Metadata = {
  title: "Team | ALET India Admin",
};

export default function AdminTeamPage() {
  return <TeamWorkspace />;
}
