import { notFound } from "next/navigation";
import {
  getAdminCategoryOptions,
  getAdminCollectionOptions,
  getAdminProductById,
} from "@/lib/queries/admin";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Éditer le produit — Admin ISHYA",
};

export default async function EditProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, collections] = await Promise.all([
    getAdminProductById(id),
    getAdminCategoryOptions(),
    getAdminCollectionOptions(),
  ]);
  if (!product) notFound();
  return (
    <ProductForm
      product={product}
      categories={categories}
      collections={collections}
    />
  );
}
