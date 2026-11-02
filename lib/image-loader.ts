import { assetPath } from "@/lib/site-path";

type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

/** Pre-rendered widths for `/images/blogs/hd/*.webp` (the bare file is the 3840px master). */
const HD_WIDTHS = [960, 1920] as const;

export default function imageLoader({ src, width }: ImageLoaderProps) {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/images/blogs/hd/") && src.endsWith(".webp")) {
    const variant = HD_WIDTHS.find((size) => size >= width);
    if (variant) return assetPath(src.replace(/\.webp$/, `-${variant}.webp`));
  }
  return assetPath(src);
}
