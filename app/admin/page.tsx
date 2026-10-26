import type { Metadata } from "next";
import { assetPath } from "@/lib/site-path";

export const metadata: Metadata = {
  title: "ALET India | Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#08091b]">
      <iframe
        title="ALET India CMS and lead dashboard"
        src={assetPath("/cms-admin.html")}
        className="h-full w-full border-0"
      />
    </div>
  );
}
