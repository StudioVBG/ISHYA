import { notFound } from "next/navigation";
import { getAdminCollectionById } from "@/lib/queries/admin";
import { CollectionDetailView } from "./CollectionDetailView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Collection — Admin ISHYA",
};

export default async function AdminCollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getAdminCollectionById(id);
  if (!collection) notFound();
  return <CollectionDetailView collection={collection} />;
}
