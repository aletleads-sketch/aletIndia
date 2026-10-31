"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { InquireForm } from "@/components/inquire-form";

type InquireModalContextValue = {
  openInquire: () => void;
  closeInquire: () => void;
};

const InquireModalContext = createContext<InquireModalContextValue | null>(null);

export function useInquireModal() {
  const value = useContext(InquireModalContext);
  if (!value) {
    throw new Error("useInquireModal must be used within InquireModalProvider");
  }
  return value;
}

export function InquireModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openInquire = useCallback(() => setOpen(true), []);
  const closeInquire = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ openInquire, closeInquire }), [openInquire, closeInquire]);

  return (
    <InquireModalContext.Provider value={value}>
      {children}
      {open ? <InquireModal onClose={closeInquire} /> : null}
    </InquireModalContext.Provider>
  );
}

export function InquireNowButton({
  className,
  children = "Inquire Now",
  onClick,
}: {
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}) {
  const { openInquire } = useInquireModal();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onClick?.();
        openInquire();
      }}
    >
      {children}
    </button>
  );
}

function InquireModal({ onClose }: { onClose: () => void }) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="Close inquiry form"
        onClick={onClose}
        className="absolute inset-0 bg-night/65 backdrop-blur-sm"
      />
      <div className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-[0_28px_100px_-20px_rgb(6_10_31_/_0.55)] sm:max-h-[90vh] sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-5 border-b border-line px-5 py-5 sm:px-8">
          <div>
            <p className="text-[0.68rem] font-extrabold tracking-[0.16em] text-brand uppercase">
              Contact us
            </p>
            <h2 id={titleId} className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Have an idea? Let&apos;s turn it into reality.
            </h2>
            <p className="mt-1 text-sm text-muted">
              Tell us about your project, budget, and timeline. We&apos;ll get back with next steps.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-xl text-ink transition hover:bg-surface"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
          <InquireForm />
        </div>
      </div>
    </div>
  );
}
