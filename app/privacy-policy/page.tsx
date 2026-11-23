import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { canonical } from "@/lib/seo";
import { withSeoOverrides } from "@/lib/seo-overrides";

const baseMetadata: Metadata = {
  alternates: canonical("/privacy-policy"),
  title: "Privacy Policy — Alet India",
  description: "How Alet India collects, uses, and protects your personal information.",
};

export function generateMetadata() {
  return withSeoOverrides("/privacy-policy", baseMetadata);
}

export default function Page() {
  return (
    <LegalPage path="/privacy-policy" />
  );
}
