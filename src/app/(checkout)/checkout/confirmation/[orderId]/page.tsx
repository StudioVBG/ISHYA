"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  CheckCircle,
  Package,
  Mail,
  ShoppingBag,
  UserPlus,
  ArrowRight,
  Calendar,
  Truck,
} from "lucide-react";
import { useCartStore, type CartItemLocal } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function ConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const clearCart = useCartStore((s) => s.clearCart);
  const confettiRef = useRef(false);

  const [orderItems, setOrderItems] = useState<CartItemLocal[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stored = useCartStore.getState();
    const storedEmail = sessionStorage.getItem("checkout_email");

    queueMicrotask(() => {
      if (stored.items.length > 0) {
        setOrderItems([...stored.items]);
        const sub = stored.getSubtotal();
        const shipping = parseFloat(
          sessionStorage.getItem("checkout_shipping_cost") ?? "0"
        );
        const gift = stored.giftWrap ? 3 : 0;
        setOrderTotal(sub - stored.discountAmount + shipping + gift);
        clearCart();
      }
      if (storedEmail) setEmail(storedEmail);
    });
  }, [clearCart]);

  useEffect(() => {
    if (confettiRef.current) return;
    confettiRef.current = true;

    const styles = getComputedStyle(document.documentElement);
    const readVar = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;
    const palette = [
      readVar("--terracotta", "#DF887B"),
      readVar("--gold", "#C5A572"),
      readVar("--beige-nude", "#F2D7C2"),
      readVar("--ivory", "#F8F6F2"),
    ];

    const duration = 2000;
    const end = Date.now() + duration;

    function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: palette,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: palette,
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    }

    frame();
  }, []);

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + 5);
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(estimatedDate);

  return (
    <div className="container py-8 lg:py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
            className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-success" />
          </motion.div>

          <h1 className="font-display text-3xl lg:text-4xl mb-3">
            Merci pour votre commande !
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-ivory border border-border rounded-full px-5 py-2 mb-4"
          >
            <Package className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">
              Commande #{orderId}
            </span>
          </motion.div>

          {email && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 text-sm text-muted"
            >
              <Mail className="w-4 h-4" />
              Un email de confirmation a été envoyé à{" "}
              <strong className="text-foreground">{email}</strong>
            </motion.p>
          )}
        </motion.div>

        {/* Order details */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Estimated delivery */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-terracotta" />
              </div>
              <div>
                <h3 className="font-display text-base mb-0.5">
                  Livraison estimée
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="capitalize">{formattedDate}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order items */}
          {orderItems.length > 0 && (
            <motion.div
              variants={staggerItem}
              className="bg-white rounded-xl border border-border overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border">
                <h3 className="font-display text-base">Détails de la commande</h3>
              </div>

              <div className="divide-y divide-border">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-beige-nude-light shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted">
                        Qté : {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-border bg-ivory/50">
                <div className="flex justify-between">
                  <span className="font-display text-base">Total payé</span>
                  <span className="font-display text-base font-semibold">
                    {formatPrice(orderTotal)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Guest CTA */}
          <motion.div
            variants={staggerItem}
            className="bg-gradient-to-br from-beige-nude-light to-ivory rounded-xl border border-border p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <UserPlus className="w-6 h-6 text-gold" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base mb-1">
                  Créez un compte pour suivre votre commande
                </h3>
                <p className="text-sm text-muted mb-4">
                  Accédez à votre historique, suivez vos livraisons et gagnez
                  des points fidélité.
                </p>
                <Link
                  href="/inscription"
                  className="btn-gold text-sm inline-flex"
                >
                  Créer mon compte
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            variants={staggerItem}
            className="grid sm:grid-cols-2 gap-4"
          >
            <Link
              href="/boutique"
              className="btn-primary text-center group"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continuer mes achats
            </Link>
            <Link
              href="/compte/commandes"
              className="btn-secondary text-center group"
            >
              <Package className="w-4 h-4 mr-2" />
              Suivre ma commande
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
