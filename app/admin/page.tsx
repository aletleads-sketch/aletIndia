"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { StudioDashboard } from "@/components/admin/studio-dashboard";
import { CONTENT_ROLES } from "@/lib/content-admin";

/** Content staff open on the Content Studio dashboard; sales open on their leads. */
export default function AdminPage() {
  const { profile } = useAdmin();
  const router = useRouter();
  const content = CONTENT_ROLES.has(profile.role);
  useEffect(() => {
    if (!content) router.replace("/admin/leads");
  }, [content, router]);
  return content ? <StudioDashboard /> : null;
}
