"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CMS_SECTIONS } from "@/lib/cms-sections";
import { assetPath } from "@/lib/site-path";

const CMS_BACKGROUND = "#08091b";

function viewFor(pathname: string | null) {
  const slug = pathname?.split("/admin/content/")[1]?.split("/")[0];
  return (CMS_SECTIONS.find((section) => section.slug === slug) ?? CMS_SECTIONS[0]).view;
}

/**
 * One CMS iframe shared by every /admin/content/<section> page. It loads once; picking another
 * section tells it which view to show (postMessage) instead of reloading, so there's no blank flash.
 */
export default function AdminContentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const view = viewFor(pathname);
  const frame = useRef<HTMLIFrameElement>(null);
  const [initialView] = useState(view);
  const [loaded, setLoaded] = useState(false);
  const shownView = useRef(initialView);

  useEffect(() => {
    if (!loaded || view === shownView.current) return;
    shownView.current = view;
    frame.current?.contentWindow?.postMessage({ type: "cms:view", view }, window.location.origin);
  }, [loaded, view]);

  return (
    <div className="relative flex min-h-0 flex-1" style={{ background: CMS_BACKGROUND }}>
      <iframe
        ref={frame}
        title="ALET India website content manager"
        src={assetPath(`/cms-admin.html?embed=1&view=${initialView}`)}
        onLoad={() => setLoaded(true)}
        className={`h-full w-full flex-1 border-0 transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ background: CMS_BACKGROUND, colorScheme: "dark" }}
      />
      {!loaded ? (
        <div className="absolute inset-0 grid place-items-center text-sm text-[#9fa1b5]">Loading…</div>
      ) : null}
      {children}
    </div>
  );
}
