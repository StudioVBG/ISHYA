import { getAdminClients } from "@/lib/queries/admin";
import { ClientsView } from "./ClientsView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clients — Admin ISHYA",
};

export default async function AdminClientsPage() {
  const clients = await getAdminClients();
  return <ClientsView clients={clients} />;
}
