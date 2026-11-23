import { redirect } from "next/navigation";
import { getListSchema } from "@/lib/list-schemas";

/** Old links used ?list=…; each list now has its own address. */
export default async function AdminListsPage({ searchParams }: { searchParams: Promise<{ list?: string }> }) {
  const { list } = await searchParams;
  redirect(`/admin/lists/${list && getListSchema(list) ? list : "services"}`);
}
