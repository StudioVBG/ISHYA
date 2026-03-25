"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Minus,
  Plus,
  X,
  Truck,
  Gift,
  Tag,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { cn, formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const DISCOUNT_CODES: Record<
  string,
  { type: "percent" | "fixed" | "free_shipping"; value: number; label: string }
> = {
  BIENVENUE10: { type: "percent", value: 10, label: "-10%" },
  ISHYA20: { type: "fixed", value: 20, label: "-20,00 €" },
  LIVGRATUITE: { type: "free_shipping", value: 0, label: "Livraison offerte" },
};

const CROSS_SELL = [
  {
    id: "cs-1",
    name: "Bague Pétale de Rose",
    price: 42,
    image: "/images/products/bague-petale.jpg",
    slug: "/produit/bague-petale-de-rose",
  },
  {
    id: "cs-2",
    name: "Bracelet Fleur d'Oranger",
    price: 38,
    image: "/images/products/bracelet-oranger.jpg",
    slug: "/produit/bracelet-fleur-oranger",
  },
  {
    id: "cs-3",
    name: "Collier Hortensia",
    price: 56,
    image: "/images/products/collier-hortensia.jpg",
    slug: "/produit/collier-hortensia",
  },
  {
    id: "cs-4",
    name: "Boucles Lavande",
    price: 34,
    image: "/images/products/boucles-lavande.jpg",
    slug: "/produit/boucles-lavande",
  },
];

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const giftWrap = useCartStore((s) => s.giftWrap);
  const giftMessage = useCartStore((s) => s.giftMessage);
  const setGiftWrap = useCartStore((s) => s.setGiftWrap);
  const setGiftMessage = useCartStore((s) => s.setGiftMessage);
  const discountCode = useCartStore((s) => s.discountCode);
  const discountAmount = useCartStore((s) => s.discountAmount);
  const setDiscount = useCartStore((s) => s.setDiscount);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const itemCount = useCartStore((s) => s.getItemCount());

  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeSuccess, setCodeSuccess] = useState("");

  const giftWrapCost = giftWrap ? 3 : 0;
  const isFreeShippingCode =
    discountCode &&
    DISCOUNT_CODES[discountCode]?.type === "free_shipping";
  const estimatedShipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || isFreeShippingCode ? 0 : 4.9;
  const total = subtotal - discountAmount + giftWrapCost + estimatedShipping;
  const shippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100
  );

  function applyDiscount() {
    const code = codeInput.trim().toUpperCase();
    setCodeError("");
    setCodeSuccess("");

    if (!code) {
      setCodeError("Veuillez entrer un code");
      return;
    }

    const discount = DISCOUNT_CODES[code];
    if (!discount) {
      setCodeError("Code promo invalide");
      return;
    }

    let amount = 0;
    if (discount.type === "percent") {
      amount = subtotal * (discount.value / 100);
    } else if (discount.type === "fixed") {
      amount = discount.value;
    }

    setDiscount(code, amount);
    setCodeSuccess(`Code "${code}" appliqué : ${discount.label}`);
  }

  function removeDiscount() {
    setDiscount(null, 0);
    setCodeInput("");
    setCodeError("");
    setCodeSuccess("");
  }

  if (items.length === 0) {
    return (
      <div className="container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="w-24 h-24 rounded-full bg-beige-nude-light flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-muted" />
          </div>
          <h1 className="font-display text-2xl mb-3">Votre panier est vide</h1>
          <p className="text-muted mb-8">
            Découvrez nos bijoux floraux artisanaux et trouvez la pièce qui vous
            ressemble.
          </p>
          <Link href="/boutique" className="btn-primary">
            Découvrir la boutique
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-8 lg:py-12">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl lg:text-3xl mb-8"
      >
        Mon Panier{" "}
        <span className="text-muted text-lg font-sans font-normal">
          ({itemCount} article{itemCount > 1 ? "s" : ""})
        </span>
      </motion.h1>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Free shipping progress */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Truck className="w-4 h-4 text-gold" />
              {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                <span className="text-sm text-success font-medium">
                  Félicitations, la livraison est offerte !
                </span>
              ) : (
                <span className="text-sm text-muted">
                  Plus que{" "}
                  <strong className="text-foreground">
                    {formatPrice(shippingRemaining)}
                  </strong>{" "}
                  pour la livraison offerte
                </span>
              )}
            </div>
            <div className="h-2 bg-beige-nude-light rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${shippingProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          {/* Cart Items */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-0 bg-white rounded-xl border border-border overflow-hidden"
          >
            {/* Table header – desktop */}
            <div className="hidden md:grid grid-cols-[1fr_120px_140px_100px_40px] gap-4 px-6 py-3 bg-ivory/60 text-xs font-medium text-muted uppercase tracking-wider border-b border-border">
              <span>Produit</span>
              <span className="text-center">Prix unitaire</span>
              <span className="text-center">Quantité</span>
              <span className="text-right">Total</span>
              <span />
            </div>

            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  variants={staggerItem}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  layout
                  className="grid grid-cols-[80px_1fr] md:grid-cols-[1fr_120px_140px_100px_40px] gap-4 px-4 md:px-6 py-4 border-b border-border last:border-0 items-center"
                >
                  {/* Product info */}
                  <div className="col-span-2 md:col-span-1 flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-beige-nude-light shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-sm font-medium truncate">
                        {item.name}
                      </h3>
                      {(item.size || item.material || item.stone) && (
                        <p className="text-xs text-muted mt-0.5">
                          {[item.size, item.material, item.stone]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                      <p className="text-xs text-muted mt-0.5">
                        Réf : {item.sku}
                      </p>
                    </div>
                  </div>

                  {/* Unit price */}
                  <div className="hidden md:block text-center text-sm">
                    {formatPrice(item.price)}
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-center">
                    <div className="flex items-center border border-border rounded-lg bg-white">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-2 hover:text-terracotta transition-colors"
                        aria-label="Réduire la quantité"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm tabular-nums min-w-[2.5rem] text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-2 hover:text-terracotta transition-colors"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="text-right text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </div>

                  {/* Remove */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-muted hover:text-destructive transition-colors"
                      aria-label="Supprimer l'article"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Discount Code */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-5 border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium">Code promo</span>
            </div>

            {discountCode ? (
              <div className="flex items-center justify-between bg-success/5 border border-success/20 rounded-lg px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-success">
                    {discountCode}
                  </span>
                  <span className="text-xs text-muted ml-2">
                    ({DISCOUNT_CODES[discountCode]?.label})
                  </span>
                </div>
                <button
                  onClick={removeDiscount}
                  className="text-xs text-muted hover:text-destructive transition-colors"
                >
                  Retirer
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
                    placeholder="Entrez votre code"
                    className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta bg-white"
                  />
                  <button
                    onClick={applyDiscount}
                    className="px-5 py-2.5 bg-foreground text-white text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
                {codeError && (
                  <p className="text-xs text-destructive mt-2">{codeError}</p>
                )}
                {codeSuccess && (
                  <p className="text-xs text-success mt-2">{codeSuccess}</p>
                )}
              </div>
            )}
          </motion.div>

          {/* Gift Wrap */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl p-5 border border-border"
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={giftWrap}
                onChange={(e) => setGiftWrap(e.target.checked)}
                className="w-4 h-4 rounded border-border text-terracotta focus:ring-terracotta accent-terracotta"
              />
              <Gift className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium">
                Emballage cadeau (+3,00 €)
              </span>
            </label>

            <AnimatePresence>
              {giftWrap && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Votre message personnalisé (optionnel)"
                    maxLength={200}
                    rows={3}
                    className="mt-3 w-full px-4 py-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta resize-none bg-ivory/50"
                  />
                  <p className="text-xs text-muted mt-1 text-right">
                    {giftMessage.length}/200
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right Column – Order Summary */}
        <div className="lg:sticky lg:top-32 h-fit">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-border overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <h2 className="font-display text-lg">Récapitulatif</h2>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Sous-total</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Remise</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              {giftWrap && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Emballage cadeau</span>
                  <span>{formatPrice(giftWrapCost)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted">Livraison (estimée)</span>
                <span className={cn(estimatedShipping === 0 && "text-success font-medium")}>
                  {estimatedShipping === 0
                    ? "Offerte"
                    : formatPrice(estimatedShipping)}
                </span>
              </div>

              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-display text-lg">Total</span>
                  <span className="font-display text-lg font-semibold">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-[11px] text-muted mt-1">
                  TVA incluse • Livraison calculée à l&apos;étape suivante
                </p>
              </div>
            </div>

            <div className="px-6 pb-6">
              <Link
                href="/checkout/identification"
                className="btn-primary w-full text-center group"
              >
                Commander
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Trust Badges */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Livraison suivie
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Emballage soigné
            </span>
          </div>
        </div>
      </div>

      {/* Cross-sell */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="mt-16 mb-8"
      >
        <h2 className="font-display text-xl mb-6">Vous aimerez aussi</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {CROSS_SELL.map((product) => (
            <Link
              key={product.id}
              href={product.slug}
              className="group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-beige-nude-light mb-3">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <h3 className="font-display text-sm group-hover:text-terracotta transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-muted mt-0.5">
                {formatPrice(product.price)}
              </p>
            </Link>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
