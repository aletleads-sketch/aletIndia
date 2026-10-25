import type { Metadata } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "ALET India | Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#08091b]">
      <iframe
        title="ALET India CMS and lead dashboard"
        src={`${basePath}/cms-admin.html`}
        className="h-full w-full border-0"
      />
    </div>
  );
}
