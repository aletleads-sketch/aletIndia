import Image from "next/image";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Image
      src={light ? "/images/logo-white.png" : "/images/logo-dark.png"}
      alt="ALET India, Inspired by Technology"
      width={322}
      height={90}
      priority
      className="h-[4.025rem] w-auto sm:h-[4.6rem]"
    />
  );
}
