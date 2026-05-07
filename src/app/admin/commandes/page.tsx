import { getAdminOrders } from "@/lib/queries/admin";
import { CommandesView } from "./CommandesView";

export const metadata = {
  title: "Commandes — Admin ISHYA",
};

export const revalidate = 30;

export default async function AdminCommandesPage() {
  const orders = await getAdminOrders({ limit: 200 });
  return <CommandesView orders={orders} />;
}
