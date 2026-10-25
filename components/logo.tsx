import Image from "next/image";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Image
      src="/images/alet-india-logo.png"
      alt="ALET India, Inspired by Technology"
      width={1010}
      height={250}
      priority
      className={`h-[3.45rem] w-auto rounded-lg ${light ? "bg-white/95 px-2 py-1.5" : ""} sm:h-[4rem]`}
    />
  );
}
