import {
  getAdminCategoryOptions,
  getAdminCollectionOptions,
} from "@/lib/queries/admin";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nouveau produit — Admin ISHYA",
};

export default async function NouveauProduitPage() {
  const [categories, collections] = await Promise.all([
    getAdminCategoryOptions(),
    getAdminCollectionOptions(),
  ]);
  return (
    <ProductForm
      product={null}
      categories={categories}
      collections={collections}
    />
  );
}
