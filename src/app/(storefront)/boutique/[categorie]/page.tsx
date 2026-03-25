import { notFound } from "next/navigation";
import { demoCategories, getProductsByCategory } from "@/lib/demo-data";
import CategoryContent from "./CategoryContent";
import type { Metadata } from "next";

export function generateStaticParams() {
  return demoCategories.map((c) => ({ categorie: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string }>;
}): Promise<Metadata> {
  const { categorie } = await params;
  const category = demoCategories.find((c) => c.slug === categorie);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorie: string }>;
}) {
  const { categorie } = await params;
  const category = demoCategories.find((c) => c.slug === categorie);
  if (!category) notFound();

  const products = getProductsByCategory(categorie);

  return <CategoryContent category={category!} products={products} />;
}
