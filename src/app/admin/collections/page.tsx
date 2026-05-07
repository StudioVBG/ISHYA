import { getAdminCollections } from "@/lib/queries/admin";
import { CollectionsView } from "./CollectionsView";

export const revalidate = 60;

export const metadata = {
  title: "Collections — Admin ISHYA",
};

export default async function AdminCollectionsPage() {
  const collections = await getAdminCollections();
  return <CollectionsView collections={collections} />;
}
