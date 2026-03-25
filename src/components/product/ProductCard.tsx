"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { heartBounce, fadeInUp } from "@/lib/animations";
import type { Product, ProductMedia, ProductVariant } from "@/types/database";

export interface ProductCardProduct {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price: number | null;
  is_featured?: boolean;
  media?: Pick<ProductMedia, "url" | "alt_text" | "position" | "is_primary">[];
  category?: { name: string; slug: string };
  variants?: Pick<ProductVariant, "stock_quantity">[];
  badges?: string[];
}

interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
  index?: number;
}

function getProductBadges(product: ProductCardProduct): string[] {
  const badges: string[] = [];
  if (product.badges?.includes("nouveau")) badges.push("Nouveau");
  if (product.badges?.includes("best-seller") || product.is_featured)
    badges.push("Best-seller");
  if (product.compare_at_price && product.compare_at_price > product.base_price)
    badges.push("Promo");

  const totalStock =
    product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? Infinity;
  if (totalStock > 0 && totalStock < 5) badges.push("Dernières pièces");

  return badges;
}

function getBadgeColor(badge: string): string {
  switch (badge) {
    case "Nouveau":
      return "bg-gold text-white";
    case "Best-seller":
      return "bg-terracotta text-white";
    case "Promo":
      return "bg-destructive text-white";
    case "Dernières pièces":
      return "bg-foreground text-white";
    default:
      return "bg-muted text-white";
  }
}

export function ProductCard({ product, className, index = 0 }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);

  const badges = getProductBadges(product);
  const sortedMedia = [...(product.media ?? [])].sort(
    (a, b) => a.position - b.position
  );
  const primaryImage =
    sortedMedia.find((m) => m.is_primary)?.url ??
    sortedMedia[0]?.url ??
    "/placeholder.jpg";
  const secondaryImage = sortedMedia[1]?.url;

  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.base_price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.base_price) /
          product.compare_at_price!) *
          100
      )
    : 0;

  return (
    <motion.article
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn("group relative", className)}
    >
      {/* Image container */}
      <Link
        href={`/produit/${product.slug}`}
        className="block relative aspect-[3/4] rounded-lg overflow-hidden bg-beige-nude-light mb-3"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          className={cn(
            "object-cover transition-opacity duration-300",
            hovered && secondaryImage ? "opacity-0" : "opacity-100"
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {secondaryImage && (
          <Image
            src={secondaryImage}
            alt={`${product.name} - vue 2`}
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              hovered ? "opacity-100" : "opacity-0"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className={cn(
                  "px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-sm",
                  getBadgeColor(badge)
                )}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* Wishlist button */}
      <motion.button
        variants={heartBounce}
        animate={wishlisted ? "active" : "idle"}
        onClick={() => setWishlisted(!wishlisted)}
        className={cn(
          "absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm transition-colors",
          wishlisted
            ? "text-terracotta"
            : "text-muted hover:text-terracotta"
        )}
        aria-label={
          wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"
        }
      >
        <Heart
          className="w-4 h-4"
          fill={wishlisted ? "currentColor" : "none"}
        />
      </motion.button>

      {/* Product info */}
      <Link href={`/produit/${product.slug}`} className="block">
        {product.category && (
          <p className="text-xs text-muted uppercase tracking-wider mb-0.5">
            {product.category.name}
          </p>
        )}
        <h3 className="font-display text-sm sm:text-base font-medium leading-snug group-hover:text-terracotta transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={cn(
              "text-sm font-medium",
              hasDiscount && "text-terracotta"
            )}
          >
            {formatPrice(product.base_price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-sm text-muted line-through">
                {formatPrice(product.compare_at_price!)}
              </span>
              <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                -{discountPercent}%
              </span>
            </>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
