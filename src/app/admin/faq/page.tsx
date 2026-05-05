import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminFaqArticles } from "@/lib/queries/admin";
import { FaqList } from "./FaqList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FAQ — Admin ISHYA",
};

export default async function AdminFaqPage() {
  const articles = await getAdminFaqArticles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">FAQ</h1>
          <p className="text-sm text-gray-500 mt-1">
            {articles.length} question{articles.length > 1 ? "s" : ""} —
            visibles sur /aide
          </p>
        </div>
        <Link
          href="/admin/faq/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-terracotta text-white text-sm font-medium hover:bg-terracotta-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle question
        </Link>
      </div>

      <FaqList articles={articles} />
    </div>
  );
}
