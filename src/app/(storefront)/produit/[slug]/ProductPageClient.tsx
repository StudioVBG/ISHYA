"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
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
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useCartStore } from "@/stores/cart-store";
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
      className="font-display text-ink mb-4"
      style={{
        fontSize: "var(--text-h1)",
        fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'WONK' 1",
        fontWeight: 400,
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
      }}
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
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={open}
      >
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink group-hover:text-ember transition-colors">
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.35, ease: easeOutQuart }}
        >
          <ChevronDown className="w-4 h-4 text-steel group-hover:text-ember transition-colors" />
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
            <div className="pb-5 text-sm text-steel leading-relaxed">
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
  const [wishlisted, setWishlisted] = useState(false);

  const { product, media, variants, reviews, category } = data;
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
      <div className="border-b border-border px-4">
        <div className="container py-3">
          <Breadcrumb
            items={[
              { label: "Boutique", href: "/boutique" },
              ...(category
                ? [
                    {
                      label: category.name,
                      href: `/boutique/${category.slug}`,
                    },
                  ]
                : []),
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <section className="py-10 md:py-16 px-4">
        <div className="container">
          {/* Split éditorial 1.4fr / 1fr — galerie sticky côté gauche, scroll côté droit */}
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 md:gap-16 lg:gap-20 items-start">
            {/* Galerie — sticky desktop */}
            <div className="md:sticky md:top-24">
              <ProductGallery
                media={sortedMedia}
                productName={product.name}
                productId={product.id}
                saleBadge={saleBadge}
              />
            </div>

            {/* Product Info — scrollable */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="md:py-4"
            >
              {category && (
                <motion.div
                  variants={fadeInUp}
                  className="flex items-center gap-3 mb-6"
                >
                  <span className="h-px w-8 bg-ember" aria-hidden />
                  <span className="eyebrow">{category.name}</span>
                </motion.div>
              )}

              <AnimatedTitle text={product.name} />

              {/* Rating */}
              {reviews.length > 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="flex items-center gap-2 mb-6"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < Math.round(avgRating)
                            ? "fill-ember text-ember"
                            : "fill-border text-border",
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-steel">
                    ({reviews.length} avis)
                  </span>
                </motion.div>
              )}

              {/* Price — typo mono pour le côté technique numéroté */}
              <motion.div
                variants={fadeInUp}
                className="flex items-baseline gap-3 mb-8"
              >
                <motion.span
                  key={displayedPrice}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: easeOutQuart }}
                  className={cn(
                    "font-mono text-3xl tabular-nums",
                    isOnSale ? "text-ember" : "text-ink",
                  )}
                >
                  {formatPrice(displayedPrice)}
                </motion.span>
                {isOnSale && displayedCompareAt && (
                  <span className="font-mono text-lg text-steel line-through tabular-nums">
                    {formatPrice(displayedCompareAt)}
                  </span>
                )}
              </motion.div>

              <motion.p
                variants={fadeInUp}
                className="text-steel leading-relaxed mb-8 text-base"
              >
                {product.short_description}
              </motion.p>

              {/* Variant selector avec ripple */}
              {variants.length > 1 && (
                <motion.div variants={fadeInUp} className="mb-8">
                  <label className="block font-mono text-[10px] tracking-[0.24em] uppercase text-ink mb-4">
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
                            "relative px-4 h-11 min-w-[3rem] border font-mono text-[12px] tracking-wide transition-all overflow-hidden",
                            selected
                              ? "border-ink text-ink"
                              : "border-border-strong text-steel hover:border-ink hover:text-ink",
                            out && "opacity-40 line-through",
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
                              className="absolute inset-0 bg-ink/8"
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
              <motion.div variants={fadeInUp} className="mb-8">
                {currentStock > 5 ? (
                  <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-success flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    En stock — expédition sous 24h
                  </p>
                ) : currentStock > 0 ? (
                  <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-warning flex items-center gap-2">
                    <motion.span
                      className="w-2 h-2 rounded-full bg-warning"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                    Plus que {currentStock} en stock
                  </p>
                ) : (
                  <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-destructive">
                    {variants.length > 1
                      ? "Cette variante est en rupture"
                      : "Rupture de stock"}
                  </p>
                )}
              </motion.div>

              {/* Quantity + Add to cart */}
              <motion.div variants={fadeInUp} className="flex gap-3 mb-5">
                <div className="flex items-center border border-ink/20 h-12">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-full px-3.5 hover:bg-ink hover:text-bone transition-colors"
                    aria-label="Réduire la quantité"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-medium tabular-nums text-ink">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-full px-3.5 hover:bg-ink hover:text-bone transition-colors"
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
                onClick={() => setWishlisted(!wishlisted)}
                className={cn(
                  "flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors mb-10 group",
                  wishlisted ? "text-ember" : "text-steel hover:text-ember",
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

              {/* Trust badges — engagement Atelier Noir */}
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-3 gap-4 mt-10 pt-10 border-t border-border"
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
                    <Icon className="w-5 h-5 text-ember mb-2" />
                    <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-steel leading-snug">
                      {text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-20 md:py-28 bg-bone-soft border-t border-border px-4">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-10 bg-ember" aria-hidden />
                <span className="eyebrow">Témoignages</span>
              </div>
              <h2
                className="font-display text-ink mb-4"
                style={{
                  fontSize: "var(--text-h2)",
                  fontVariationSettings: "'opsz' 144, 'SOFT' 50, 'WONK' 0",
                  fontWeight: 400,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.1,
                }}
              >
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
                          ? "fill-ember text-ember"
                          : "fill-border text-border",
                      )}
                    />
                  ))}
                </div>
                <span className="font-mono text-[12px] tracking-[0.14em] uppercase text-steel tabular-nums">
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
                  className="bg-bone p-7 md:p-8 border border-border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        Cliente ISHYA
                      </p>
                      {review.is_verified_purchase && (
                        <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-success mt-1">
                          Achat vérifié
                        </p>
                      )}
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < review.rating
                              ? "fill-ember text-ember"
                              : "fill-border text-border",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  {review.title && (
                    <h4 className="font-medium text-ink mb-2">{review.title}</h4>
                  )}
                  <p className="text-steel leading-relaxed">{review.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Cross-sell — carrousel drag */}
      {related.length > 0 && (
        <section className="py-20 md:py-28 px-4 overflow-hidden">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-10 bg-ember" aria-hidden />
                <span className="eyebrow">Curation</span>
              </div>
              <h2
                className="font-display text-ink mb-3"
                style={{
                  fontSize: "var(--text-h2)",
                  fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'WONK' 1",
                  fontWeight: 400,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.1,
                }}
              >
                Complétez votre parure
              </h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5, ease: easeOutQuart }}
                className="font-mono text-[11px] tracking-[0.14em] uppercase text-steel"
              >
                Faites glisser pour découvrir
              </motion.p>
            </motion.div>
            <RelatedCarousel products={related} />
          </div>
        </section>
      )}
    </>
  );
}
