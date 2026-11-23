import type { Metadata } from "next";
import { Home1Page } from "@/components/home1-page";

// Design sample kept for reference; not part of the public site.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Home1() {
  return <Home1Page />;
}
