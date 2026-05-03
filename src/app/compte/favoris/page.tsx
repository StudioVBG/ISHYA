import { getCurrentUserWishlist } from "@/lib/queries/account";
import { FavorisView } from "./FavorisView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mes favoris — ISHYA",
};

export default async function FavorisPage() {
  const items = await getCurrentUserWishlist();
  return <FavorisView items={items} />;
}
