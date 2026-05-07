"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronRight,
  Minus,
  Plus,
  Heart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  letterContainer,
  letterItem,
  easeOutQuart,
} from "@/lib/animations";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { RelatedCarousel } from "@/components/product/RelatedCarousel";
import { type ProductCardProduct } from "@/components/product/ProductCard";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { toggleWishlist } from "@/app/compte/favoris/actions";
import { trackAddToCart, trackViewItem } from "@/lib/analytics";
import type { ProductDetail } from "@/lib/queries/storefront";

interface ProductPageClientProps {
  data: ProductDetail;
  related: ProductCardProduct[];
}

function AnimatedTitle({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <motion.h1
      variants={letterContainer}
      initial="hidden"
      animate="visible"
      className="font-display text-3xl md:text-4xl lg:text-5xl mb-3 leading-tight"
      aria-label={text}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap mr-2">
          {Array.from(word).map((char, ci) => (
            <motion.span
              key={`${wi}-${ci}`}
              variants={letterItem}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.h1>
  );
}

function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
        aria-expanded={open}
      >
        <span className="font-medium text-sm group-hover:text-terracotta transition-colors">
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.35, ease: easeOutQuart }}
        >
          <ChevronDown className="w-4 h-4 text-muted" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.35, ease: easeOutQuart },
              opacity: { duration: 0.25, ease: easeOutQuart },
            }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-sm text-muted leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductPageClient({ data, related }: ProductPageClientProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);

  const { product, media, variants, reviews, category } = data;
  const wishlisted = useWishlistStore((s) => s.productIds.has(product.id));
  const toggleLocal = useWishlistStore((s) => s.toggle);
  const [, startWishlistTransition] = useTransition();

  const handleToggleWishlist = () => {
    const optimisticNext = toggleLocal(product.id);
    startWishlistTransition(async () => {
      const res = await toggleWishlist(product.id);
      if (!res.ok) {
        if (res.needsAuth) return; // Anonyme : on garde le toggle local.
        toggleLocal(product.id); // Rollback erreur réelle.
        toast.error(res.error ?? "Erreur");
        return;
      }
      if (res.isFavorite !== optimisticNext) toggleLocal(product.id);
    });
  };
  const sortedMedia = media;
  const currentVariant = variants[selectedVariant] as
    | (typeof variants)[number]
    | undefined;
  const totalStock = variants.reduce((s, v) => s + v.stock_quantity, 0);
  const currentStock = currentVariant?.stock_quantity ?? totalStock;
  const displayedPrice =
    currentVariant?.price_override ?? product.base_price;
  const displayedCompareAt = product.compare_at_price;
  const isOnSale =
    displayedCompareAt != null && displayedCompareAt > displayedPrice;
  const saleBadge =
    isOnSale && displayedCompareAt
      ? `-${Math.round(
          ((displayedCompareAt - displayedPrice) / displayedCompareAt) * 100
        )}%`
      : null;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  useEffect(() => {
    trackViewItem({
      id: product.id,
      name: product.name,
      price: displayedPrice,
      category: category?.name ?? null,
    });
  }, [product.id, product.name, displayedPrice, category?.name]);

  const handleAddToCart = () => {
    if (currentStock === 0) return;
    const qty = Math.min(quantity, currentStock);
    for (let i = 0; i < qty; i++) {
      addItem(product, currentVariant, sortedMedia[0]?.url);
    }
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: displayedPrice,
      quantity: qty,
      variantId: currentVariant?.id ?? null,
      category: category?.name ?? null,
    });
    setTimeout(() => openCart(), 700);
  };

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
            href="/boutique"
            className="hover:text-terracotta transition-colors"
          >
            Boutique
          </Link>
          {category && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link
                href={`/boutique/${category.slug}`}
                className="hover:text-terracotta transition-colors"
              >
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate">
            {product.name}
          </span>
        </div>
      </nav>

      <section className="py-8 md:py-12 px-4">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Galerie */}
            <ProductGallery
              media={sortedMedia}
              productName={product.name}
              productId={product.id}
              saleBadge={saleBadge}
            />

            {/* Product Info */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {category && (
                <motion.p
                  variants={fadeInUp}
                  className="text-xs text-muted uppercase tracking-[0.15em] mb-3"
                >
                  {category.name}
                </motion.p>
              )}

              <AnimatedTitle text={product.name} />

              {/* Rating */}
              {reviews.length > 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="flex items-center gap-2 mb-5"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < Math.round(avgRating)
                            ? "fill-gold text-gold"
                            : "fill-border text-border"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted">
                    ({reviews.length} avis)
                  </span>
                </motion.div>
              )}

              {/* Price */}
              <motion.div
                variants={fadeInUp}
                className="flex items-baseline gap-3 mb-6"
              >
                <motion.span
                  key={displayedPrice}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: easeOutQuart }}
                  className={cn(
                    "text-3xl font-medium tabular-nums",
                    isOnSale && "text-terracotta"
                  )}
                >
                  {formatPrice(displayedPrice)}
                </motion.span>
                {isOnSale && displayedCompareAt && (
                  <span className="text-lg text-muted line-through tabular-nums">
                    {formatPrice(displayedCompareAt)}
                  </span>
                )}
              </motion.div>

              <motion.p
                variants={fadeInUp}
                className="text-muted leading-relaxed mb-6"
              >
                {product.short_description}
              </motion.p>

              {/* Variant selector avec ripple */}
              {variants.length > 1 && (
                <motion.div variants={fadeInUp} className="mb-6">
                  <label className="block text-sm font-medium mb-3 uppercase tracking-wider text-xs">
                    Taille / Variante
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v, idx) => {
                      const out = v.stock_quantity === 0;
                      const selected = selectedVariant === idx;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(idx)}
                          className={cn(
                            "relative px-4 h-11 min-w-[3rem] rounded-lg border text-sm transition-all overflow-hidden",
                            selected
                              ? "border-terracotta text-terracotta bg-terracotta/5"
                              : "border-border hover:border-terracotta-light",
                            out && "opacity-50 line-through"
                          )}
                          aria-pressed={selected}
                          aria-label={
                            out
                              ? `${v.size ?? v.material_variant ?? v.sku} (rupture)`
                              : undefined
                          }
                        >
                          {selected && (
                            <motion.span
                              layoutId="variant-ripple"
                              className="absolute inset-0 bg-terracotta/10"
                              transition={{
                                type: "spring",
                                stiffness: 350,
                                damping: 30,
                              }}
                            />
                          )}
                          <span className="relative">
                            {v.size ?? v.material_variant ?? v.sku}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Stock indicator */}
              <motion.div variants={fadeInUp} className="mb-6">
                {currentStock > 5 ? (
                  <p className="text-sm text-success flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    En stock
                  </p>
                ) : currentStock > 0 ? (
                  <p className="text-sm text-warning flex items-center gap-1.5">
                    <motion.span
                      className="w-2 h-2 rounded-full bg-warning"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                    Plus que {currentStock} en stock
                  </p>
                ) : (
                  <p className="text-sm text-destructive">
                    {variants.length > 1
                      ? "Cette variante est en rupture"
                      : "Rupture de stock"}
                  </p>
                )}
              </motion.div>

              {/* Quantity + Add to cart */}
              <motion.div variants={fadeInUp} className="flex gap-3 mb-4">
                <div className="flex items-center border border-border rounded-md h-12">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-full px-3 hover:bg-beige-nude-light transition-colors rounded-l-md"
                    aria-label="Réduire la quantité"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-full px-3 hover:bg-beige-nude-light transition-colors rounded-r-md"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <AddToCartButton
                  onAdd={handleAddToCart}
                  outOfStock={currentStock === 0}
                />
              </motion.div>

              <motion.button
                variants={fadeInUp}
                onClick={handleToggleWishlist}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors mb-8 group",
                  wishlisted
                    ? "text-terracotta"
                    : "text-muted hover:text-terracotta"
                )}
              >
                <motion.span
                  animate={wishlisted ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex"
                >
                  <Heart
                    className="w-4 h-4"
                    fill={wishlisted ? "currentColor" : "none"}
                  />
                </motion.span>
                {wishlisted
                  ? "Ajouté aux favoris"
                  : "Ajouter aux favoris"}
              </motion.button>

              {/* Accordion */}
              <motion.div variants={fadeInUp}>
                <AccordionItem title="Description" defaultOpen>
                  <p className="whitespace-pre-line">
                    {product.description ?? product.short_description}
                  </p>
                </AccordionItem>

                <AccordionItem title="Caractéristiques">
                  <ul className="space-y-2">
                    {product.material && (
                      <li>
                        <span className="font-medium">Matière :</span>{" "}
                        {product.material}
                      </li>
                    )}
                    {product.weight_g && (
                      <li>
                        <span className="font-medium">Poids :</span>{" "}
                        {product.weight_g}g
                      </li>
                    )}
                    {product.dimensions && (
                      <li>
                        <span className="font-medium">Dimensions :</span>{" "}
                        {product.dimensions}
                      </li>
                    )}
                    {product.is_nickel_free && (
                      <li>
                        <span className="font-medium">Sans nickel :</span> Oui
                      </li>
                    )}
                  </ul>
                </AccordionItem>

                <AccordionItem title="Entretien">
                  <p>
                    {product.care_instructions ??
                      "Éviter le contact avec l'eau et les parfums. Ranger dans la pochette fournie. Nettoyer avec un chiffon doux."}
                  </p>
                </AccordionItem>

                <AccordionItem title="Livraison & Retours">
                  <ul className="space-y-2">
                    <li>Livraison offerte dès 60€ d&apos;achat</li>
                    <li>Livraison standard : 3-5 jours ouvrés</li>
                    <li>Livraison express : 1-2 jours ouvrés</li>
                    <li>Retours gratuits sous 14 jours</li>
                    <li>Échange possible sous 30 jours</li>
                  </ul>
                </AccordionItem>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border"
              >
                {[
                  { icon: Shield, text: "Paiement sécurisé" },
                  { icon: Truck, text: "Livraison offerte dès 60€" },
                  { icon: RotateCcw, text: "Retours gratuits 14j" },
                ].map(({ icon: Icon, text }, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.1,
                      ease: easeOutQuart,
                    }}
                    className="flex flex-col items-center text-center"
                  >
                    <Icon className="w-5 h-5 text-terracotta mb-1.5" />
                    <span className="text-[11px] text-muted">{text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-16 bg-beige-nude-light/30 px-4">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mb-10"
            >
              <h2 className="font-display text-2xl md:text-3xl mb-2">
                Avis clients
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < Math.round(avgRating)
                          ? "fill-gold text-gold"
                          : "fill-border text-border"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted">
                  {avgRating.toFixed(1)}/5 — {reviews.length} avis
                </span>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="space-y-6"
            >
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  variants={staggerItem}
                  className="bg-white rounded-xl p-6 border border-border/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">
                        Cliente ISHYA
                      </p>
                      {review.is_verified_purchase && (
                        <p className="text-xs text-success">Achat vérifié</p>
                      )}
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < review.rating
                              ? "fill-gold text-gold"
                              : "fill-border text-border"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  {review.title && (
                    <h4 className="font-medium text-sm mb-1">
                      {review.title}
                    </h4>
                  )}
                  <p className="text-sm text-muted leading-relaxed">
                    {review.body}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Cross-sell — carrousel drag */}
      {related.length > 0 && (
        <section className="py-16 px-4 overflow-hidden">
          <div className="container">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="font-display text-2xl md:text-3xl mb-2"
            >
              Complétez votre parure
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5, ease: easeOutQuart }}
              className="text-sm text-muted mb-8"
            >
              Faites glisser pour découvrir
            </motion.p>
            <RelatedCarousel products={related} />
          </div>
        </section>
      )}
    </>
  );
}
