import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { privacyPolicy } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Privacy Policy — Alet India",
  description: "How Alet India collects, uses, and protects your personal information.",
};

export default function Page() {
  return (
    <LegalPage
      crumb="Privacy Policy"
      title="Privacy &"
      accent="Cookie Policy"
      intro="How Alet India collects, uses, and protects your personal information."
      sections={privacyPolicy}
      current="/privacy-policy"
      image="/images/pages/security.jpg"
    />
  );
}
