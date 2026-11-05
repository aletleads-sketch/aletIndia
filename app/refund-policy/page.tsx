import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { canonical } from "@/lib/seo";
import { withSeoOverrides } from "@/lib/seo-overrides";

const baseMetadata: Metadata = {
  alternates: canonical("/refund-policy"),
  title: "Refund Policy — Alet India",
  description: "When and how Alet India Softwares processes project refunds and cancellations.",
};

export function generateMetadata() {
  return withSeoOverrides("/refund-policy", baseMetadata);
}

export default function Page() {
  return (
    <LegalPage path="/refund-policy" />
  );
}
