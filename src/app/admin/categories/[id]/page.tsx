import { notFound } from "next/navigation";
import { getAdminCategoryById } from "@/lib/queries/admin";
import { CategoryDetailView } from "./CategoryDetailView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catégorie — Admin ISHYA",
};

export default async function AdminCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);
  if (!category) notFound();
  return <CategoryDetailView category={category} />;
}
