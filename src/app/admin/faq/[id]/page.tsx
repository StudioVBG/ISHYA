import { notFound } from "next/navigation";
import { getAdminFaqArticleById } from "@/lib/queries/admin";
import { FaqForm } from "../FaqForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Modifier une question — Admin ISHYA",
};

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getAdminFaqArticleById(id);
  if (!article) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">
        Modifier la question
      </h1>
      <FaqForm article={article} />
    </div>
  );
}
