type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

// Images load from the site root in local development. For a production
// deployment beneath a subfolder, NEXT_PUBLIC_BASE_PATH can be set at build
// time, for example: /aletindia.
export default function imageLoader({ src }: ImageLoaderProps) {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${basePath}${path}`;
}
