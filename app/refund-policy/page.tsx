import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { refundPolicy } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Refund Policy — Alet India",
  description: "When and how Alet India Softwares processes project refunds and cancellations.",
};

export default function Page() {
  return (
    <LegalPage
      crumb="Refund Policy"
      title="Payment"
      accent="Refund Policy"
      intro="When and how Alet India Softwares processes project refunds and cancellations."
      sections={refundPolicy}
      current="/refund-policy"
      image="/images/pages/blog-laptop.jpg"
    />
  );
}
