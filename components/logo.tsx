"use client";

import Image from "next/image";
import { useSiteContent } from "@/components/site-content-provider";

/** The site logo: the dark one on light backgrounds, the white one on dark (both set in Site Settings). */
export function Logo({ light = false }: { light?: boolean }) {
  const { brand } = useSiteContent();
  return (
    <Image
      src={light ? brand.logoLight : brand.logo}
      alt="ALET India, Inspired by Technology"
      width={322}
      height={90}
      priority
      className="h-[4.025rem] w-auto object-contain sm:h-[4.6rem]"
    />
  );
}
