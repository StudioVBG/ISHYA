"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Minus, Plus, Trash2, Gift, Truck } from "lucide-react";
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
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-display text-lg">
                Mon Panier ({itemCount})
              </h2>
              <button
                onClick={closeCart}
                className="min-w-11 min-h-11 -mr-2 flex items-center justify-center hover:text-terracotta transition-colors"
                aria-label="Fermer le panier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <ShoppingBag className="w-16 h-16 text-muted-light mb-4" />
                <p className="font-display text-lg mb-2">Votre panier est vide</p>
                <p className="text-sm text-muted mb-6">
                  Découvrez nos bijoux floraux uniques
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
                <div className="px-6 py-3 bg-ivory">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-gold" />
                    {freeShipping ? (
                      <span className="text-xs text-success font-medium">
                        Félicitations, la livraison est offerte !
                      </span>
                    ) : (
                      <span className="text-xs text-muted">
                        Plus que{" "}
                        <strong className="text-foreground">
                          {formatPrice(shippingRemaining)}
                        </strong>{" "}
                        pour la livraison offerte !
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gold rounded-full"
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
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-beige-nude-light shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-sm font-medium truncate">
                          {item.name}
                        </h3>
                        {(item.size || item.material) && (
                          <p className="text-xs text-muted mt-0.5">
                            {[item.size, item.material]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                        <p className="text-sm font-medium mt-1">
                          {formatPrice(item.price)}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-border rounded-lg">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="min-w-11 min-h-11 flex items-center justify-center hover:text-terracotta transition-colors"
                              aria-label="Réduire la quantité"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-sm tabular-nums min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="min-w-11 min-h-11 flex items-center justify-center hover:text-terracotta transition-colors"
                              aria-label="Augmenter la quantité"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="min-w-11 min-h-11 flex items-center justify-center text-muted hover:text-destructive transition-colors"
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
                <div className="px-6 py-3 border-t border-border">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-terracotta focus:ring-terracotta accent-terracotta"
                    />
                    <Gift className="w-4 h-4 text-gold" />
                    <span className="text-sm">Emballage cadeau (+3€)</span>
                  </label>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Sous-total</span>
                    <span className="font-display font-semibold">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/panier"
                      onClick={closeCart}
                      className="btn-secondary text-sm text-center"
                    >
                      Voir mon panier
                    </Link>
                    <Link
                      href="/checkout/identification"
                      onClick={closeCart}
                      className="btn-primary text-sm text-center"
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
