"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { BASE_PATH } from "@/lib/site-path";

/** Shown on the website while an editor previews unpublished content from the admin. */
export function PreviewBar() {
  const pathname = usePathname();
  const [leaving, setLeaving] = useState(false);
  if (pathname?.startsWith("/admin")) return null;
  const exit = async () => {
    setLeaving(true);
    await fetch(`${BASE_PATH}/api/content/preview`, { method: "DELETE" }).catch(() => null);
    window.location.reload();
  };
  return (
    <div role="status" className="fixed inset-x-0 bottom-0 z-[100] flex flex-wrap items-center justify-center gap-3 bg-[#111827] px-4 py-2.5 text-sm text-white shadow-[0_-4px_20px_rgba(0,0,0,0.25)]">
      <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold tracking-wide text-[#111827] uppercase">Preview</span>
      <span>You are seeing drafts and unpublished changes. Visitors do not see them.</span>
      <button type="button" onClick={() => void exit()} disabled={leaving} className="rounded-lg border border-white/30 px-3 py-1 font-semibold hover:bg-white/10 disabled:opacity-60">
        {leaving ? "Leaving…" : "Exit preview"}
      </button>
    </div>
  );
}
