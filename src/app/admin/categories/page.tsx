import { getAdminCategories } from "@/lib/queries/admin";
import { CategoriesView } from "./CategoriesView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catégories — Admin ISHYA",
};

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return <CategoriesView categories={categories} />;
}
