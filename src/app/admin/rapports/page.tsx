import { getAdminAnalytics } from "@/lib/queries/admin";
import { RapportsView } from "./RapportsView";

export const revalidate = 300;

export const metadata = {
  title: "Rapports — Admin ISHYA",
};

export default async function AdminRapportsPage() {
  const data = await getAdminAnalytics();
  return <RapportsView data={data} />;
}
