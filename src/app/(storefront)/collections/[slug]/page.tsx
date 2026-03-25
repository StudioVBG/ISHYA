"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { ProductCard } from "@/components/product/ProductCard";
import { demoCollections, getProductsByCollection } from "@/lib/demo-data";

export default function CollectionDetailPage() {
  const params = useParams<{ slug: string }>();
  const collection = demoCollections.find((c) => c.slug === params.slug);
  const products = getProductsByCollection(params.slug);

  if (!collection) {
    return (
      <div className="container py-32 text-center">
        <h1 className="font-display text-3xl mb-4">Collection introuvable</h1>
        <Link href="/collections" className="btn-primary">
          Voir toutes les collections
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
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

      {/* Collection Banner */}
      <section className="relative py-24 px-4 overflow-hidden">
        <Image
          src={collection.image_url!}
          alt={collection.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 text-center text-white">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.p
              variants={fadeInUp}
              className="uppercase tracking-[0.2em] text-xs mb-3 text-white/70"
            >
              Collection
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-6xl mb-4"
            >
              {collection.name}
            </motion.h1>
            {collection.description && (
              <motion.p
                variants={fadeInUp}
                className="text-white/80 max-w-xl mx-auto leading-relaxed"
              >
                {collection.description}
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Products */}
      <section className="py-12 px-4">
        <div className="container">
          <p className="text-sm text-muted mb-8">
            <span className="font-medium text-foreground">
              {products.length}
            </span>{" "}
            bijou{products.length > 1 ? "x" : ""} dans cette collection
          </p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {products.map((product, index) => (
              <motion.div key={product.id} variants={staggerItem}>
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </motion.div>

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
