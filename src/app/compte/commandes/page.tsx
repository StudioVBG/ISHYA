import { getCurrentUserOrders } from "@/lib/queries/account";
import { CommandesView } from "./CommandesView";

export const metadata = {
  title: "Mes commandes — ISHYA",
};

export const dynamic = "force-dynamic";

export default async function CommandesPage() {
  const orders = await getCurrentUserOrders();
  return <CommandesView orders={orders} />;
}
