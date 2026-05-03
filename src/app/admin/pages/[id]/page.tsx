import { notFound } from "next/navigation";
import { getAdminCmsPageById } from "@/lib/queries/admin";
import { PageForm } from "../PageForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Éditer la page — Admin ISHYA",
};

export default async function EditCmsPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getAdminCmsPageById(id);
  if (!page) notFound();
  return <PageForm page={page} />;
}
