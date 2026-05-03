import { getCurrentUserReturns } from "@/lib/queries/account";
import { RetoursView } from "./RetoursView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mes retours — ISHYA",
};

export default async function MesRetoursPage() {
  const returns = await getCurrentUserReturns();
  return <RetoursView returns={returns} />;
}
