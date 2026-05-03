import { getAdminPacks } from "@/lib/queries/admin";
import { PacksView } from "./PacksView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Packs — Admin ISHYA",
};

export default async function AdminPacksPage() {
  const packs = await getAdminPacks();
  return <PacksView packs={packs} />;
}
