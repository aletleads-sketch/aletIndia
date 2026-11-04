import type { Metadata } from "next";
import { ClientsWorkspace } from "@/components/admin/clients-workspace";

export const metadata: Metadata = {
  title: "Clients | ALET India Admin",
};

export default function AdminClientsPage() {
  return <ClientsWorkspace />;
}
