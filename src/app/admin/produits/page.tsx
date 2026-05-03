import { getAdminProducts } from "@/lib/queries/admin";
import { ProduitsView } from "./ProduitsView";

export const metadata = {
  title: "Produits — Admin ISHYA",
};

export const dynamic = "force-dynamic";

export default async function AdminProduitsPage() {
  const products = await getAdminProducts();
  return <ProduitsView products={products} />;
}
