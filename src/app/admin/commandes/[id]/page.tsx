import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/lib/queries/admin";
import { OrderDetailView } from "./OrderDetailView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Commande — Admin ISHYA",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();
  return <OrderDetailView order={order} />;
}
