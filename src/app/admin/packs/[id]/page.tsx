import { notFound } from "next/navigation";
import { getAdminPackById } from "@/lib/queries/admin";
import { PackDetailView } from "./PackDetailView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pack — Admin ISHYA",
};

export default async function AdminPackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pack = await getAdminPackById(id);
  if (!pack) notFound();
  return <PackDetailView pack={pack} />;
}
