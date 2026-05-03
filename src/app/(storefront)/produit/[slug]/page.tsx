import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/queries/storefront";
import ProductPageClient from "./ProductPageClient";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllSlugs("products");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) return {};
  return {
    title: data.product.name,
    description: data.product.short_description ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) notFound();

  const related = await getRelatedProducts(data.product.id, 4);
  return <ProductPageClient data={data} related={related} />;
}
