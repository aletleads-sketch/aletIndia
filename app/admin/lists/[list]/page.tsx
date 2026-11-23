import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebsiteListsWorkspace } from "@/components/admin/website-lists";
import { getListSchema } from "@/lib/list-schemas";

type Props = { params: Promise<{ list: string }>; searchParams: Promise<{ id?: string; new?: string; status?: string; menu?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { list } = await params;
  return { title: `${getListSchema(list)?.label ?? "Lists"} | ALET India Admin` };
}

export default async function AdminListPage({ params, searchParams }: Props) {
  const { list } = await params;
  const { id, new: startNew, status, menu } = await searchParams;
  if (!getListSchema(list)) notFound();
  return <WebsiteListsWorkspace key={list} table={list} initialId={id} startNew={startNew === "1"} initialStatus={status} initialCategory={menu} />;
}
