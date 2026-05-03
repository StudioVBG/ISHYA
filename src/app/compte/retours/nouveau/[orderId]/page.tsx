import { notFound } from "next/navigation";
import { getReturnableOrder } from "@/lib/queries/account";
import { RetourForm } from "./RetourForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Demande de retour — ISHYA",
};

export default async function NouveauRetourPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getReturnableOrder(orderId);
  if (!order) notFound();
  return <RetourForm order={order} />;
}
