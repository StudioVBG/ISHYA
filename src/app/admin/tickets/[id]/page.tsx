import { notFound } from "next/navigation";
import { getAdminTicketById } from "@/lib/queries/admin";
import { TicketConversation } from "./TicketConversation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ticket — Admin ISHYA",
};

export default async function AdminTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getAdminTicketById(id);
  if (!ticket) notFound();

  return <TicketConversation ticket={ticket} />;
}
