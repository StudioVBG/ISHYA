import { getCurrentUserAddresses } from "@/lib/queries/account";
import { AdressesView } from "./AdressesView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mes adresses — ISHYA",
};

export default async function AdressesPage() {
  const addresses = await getCurrentUserAddresses();
  return <AdressesView addresses={addresses} />;
}
