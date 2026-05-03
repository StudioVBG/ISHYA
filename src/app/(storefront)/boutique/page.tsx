import { getAllCardProducts, getTopCategories } from "@/lib/queries/storefront";
import BoutiqueContent from "./BoutiqueContent";

export const revalidate = 300;

export const metadata = {
  title: "La Boutique",
  description:
    "Découvrez la collection complète de bijoux floraux artisanaux ISHYA — colliers, bagues, bracelets, boucles d'oreilles et accessoires faits à la main.",
};

export default async function BoutiquePage() {
  const [products, categories] = await Promise.all([
    getAllCardProducts(),
    getTopCategories(20),
  ]);

  return <BoutiqueContent products={products} categories={categories} />;
}
