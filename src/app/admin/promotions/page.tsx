import { getAdminPromotions } from "@/lib/queries/admin";
import { PromotionsView } from "./PromotionsView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Codes promo — Admin ISHYA",
};

export default async function AdminPromotionsPage() {
  const promotions = await getAdminPromotions();
  return <PromotionsView promotions={promotions} />;
}
