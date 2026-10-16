const samples = [
  { href: "/", label: "Main" },
  { href: "/home1", label: "1" },
  { href: "/home2", label: "2" },
  { href: "/home3", label: "3" },
] as const;

export function SampleSwitcher({ active }: { active: "main" | "1" | "2" | "3" }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-full border border-black/10 bg-white/90 p-1 shadow-[0_16px_50px_-20px_rgb(0_0_0_/_0.45)] backdrop-blur-md">
      <span className="hidden px-3 text-[0.65rem] font-bold tracking-[0.14em] text-black/45 uppercase sm:inline">
        Samples
      </span>
      {samples.map((sample) => {
        const isActive =
          (active === "main" && sample.href === "/") ||
          (active === "1" && sample.href === "/home1") ||
          (active === "2" && sample.href === "/home2") ||
          (active === "3" && sample.href === "/home3");
        return (
          <a
            key={sample.href}
            href={sample.href}
            className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
              isActive
                ? "bg-black text-white"
                : "text-black/60 hover:bg-black/5 hover:text-black"
            }`}
          >
            {sample.label}
          </a>
        );
      })}
    </div>
  );
}
