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
import { JsonLd, siteUrl } from "@/components/seo/JsonLd";
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
  const primaryImage =
    data.media.find((m) => m.is_primary)?.url ?? data.media[0]?.url;
  return {
    title: data.product.name,
    description: data.product.short_description ?? undefined,
    alternates: { canonical: `/produit/${slug}` },
    openGraph: {
      title: data.product.name,
      description: data.product.short_description ?? undefined,
      type: "website",
      url: `/produit/${slug}`,
      images: primaryImage ? [primaryImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: data.product.name,
      description: data.product.short_description ?? undefined,
      images: primaryImage ? [primaryImage] : undefined,
    },
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

  const primaryImage =
    data.media.find((m) => m.is_primary)?.url ?? data.media[0]?.url;
  const totalStock = data.variants.reduce(
    (sum, v) => sum + (v.stock_quantity ?? 0),
    0,
  );
  const productUrl = `${siteUrl()}/produit/${slug}`;

  // priceValidUntil = fin de l'année courante (recommandation Google 2026)
  const priceValidUntil = `${new Date().getFullYear()}-12-31`;

  const allImages = data.media
    .map((m) => m.url)
    .filter((u): u is string => Boolean(u));

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.product.name,
    description: data.product.short_description ?? undefined,
    sku: data.product.sku ?? undefined,
    image: allImages.length > 0 ? allImages : primaryImage,
    brand: { "@type": "Brand", name: "ISHYA" },
    category: data.category?.name ?? undefined,
    material: data.product.material ?? undefined,
    weight: data.product.weight_g
      ? {
          "@type": "QuantitativeValue",
          value: data.product.weight_g,
          unitCode: "GRM",
        }
      : undefined,
    url: productUrl,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "EUR",
      price: data.product.base_price.toFixed(2),
      priceValidUntil,
      availability:
        totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "ISHYA",
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "FR",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "EUR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "FR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
    },
  };
  if (reviewSummary.count > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviewSummary.average,
      reviewCount: reviewSummary.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Accueil",
              item: siteUrl(),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Boutique",
              item: `${siteUrl()}/boutique`,
            },
            ...(data.category
              ? [
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: data.category.name,
                    item: `${siteUrl()}/boutique/${data.category.slug}`,
                  },
                ]
              : []),
            {
              "@type": "ListItem",
              position: data.category ? 4 : 3,
              name: data.product.name,
              item: productUrl,
            },
          ],
        }}
      />
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
