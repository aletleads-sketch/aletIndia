import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { canonical } from "@/lib/seo";
import { withSeoOverrides } from "@/lib/seo-overrides";

const baseMetadata: Metadata = {
  alternates: canonical("/terms-conditions"),
  title: "Terms & Conditions — Alet India",
  description: "The terms that apply when you use www.aletindia.com and our services.",
};

export function generateMetadata() {
  return withSeoOverrides("/terms-conditions", baseMetadata);
}

export default function Page() {
  return (
    <LegalPage path="/terms-conditions" />
  );
}
