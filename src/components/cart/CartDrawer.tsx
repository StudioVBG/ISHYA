"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Gift,
  Truck,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import { slideInRight, fadeIn, drawerTransition } from "@/lib/animations";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const giftWrap = useCartStore((s) => s.giftWrap);
  const setGiftWrap = useCartStore((s) => s.setGiftWrap);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const itemCount = useCartStore((s) => s.getItemCount());

  const giftWrapCost = giftWrap ? 3 : 0;
  const total = subtotal + giftWrapCost;
  const shippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const shippingProgress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
  const freeShipping = total >= FREE_SHIPPING_THRESHOLD;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    if (isOpen) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={drawerTransition}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-bone shadow-[0_0_60px_rgba(0,0,0,0.15)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-steel">
                  Panier
                </span>
                <span className="font-mono text-sm tabular-nums text-ink">
                  {String(itemCount).padStart(2, "0")}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="min-w-11 min-h-11 -mr-2 flex items-center justify-center hover:text-ember transition-colors"
                aria-label="Fermer le panier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <ShoppingBag className="w-12 h-12 text-steel-soft mb-6" strokeWidth={1.25} />
                <p
                  className="font-display text-2xl text-ink mb-3"
                  style={{
                    fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'WONK' 1",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Votre panier est vide
                </p>
                <p className="text-sm text-steel mb-8">
                  Découvrez nos bijoux floraux uniques.
                </p>
                <Link
                  href="/boutique"
                  onClick={closeCart}
                  className="btn-primary"
                >
                  Découvrir la boutique
                </Link>
              </div>
            ) : (
              <>
                {/* Shipping progress */}
                <div className="px-6 py-4 bg-bone-soft border-b border-border">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Truck className="w-3.5 h-3.5 text-ember" strokeWidth={1.5} />
                    {freeShipping ? (
                      <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-success">
                        Livraison offerte
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-steel">
                        Plus que{" "}
                        <span className="text-ink tabular-nums">
                          {formatPrice(shippingRemaining)}
                        </span>{" "}
                        pour la livraison offerte
                      </span>
                    )}
                  </div>
                  <div className="h-px bg-border overflow-hidden">
                    <motion.div
                      className="h-full bg-ember"
                      initial={{ width: 0 }}
                      animate={{ width: `${shippingProgress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-4 border-b border-border last:border-0"
                    >
                      <div className="relative w-20 h-24 overflow-hidden bg-bone-soft shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-ink truncate leading-snug">
                          {item.name}
                        </h3>
                        {(item.size || item.material) && (
                          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-steel mt-1">
                            {[item.size, item.material]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                        <p className="font-mono text-sm tabular-nums text-ink mt-1.5">
                          {formatPrice(item.price)}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-ink/15">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="min-w-9 h-9 flex items-center justify-center text-ink hover:bg-ink hover:text-bone transition-colors"
                              aria-label="Réduire la quantité"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 font-mono text-sm tabular-nums min-w-[2rem] text-center text-ink">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="min-w-9 h-9 flex items-center justify-center text-ink hover:bg-ink hover:text-bone transition-colors"
                              aria-label="Augmenter la quantité"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="min-w-11 min-h-11 flex items-center justify-center text-steel hover:text-destructive transition-colors"
                            aria-label="Supprimer l'article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gift wrap */}
                <div className="px-6 py-4 border-t border-border">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                      className="w-4 h-4 border-ink/30 accent-ink"
                    />
                    <Gift className="w-3.5 h-3.5 text-ember" strokeWidth={1.5} />
                    <span className="text-sm text-ink group-hover:text-ember transition-colors">
                      Emballage cadeau{" "}
                      <span className="font-mono text-xs text-steel ml-1">+3€</span>
                    </span>
                  </label>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-steel">
                      Sous-total
                    </span>
                    <span className="font-mono text-lg tabular-nums text-ink">
                      {formatPrice(total)}
                    </span>
                  </div>

                  {Math.floor(total) > 0 && (
                    <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase text-ember bg-ember/8 px-3 py-2.5">
                      <Sparkles className="w-3 h-3 shrink-0" aria-hidden strokeWidth={1.5} />
                      <span>
                        +{" "}
                        <span className="tabular-nums">{Math.floor(total)}</span> point
                        {Math.floor(total) > 1 ? "s" : ""} de fidélité
                      </span>
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Link
                      href="/panier"
                      onClick={closeCart}
                      className="btn-secondary text-center"
                    >
                      Mon panier
                    </Link>
                    <Link
                      href="/checkout/identification"
                      onClick={closeCart}
                      className="btn-primary text-center"
                    >
                      Commander
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
