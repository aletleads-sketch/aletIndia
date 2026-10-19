import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { termsConditions } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Terms & Conditions — Alet India",
  description: "The terms that apply when you use www.aletindia.com and our services.",
};

export default function Page() {
  return (
    <LegalPage
      crumb="Terms & Conditions"
      title="Terms &"
      accent="Conditions"
      intro="The terms that apply when you use www.aletindia.com and our services."
      sections={termsConditions}
      current="/terms-conditions"
      image="/images/pages/signing.jpg"
    />
  );
}
