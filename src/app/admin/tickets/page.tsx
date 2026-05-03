import { getAdminTickets } from "@/lib/queries/admin";
import { TicketsView } from "./TicketsView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tickets — Admin ISHYA",
};

export default async function AdminTicketsPage() {
  const tickets = await getAdminTickets();
  return <TicketsView tickets={tickets} />;
}
