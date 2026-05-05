import { notFound } from "next/navigation";
import { getAdminClientById } from "@/lib/queries/admin";
import { ClientDetailView } from "./ClientDetailView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Client — Admin ISHYA",
};

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getAdminClientById(id);
  if (!client) notFound();
  return <ClientDetailView client={client} />;
}
