import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CMS_SECTIONS, getCmsSection } from "@/lib/cms-sections";

export function generateStaticParams() {
  return CMS_SECTIONS.map(({ slug }) => ({ section: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  return { title: `${getCmsSection(section)?.label ?? "Content"} | ALET India Admin` };
}

/** The CMS itself lives in `../layout.tsx` so it stays loaded while you switch sections. */
export default async function AdminContentSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!getCmsSection(section)) notFound();
  return null;
}
