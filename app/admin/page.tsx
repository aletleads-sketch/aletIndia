"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** The admin opens on Leads until the Dashboard is built. */
export default function AdminPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/leads");
  }, [router]);
  return null;
}
