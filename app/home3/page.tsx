import type { Metadata } from "next";
import { Home3Page } from "@/components/home3-page";

// Design sample kept for reference; not part of the public site.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Home3() {
  return <Home3Page />;
}
