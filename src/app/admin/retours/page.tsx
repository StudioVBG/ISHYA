import { getAdminReturns } from "@/lib/queries/admin";
import { RetoursView } from "./RetoursView";

export const revalidate = 60;

export const metadata = {
  title: "Retours — Admin ISHYA",
};

export default async function AdminRetoursPage() {
  const returns = await getAdminReturns();
  return <RetoursView returns={returns} />;
}
