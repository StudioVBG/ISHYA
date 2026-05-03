import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { AnimatedProductGrid } from "@/components/product/AnimatedProductGrid";
import {
  getAllSlugs,
  getCollectionBySlug,
  getProductsByCollection,
} from "@/lib/queries/storefront";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllSlugs("collections");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  return {
    title: collection.name,
    description: collection.description ?? undefined,
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [collection, products] = await Promise.all([
    getCollectionBySlug(slug),
    getProductsByCollection(slug),
  ]);
  if (!collection) notFound();

  return (
    <>
      <nav className="border-b border-border px-4">
        <div className="container py-3 flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="hover:text-terracotta transition-colors">
            Accueil
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href="/collections"
            className="hover:text-terracotta transition-colors"
          >
            Collections
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{collection.name}</span>
        </div>
      </nav>

      <section className="relative py-24 px-4 overflow-hidden">
        {collection.image_url && (
          <Image
            src={collection.image_url}
            alt={collection.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 text-center text-white">
          <p className="uppercase tracking-[0.2em] text-xs mb-3 text-white/70">
            Collection
          </p>
          <h1 className="font-display text-4xl md:text-6xl mb-4">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-white/80 max-w-xl mx-auto leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container">
          <p className="text-sm text-muted mb-8">
            <span className="font-medium text-foreground">{products.length}</span>{" "}
            bijou{products.length > 1 ? "x" : ""} dans cette collection
          </p>
          <AnimatedProductGrid products={products} />
          {products.length === 0 && (
            <p className="text-center text-muted py-20">
              Aucun produit dans cette collection pour le moment.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
