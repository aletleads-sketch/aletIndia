"use client";

import { useEffect } from "react";

/** Immediate client redirect for static-export hosts that cannot emit HTTP 308. */
export function PermanentClientRedirect({ href }: { href: string }) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <meta httpEquiv="refresh" content={`0;url=${href}`} />
  );
}
