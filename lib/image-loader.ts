import { assetPath } from "@/lib/site-path";
import variants from "@/lib/image-variants.json";

type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

/** Pre-rendered widths for `/images/blogs/hd/*.webp` (the bare file is the 3840px master). */
const HD_WIDTHS = [960, 1920] as const;

/**
 * Widths of the WebP copies in `/images/_opt/`, made by scripts/optimize-images.py.
 * The originals stay in place; removing an entry here serves the original again.
 */
const OPTIMISED = variants as Record<string, number[]>;

export default function imageLoader({ src, width }: ImageLoaderProps) {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/images/blogs/hd/") && src.endsWith(".webp")) {
    const variant = HD_WIDTHS.find((size) => size >= width);
    if (variant) return assetPath(src.replace(/\.webp$/, `-${variant}.webp`));
  }
  const widths = OPTIMISED[src];
  if (widths) {
    const variant = widths.find((size) => size >= width) ?? widths[widths.length - 1];
    return assetPath(`/images/_opt/${src.slice("/images/".length).replace(/\.\w+$/, "")}-${variant}.webp`);
  }
  return assetPath(src);
}
