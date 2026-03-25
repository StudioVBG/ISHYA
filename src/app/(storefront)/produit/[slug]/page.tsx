"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Minus,
  Plus,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { ProductCard } from "@/components/product/ProductCard";
import { useCartStore } from "@/stores/cart-store";
import {
  getProductBySlug,
  getRelatedProducts,
  demoCategories,
  reviewAuthors,
} from "@/lib/demo-data";

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
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-medium text-sm">{title}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
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

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const data = getProductBySlug(params.slug);

  const addItem = useCartStore((s) => s.addItem);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  if (!data) {
    return (
      <div className="container py-32 text-center">
        <h1 className="font-display text-3xl mb-4">Produit introuvable</h1>
        <Link href="/boutique" className="btn-primary">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const { product, media, variants, reviews } = data;
  const category = demoCategories.find((c) => c.id === product.category_id);
  const related = getRelatedProducts(product.id);
  const sortedMedia = [...media].sort((a, b) => a.position - b.position);
  const currentVariant = variants[selectedVariant];
  const totalStock = variants.reduce((s, v) => s + v.stock_quantity, 0);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const handleAddToCart = () => {
    addItem(product, currentVariant, sortedMedia[0]?.url);
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
            {/* Image Gallery */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-beige-nude-light mb-3">
                {sortedMedia[selectedImage] && (
                  <Image
                    src={sortedMedia[selectedImage].url}
                    alt={
                      sortedMedia[selectedImage].alt_text ?? product.name
                    }
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                {product.compare_at_price &&
                  product.compare_at_price > product.base_price && (
                    <span className="absolute top-4 left-4 bg-destructive text-white text-xs font-medium px-3 py-1 rounded">
                      -
                      {Math.round(
                        ((product.compare_at_price - product.base_price) /
                          product.compare_at_price) *
                          100
                      )}
                      %
                    </span>
                  )}
              </div>
              {sortedMedia.length > 1 && (
                <div className="flex gap-2">
                  {sortedMedia.map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedImage(idx)}
                      className={cn(
                        "relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                        selectedImage === idx
                          ? "border-terracotta"
                          : "border-transparent hover:border-border"
                      )}
                    >
                      <Image
                        src={m.url}
                        alt={m.alt_text ?? ""}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {category && (
                <motion.p
                  variants={fadeInUp}
                  className="text-xs text-muted uppercase tracking-wider mb-2"
                >
                  {category.name}
                </motion.p>
              )}

              <motion.h1
                variants={fadeInUp}
                className="font-display text-3xl md:text-4xl mb-3"
              >
                {product.name}
              </motion.h1>

              {/* Rating */}
              {reviews.length > 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="flex items-center gap-2 mb-4"
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
                <span
                  className={cn(
                    "text-2xl font-medium",
                    product.compare_at_price && "text-terracotta"
                  )}
                >
                  {formatPrice(product.base_price)}
                </span>
                {product.compare_at_price &&
                  product.compare_at_price > product.base_price && (
                    <span className="text-lg text-muted line-through">
                      {formatPrice(product.compare_at_price)}
                    </span>
                  )}
              </motion.div>

              <motion.p
                variants={fadeInUp}
                className="text-muted leading-relaxed mb-6"
              >
                {product.description_short}
              </motion.p>

              {/* Variant selector */}
              {variants.length > 1 && (
                <motion.div variants={fadeInUp} className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Taille / Variante
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v, idx) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(idx)}
                        className={cn(
                          "px-4 py-2 rounded-lg border text-sm transition-colors",
                          selectedVariant === idx
                            ? "border-terracotta bg-terracotta/5 text-terracotta"
                            : "border-border hover:border-terracotta-light"
                        )}
                      >
                        {v.size ?? v.material_variant ?? v.sku}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Stock indicator */}
              <motion.div variants={fadeInUp} className="mb-6">
                {totalStock > 5 ? (
                  <p className="text-sm text-success flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    En stock
                  </p>
                ) : totalStock > 0 ? (
                  <p className="text-sm text-amber-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Plus que {totalStock} en stock
                  </p>
                ) : (
                  <p className="text-sm text-destructive">Rupture de stock</p>
                )}
              </motion.div>

              {/* Quantity + Add to cart */}
              <motion.div variants={fadeInUp} className="flex gap-3 mb-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-beige-nude-light transition-colors"
                    aria-label="Réduire la quantité"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-beige-nude-light transition-colors"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={totalStock === 0}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Ajouter au panier
                </button>
              </motion.div>

              <motion.button
                variants={fadeInUp}
                onClick={() => setWishlisted(!wishlisted)}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors mb-8",
                  wishlisted
                    ? "text-terracotta"
                    : "text-muted hover:text-terracotta"
                )}
              >
                <Heart
                  className="w-4 h-4"
                  fill={wishlisted ? "currentColor" : "none"}
                />
                {wishlisted
                  ? "Ajouté aux favoris"
                  : "Ajouter aux favoris"}
              </motion.button>

              {/* Accordion */}
              <motion.div variants={fadeInUp}>
                <AccordionItem title="Description" defaultOpen>
                  <p className="whitespace-pre-line">
                    {product.description_long ?? product.description_short}
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
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex flex-col items-center text-center"
                  >
                    <Icon className="w-5 h-5 text-terracotta mb-1.5" />
                    <span className="text-[11px] text-muted">{text}</span>
                  </div>
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
              viewport={{ once: true }}
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
                        {reviewAuthors[review.user_id] ?? "Cliente ISHYA"}
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
                    {review.content}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Cross-sell */}
      {related.length > 0 && (
        <section className="py-16 px-4">
          <div className="container">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="font-display text-2xl md:text-3xl mb-10"
            >
              Complétez votre parure
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
            >
              {related.map((product, index) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}
    </>
  );
}
