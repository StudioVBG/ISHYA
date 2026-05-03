import { getCurrentUserLoyalty } from "@/lib/queries/account";
import { FideliteView } from "./FideliteView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Programme fidélité — ISHYA",
};

export default async function FidelitePage() {
  const data = await getCurrentUserLoyalty();
  return <FideliteView data={data} />;
}
