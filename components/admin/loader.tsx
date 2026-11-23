/** A small spinning ring for loading states in the admin. */
export function Spinner({ className = "h-5 w-5", light = false }: { className?: string; light?: boolean }) {
  const colors = light ? "border-white/30 border-t-white" : "border-[#1a63e8]/20 border-t-[#1a63e8]";
  return <span className={`inline-block shrink-0 animate-spin rounded-full border-2 ${colors} ${className}`} aria-hidden="true" />;
}

/** Centered spinner with a line of text, for a panel whose data is still loading. */
export function Loader({ label = "Loading…", className = "py-12" }: { label?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-sm text-[#5b6b85] ${className}`} role="status" aria-live="polite">
      <Spinner className="h-8 w-8" />
      <span>{label}</span>
    </div>
  );
}

/** Spinner, text and a thin progress bar, for work that runs over many items. */
export function ProgressLoader({ label, done, total }: { label: string; done: number; total: number }) {
  const percent = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return (
    <div className="px-4 py-3" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm text-[#4a5a75]">
        <Spinner className="h-4 w-4" />
        <span className="mr-auto">{label}</span>
        {total ? (
          <span className="font-semibold tabular-nums">
            {done} of {total}
          </span>
        ) : null}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e6ebf3]">
        <div className={`h-full rounded-full bg-[#1a63e8] transition-[width] duration-300 ${total ? "" : "w-1/3 animate-pulse"}`} style={total ? { width: `${percent}%` } : undefined} />
      </div>
    </div>
  );
}
