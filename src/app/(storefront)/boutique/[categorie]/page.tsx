import { notFound } from "next/navigation";
import {
  getAllSlugs,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/queries/storefront";
import CategoryContent from "./CategoryContent";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllSlugs("categories");
  return slugs.map((categorie) => ({ categorie }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string }>;
}): Promise<Metadata> {
  const { categorie } = await params;
  const category = await getCategoryBySlug(categorie);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorie: string }>;
}) {
  const { categorie } = await params;
  const [category, products] = await Promise.all([
    getCategoryBySlug(categorie),
    getProductsByCategory(categorie),
  ]);
  if (!category) notFound();

  return <CategoryContent category={category} products={products} />;
}
