"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BASE_PATH } from "@/lib/site-path";

type Phase = "idle" | "loading" | "done";

/** Strips basePath and trailing slash so DOM hrefs compare with usePathname(). */
function routePath(pathname: string) {
  let path = pathname;
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) path = path.slice(BASE_PATH.length);
  path = path.replace(/\/+$/, "");
  return path || "/";
}

/**
 * Global top progress bar. Starts the instant any internal link is clicked
 * (header, footer, cards, mobile menu) and completes once the new route renders,
 * so a click always gives visible feedback even while the next page loads.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<{ phase: Phase; from: string | null }>({ phase: "idle", from: null });
  const pathnameRef = useRef(pathname);
  const safetyTimer = useRef<number | undefined>(undefined);

  // The route changed since the click: finish the bar (state adjusted during render, not in an effect).
  if (state.phase === "loading" && state.from !== pathname) setState({ phase: "done", from: null });

  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || !/^https?:$/.test(url.protocol)) return;

      if (routePath(url.pathname) === routePath(window.location.pathname)) {
        // Clicking the page you're already on: scroll to top so the click still does something visible.
        if (!url.hash && url.search === window.location.search) window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setState({ phase: "loading", from: pathnameRef.current });
      // Safety net in case navigation is cancelled or fails.
      window.clearTimeout(safetyTimer.current);
      safetyTimer.current = window.setTimeout(() => setState((current) => (current.phase === "loading" ? { phase: "done", from: null } : current)), 12000);
    };
    document.addEventListener("click", onClick, true);
    return () => { document.removeEventListener("click", onClick, true); window.clearTimeout(safetyTimer.current); };
  }, []);

  useEffect(() => {
    if (state.phase !== "done") return;
    const id = window.setTimeout(() => setState((current) => (current.phase === "done" ? { phase: "idle", from: null } : current)), 450);
    return () => window.clearTimeout(id);
  }, [state.phase]);

  return (
    <div aria-hidden="true" className={`nav-progress ${state.phase === "loading" ? "is-loading" : state.phase === "done" ? "is-done" : ""}`}>
      <span className="nav-progress-bar" />
    </div>
  );
}
