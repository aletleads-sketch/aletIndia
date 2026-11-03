"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CMS_SECTIONS } from "@/lib/cms-sections";

/** /admin/content opens the first CMS section. */
export default function AdminContentPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/admin/content/${CMS_SECTIONS[0].slug}`);
  }, [router]);
  return null;
}
