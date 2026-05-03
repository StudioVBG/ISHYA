import { getAdminAnalytics } from "@/lib/queries/admin";
import { RapportsView } from "./RapportsView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rapports — Admin ISHYA",
};

export default async function AdminRapportsPage() {
  const data = await getAdminAnalytics();
  return <RapportsView data={data} />;
}
