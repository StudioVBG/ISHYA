"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";
import { heartBounce, easeOutQuart, softSpring } from "@/lib/animations";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { toggleWishlist } from "@/app/compte/favoris/actions";
import type { ProductMedia, ProductVariant } from "@/types/database";

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
  productType?: "product" | "pack";
  material?: string | null;
  createdAt?: string | null;
  description?: string | null;
}

interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
  index?: number;
}

function getProductBadges(product: ProductCardProduct): string[] {
  const badges: string[] = [];
  if (product.productType === "pack") badges.push("Pack");
  if (product.badges?.includes("nouveau")) badges.push("Nouveau");
  if (product.badges?.includes("best-seller") || product.is_featured)
    badges.push("Best-seller");
  if (product.compare_at_price && product.compare_at_price > product.base_price)
    badges.push("Promo");

  if (product.productType !== "pack") {
    const totalStock =
      product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? Infinity;
    if (totalStock > 0 && totalStock < 5) badges.push("Dernières pièces");
  }

  // Cap to 2 most relevant
  return badges.slice(0, 2);
}

function getBadgeColor(badge: string): string {
  switch (badge) {
    case "Pack":
      return "bg-foreground text-white";
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

function productHref(product: ProductCardProduct): string {
  return product.productType === "pack"
    ? `/pack/${product.slug}`
    : `/produit/${product.slug}`;
}

export function ProductCard({ product, className, index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const wishlisted = useWishlistStore((s) => s.productIds.has(product.id));
  const toggleLocal = useWishlistStore((s) => s.toggle);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.productType === "pack") return;
    const optimisticNext = toggleLocal(product.id);
    startTransition(async () => {
      const res = await toggleWishlist(product.id);
      if (!res.ok) {
        // Rollback optimiste
        toggleLocal(product.id);
        if (res.needsAuth) {
          toast.info("Connectez-vous pour gérer vos favoris");
          router.push(
            `/connexion?redirect_to=${encodeURIComponent(pathname ?? "/")}`,
          );
          return;
        }
        toast.error(res.error ?? "Erreur");
        return;
      }
      if (res.isFavorite !== optimisticNext) {
        // Désynchro rare : recale sur la valeur serveur
        toggleLocal(product.id);
      }
    });
  };

  // ─── Parallaxe léger sur l'image (suit le curseur ±8 px)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(useTransform(mouseX, [-1, 1], [-8, 8]), softSpring);
  const y = useSpring(useTransform(mouseY, [-1, 1], [-6, 6]), softSpring);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const py = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseX.set(px);
    mouseY.set(py);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

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

  const isPack = product.productType === "pack";
  const variantCount = product.variants?.length ?? 0;
  const hasMultipleVariants = variantCount > 1;
  const totalStock = isPack
    ? Infinity
    : (product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? Infinity);
  const isOutOfStock = !isPack && totalStock === 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    // Produits multi-variants : on envoie l'utilisateur sur la page produit
    // pour qu'il choisisse taille / longueur / couleur. La carte ne porte
    // pas les IDs de variant, on ne peut pas les ajouter ici.
    if (hasMultipleVariants) {
      router.push(productHref(product));
      return;
    }
    addItem(
      { id: product.id, name: product.name, base_price: product.base_price },
      undefined,
      primaryImage
    );
    toast.success(`${product.name} ajouté au panier`);
  };

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.06,
        ease: easeOutQuart,
      }}
      className={cn("group relative", className)}
      style={{ viewTransitionName: `product-${product.id}` } as React.CSSProperties}
    >
      {/* Image container */}
      <Link
        href={productHref(product)}
        className="block relative aspect-[3/4] rounded-lg overflow-hidden bg-beige-nude-light mb-3 isolate"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {/* Parallaxe wrapper */}
        <motion.div
          className="absolute inset-0"
          style={{ x, y, scale: 1.06 }}
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-opacity duration-[600ms]",
              hovered && secondaryImage ? "opacity-0" : "opacity-100"
            )}
            style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} - vue 2`}
              fill
              className={cn(
                "object-cover transition-opacity duration-[600ms]",
                hovered ? "opacity-100" : "opacity-0"
              )}
              style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
        </motion.div>

        {/* Glow halo au hover (lumière organique) */}
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-soft-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.5, ease: easeOutQuart }}
          style={{
            background:
              "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.5), transparent 70%)",
          }}
        />

        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {badges.map((badge) => (
              <motion.span
                key={badge}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.2 + index * 0.06,
                  ease: easeOutQuart,
                }}
                className={cn(
                  "px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider rounded-sm",
                  getBadgeColor(badge)
                )}
              >
                {badge}
              </motion.span>
            ))}
          </div>
        )}

        {/* Quick-add button fantôme (apparaît au hover, desktop) */}
        <AnimatePresence>
          {hovered && !isOutOfStock && !isPack && (
            <motion.button
              type="button"
              onClick={handleQuickAdd}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.35, ease: easeOutQuart }}
              className="hidden md:flex absolute bottom-3 left-3 right-3 z-10 items-center justify-center gap-2 h-11 bg-foreground/95 hover:bg-terracotta text-white text-xs font-medium uppercase tracking-wider rounded-md backdrop-blur-sm transition-colors"
              aria-label={
                hasMultipleVariants
                  ? `Choisir une option pour ${product.name}`
                  : `Ajouter ${product.name} au panier`
              }
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {hasMultipleVariants ? "Choisir une option" : "Ajouter rapidement"}
            </motion.button>
          )}
        </AnimatePresence>
      </Link>

      {/* Wishlist button — masqué pour les packs */}
      {!isPack && (
        <motion.button
          variants={heartBounce}
          animate={wishlisted ? "active" : "idle"}
          onClick={handleToggleWishlist}
          className={cn(
            "absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/85 backdrop-blur-sm transition-colors shadow-sm",
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
      )}

      {/* Product info */}
      <Link href={productHref(product)} className="block">
        {product.category && (
          <p className="text-xs text-muted uppercase tracking-wider mb-0.5">
            {product.category.name}
          </p>
        )}
        <h3 className="font-display text-sm sm:text-base font-medium leading-snug group-hover:text-terracotta transition-colors duration-300">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {isPack ? (
            <span className="text-sm text-muted">Voir le pack →</span>
          ) : (
            <span
              className={cn(
                "text-sm font-medium tabular-nums",
                hasDiscount && "text-terracotta"
              )}
            >
              {formatPrice(product.base_price)}
            </span>
          )}
          {hasDiscount && (
            <>
              <span className="text-sm text-muted line-through tabular-nums">
                {formatPrice(product.compare_at_price!)}
              </span>
              <span className="text-xs font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                -{discountPercent}%
              </span>
            </>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
