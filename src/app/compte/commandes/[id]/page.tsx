"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Check,
  Clock,
  Package,
  Truck,
  MapPin,
  FileText,
  RotateCcw,
  MessageCircle,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const timelineSteps = [
  {
    label: "Commande reçue",
    date: "15 mars 2026 - 10:00",
    icon: Clock,
    completed: true,
  },
  {
    label: "Paiement confirmé",
    date: "15 mars 2026 - 10:02",
    icon: CreditCard,
    completed: true,
  },
  {
    label: "En préparation",
    date: "15 mars 2026 - 14:30",
    icon: Package,
    completed: true,
  },
  {
    label: "Expédiée",
    date: "16 mars 2026 - 09:15",
    icon: Truck,
    completed: true,
  },
  {
    label: "Livrée",
    date: "Livraison estimée : 19 mars 2026",
    icon: MapPin,
    completed: false,
  },
];

const demoItems = [
  {
    id: "prod-001",
    name: "Collier Fleur d'Oranger",
    variant: "45cm - Or",
    qty: 1,
    price: 45,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=120&h=120&fit=crop",
  },
  {
    id: "prod-010",
    name: "Boucles Goutte de Rosée",
    variant: "Unique - Argent",
    qty: 1,
    price: 36,
    image:
      "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=120&h=120&fit=crop",
  },
];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const subtotal = demoItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= 60 ? 0 : 4.9;
  const discount = 0;
  const total = subtotal + shipping - discount;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/compte/commandes"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-terracotta transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour aux commandes
      </Link>

      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="font-display text-2xl font-semibold">
            Commande {orderId}
          </h1>
          <p className="text-sm text-muted mt-1">
            Passée le {formatDate("2026-03-15T10:00:00Z")}
          </p>
        </div>
        <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 w-fit">
          Expédiée
        </span>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid lg:grid-cols-3 gap-6"
      >
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6"
          >
            <h2 className="font-display text-lg font-semibold mb-6">
              Suivi de commande
            </h2>
            <div className="relative">
              {timelineSteps.map((step, i) => {
                const Icon = step.icon;
                const isLast = i === timelineSteps.length - 1;
                return (
                  <div key={step.label} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10",
                          step.completed
                            ? "bg-terracotta text-white"
                            : "bg-gray-100 text-muted"
                        )}
                      >
                        {step.completed ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className={cn(
                            "w-0.5 flex-1 mt-1",
                            step.completed ? "bg-terracotta" : "bg-gray-200"
                          )}
                        />
                      )}
                    </div>
                    <div className="pb-2">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          !step.completed && "text-muted"
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted mt-0.5">{step.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link
              href={`/compte/commandes/${orderId}/suivi`}
              className="inline-flex items-center gap-1.5 text-sm text-terracotta hover:text-terracotta-dark font-medium mt-4"
            >
              Voir le suivi détaillé
              <Truck className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Items */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6"
          >
            <h2 className="font-display text-lg font-semibold mb-4">
              Articles
            </h2>
            <div className="space-y-4">
              {demoItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 last:pb-0 last:border-0 border-b border-border"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-beige-nude-light shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted mt-0.5">{item.variant}</p>
                    <p className="text-xs text-muted">Qté : {item.qty}</p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">
                    {formatPrice(item.price)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            variants={staggerItem}
            className="flex flex-wrap gap-3"
          >
            <button className="btn-secondary text-sm gap-2">
              <FileText className="w-4 h-4" />
              Télécharger la facture
            </button>
            <Link
              href={`/compte/retours/nouveau/${orderId}`}
              className="btn-secondary text-sm gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Demander un retour
            </Link>
            <button className="btn-secondary text-sm gap-2">
              <MessageCircle className="w-4 h-4" />
              Contacter le support
            </button>
            <button className="btn-primary text-sm gap-2">
              <RefreshCw className="w-4 h-4" />
              Re-commander
            </button>
          </motion.div>
        </div>

        {/* Right column - Summary */}
        <div className="space-y-6">
          {/* Totals */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-display font-semibold mb-4">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Livraison</span>
                <span className={cn(shipping === 0 && "text-success font-medium")}>
                  {shipping === 0 ? "Offerte" : formatPrice(shipping)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-terracotta">
                  <span>Réduction</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </motion.div>

          {/* Shipping address */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-display font-semibold mb-3">
              Adresse de livraison
            </h3>
            <div className="text-sm text-muted space-y-0.5">
              <p className="text-foreground font-medium">Marie Dupont</p>
              <p>15 Rue des Fleurs, Apt 3B</p>
              <p>75004 Paris</p>
              <p>France</p>
            </div>
          </motion.div>

          {/* Billing address */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-display font-semibold mb-3">
              Adresse de facturation
            </h3>
            <div className="text-sm text-muted space-y-0.5">
              <p className="text-foreground font-medium">Marie Dupont</p>
              <p>15 Rue des Fleurs, Apt 3B</p>
              <p>75004 Paris</p>
              <p>France</p>
            </div>
          </motion.div>

          {/* Payment */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-display font-semibold mb-3">Paiement</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                VISA
              </div>
              <span className="text-sm">**** **** **** 4242</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
