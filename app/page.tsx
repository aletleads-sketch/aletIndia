import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = { alternates: canonical("/") };

export default function Home() {
  return <HomePage />;
}
