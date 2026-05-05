"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Lock, Shield, ArrowLeft, CreditCard } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { cn, formatPrice } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function PaymentForm({
  total,
  orderNumber,
}: {
  total: number;
  clientSecret: string;
  orderNumber: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/confirmation/${orderNumber}`,
      },
    });

    if (stripeError) {
      setError(
        stripeError.message ?? "Une erreur est survenue lors du paiement."
      );
      setIsProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
          defaultValues: {
            billingDetails: {
              address: { country: "FR" },
            },
          },
        }}
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive"
        >
          {error}
        </motion.div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="btn-primary w-full gap-2"
      >
        {isProcessing ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Payer {formatPrice(total)}
          </>
        )}
      </button>
    </form>
  );
}

export default function PaiementPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const giftWrap = useCartStore((s) => s.giftWrap);
  const giftMessage = useCartStore((s) => s.giftMessage);
  const discountAmount = useCartStore((s) => s.discountAmount);
  const discountCode = useCartStore((s) => s.discountCode);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const shippingCost = parseFloat(
    typeof window !== "undefined"
      ? sessionStorage.getItem("checkout_shipping_cost") ?? "4.9"
      : "4.9"
  );
  const giftWrapCost = giftWrap ? 3 : 0;
  const total = subtotal - discountAmount + shippingCost + giftWrapCost;

  const createPaymentIntent = useCallback(async () => {
    if (items.length === 0) return;

    try {
      const email =
        typeof window !== "undefined"
          ? sessionStorage.getItem("checkout_email") ?? undefined
          : undefined;

      const addressRaw =
        typeof window !== "undefined"
          ? sessionStorage.getItem("checkout_address")
          : null;
      const shippingAddress = addressRaw ? JSON.parse(addressRaw) : undefined;

      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            name: i.name,
            variantName: [i.size, i.material, i.stone]
              .filter(Boolean)
              .join(" · "),
            sku: i.sku,
            price: i.price,
            quantity: i.quantity,
          })),
          shippingCost,
          giftWrap,
          giftMessage,
          discountAmount,
          discountCode,
          email,
          shippingAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoadError(data.error ?? "Erreur lors de la création du paiement");
        return;
      }

      setClientSecret(data.clientSecret);
      setOrderNumber(data.orderNumber);
      if (typeof window !== "undefined" && data.orderNumber) {
        sessionStorage.setItem("checkout_order_number", data.orderNumber);
      }
    } catch {
      setLoadError("Impossible de se connecter au serveur de paiement");
    }
  }, [items, shippingCost, giftWrap, giftMessage, discountAmount, discountCode]);

  useEffect(() => {
    queueMicrotask(() => {
      void createPaymentIntent();
    });
  }, [createPaymentIntent]);

  return (
    <div className="container py-8 lg:py-12">
      <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
        {/* Left – Payment */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-2xl lg:text-3xl mb-1">
              Paiement
            </h1>
            <p className="text-sm text-muted">
              Finalisez votre commande en toute sécurité
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-4 h-4 text-terracotta" />
              <h2 className="font-display text-base">
                Informations de paiement
              </h2>
            </div>

            {loadError ? (
              <div className="text-center py-8">
                <p className="text-destructive text-sm mb-4">{loadError}</p>
                <button
                  onClick={createPaymentIntent}
                  className="btn-secondary text-sm"
                >
                  Réessayer
                </button>
              </div>
            ) : !clientSecret ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 border-3 border-terracotta/20 border-t-terracotta rounded-full animate-spin" />
                <p className="text-sm text-muted">
                  Préparation du paiement sécurisé...
                </p>
              </div>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#DF887B",
                      colorBackground: "#FFFFFF",
                      colorText: "#1a1a1a",
                      fontFamily: "'DM Sans', sans-serif",
                      borderRadius: "8px",
                      spacingUnit: "4px",
                    },
                    rules: {
                      ".Input": {
                        border: "1px solid #E8E0D8",
                        boxShadow: "none",
                        padding: "12px 16px",
                      },
                      ".Input:focus": {
                        border: "1px solid #DF887B",
                        boxShadow: "0 0 0 3px rgba(223,136,123,0.15)",
                      },
                      ".Label": {
                        fontWeight: "500",
                        fontSize: "14px",
                        marginBottom: "6px",
                      },
                    },
                  },
                  locale: "fr",
                }}
              >
                <PaymentForm
                  total={total}
                  clientSecret={clientSecret}
                  orderNumber={orderNumber ?? ""}
                />
              </Elements>
            )}
          </motion.div>

          {/* Security badges */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-6 py-4"
          >
            <div className="flex items-center gap-2 text-xs text-muted">
              <Shield className="w-4 h-4" />
              <span>Paiement 100% sécurisé</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <Lock className="w-4 h-4" />
              <span>Chiffrement SSL</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span className="font-semibold text-stripe-brand">stripe</span>
            </div>
          </motion.div>

          {/* Back */}
          <div>
            <button
              onClick={() => router.push("/checkout/livraison")}
              className="btn-secondary text-sm group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
              Retour à la livraison
            </button>
          </div>
        </div>

        {/* Right – Order Summary */}
        <div className="lg:sticky lg:top-32 h-fit">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-border overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <h2 className="font-display text-lg">Récapitulatif</h2>
            </div>

            <div className="p-6 space-y-3 border-b border-border max-h-52 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-beige-nude-light shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.name}</p>
                    {(item.size || item.material) && (
                      <p className="text-xs text-muted">
                        {[item.size, item.material].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-6 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
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
                <span className="text-muted">Livraison</span>
                <span className={cn(shippingCost === 0 && "text-success font-medium")}>
                  {shippingCost === 0
                    ? "Offerte"
                    : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-display text-xl">Total</span>
                  <span className="font-display text-xl font-semibold">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-[11px] text-muted mt-1">TVA incluse</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
