import type { Metadata } from "next";
import { MediaLibrary } from "@/components/admin/media-library";

export const metadata: Metadata = {
  title: "Media Library | ALET India Admin",
};

export default function AdminMediaPage() {
  return <MediaLibrary />;
}
