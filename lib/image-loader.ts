type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

// Local files live under the /aletindia base path. A custom loader keeps
// <Image> src values on that path, where nginx proxies to this app.
export default function imageLoader({ src }: ImageLoaderProps) {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `/aletindia${path}`;
}
