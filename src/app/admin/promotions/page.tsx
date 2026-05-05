import {
  getAdminCategoryOptions,
  getAdminProductOptions,
  getAdminPromotions,
} from "@/lib/queries/admin";
import { PromotionsView } from "./PromotionsView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Codes promo — Admin ISHYA",
};

export default async function AdminPromotionsPage() {
  const [promotions, products, categories] = await Promise.all([
    getAdminPromotions(),
    getAdminProductOptions(),
    getAdminCategoryOptions(),
  ]);
  return (
    <PromotionsView
      promotions={promotions}
      products={products}
      categories={categories}
    />
  );
}
