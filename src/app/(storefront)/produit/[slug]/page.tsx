import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllSlugs,
  getProductBySlug,
  getProductReviews,
  getProductReviewSummary,
  getRelatedProducts,
  userHasPurchasedProduct,
  userHasReviewedProduct,
} from "@/lib/queries/storefront";
import ProductPageClient from "./ProductPageClient";
import { ProductReviews } from "./ProductReviews";

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

  const [related, reviews, reviewSummary, hasPurchased, hasReviewed] =
    await Promise.all([
      getRelatedProducts(data.product.id, 4),
      getProductReviews(data.product.id, 20),
      getProductReviewSummary(data.product.id),
      userHasPurchasedProduct(data.product.id),
      userHasReviewedProduct(data.product.id),
    ]);

  return (
    <>
      <ProductPageClient data={data} related={related} />
      <ProductReviews
        productId={data.product.id}
        productSlug={slug}
        reviews={reviews}
        summary={reviewSummary}
        canReview={hasPurchased && !hasReviewed}
      />
    </>
  );
}
