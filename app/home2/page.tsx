import type { Metadata } from "next";
import { Home2Page } from "@/components/home2-page";

// Design sample kept for reference; not part of the public site.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Home2() {
  return <Home2Page />;
}
