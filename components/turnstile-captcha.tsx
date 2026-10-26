"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Cloudflare Turnstile only exposes its public site key in the browser. The
 * matching secret is kept in the Supabase Edge Function, where each token is
 * verified before a lead is saved.
 */
export function TurnstileCaptcha({
  onTokenChange,
}: {
  onTokenChange: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!siteKey) return;

    let active = true;
    const renderWidget = () => {
      if (!active || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "light",
        callback: (token) => onTokenChange(token),
        "expired-callback": () => onTokenChange(""),
        "error-callback": () => {
          onTokenChange("");
          setLoadError(true);
        },
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile-api="true"]',
    );
    const script = existingScript ?? document.createElement("script");
    if (!existingScript) {
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.turnstileApi = "true";
      document.head.appendChild(script);
    }

    script.addEventListener("load", renderWidget);
    script.addEventListener("error", () => setLoadError(true));
    renderWidget();

    return () => {
      active = false;
      script.removeEventListener("load", renderWidget);
      if (widgetIdRef.current) window.turnstile?.remove?.(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [onTokenChange]);

  if (!siteKey) {
    return (
      <div className="rounded-2xl border border-dashed border-[#cbd3e1] bg-white px-5 py-4 text-sm text-[#586178]">
        Spam protection is ready to be enabled. Add the Turnstile site key to show the CAPTCHA here.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div ref={containerRef} />
      {loadError ? (
        <p role="alert" className="text-sm text-red-700">
          CAPTCHA could not load. Please refresh the page and try again.
        </p>
      ) : null}
    </div>
  );
}
