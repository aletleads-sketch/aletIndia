import { assetPath } from "@/lib/site-path";

type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

export default function imageLoader({ src }: ImageLoaderProps) {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return assetPath(src);
}
