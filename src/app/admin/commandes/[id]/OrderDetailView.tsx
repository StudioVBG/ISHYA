"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Truck,
  CreditCard,
  RefreshCw,
  Package,
  MapPin,
  User,
  Save,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminOrderDetail } from "@/lib/queries/admin";
import {
  markOrderShipped,
  refundOrder,
  updateInternalNote,
  updateOrderStatus,
} from "./actions";

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Payée" },
  { value: "processing", label: "En préparation" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "on_hold", label: "En pause" },
  { value: "cancelled", label: "Annulée" },
];

const STATUS_PILL: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
  refunded: "bg-orange-50 text-orange-700",
  partially_refunded: "bg-orange-50 text-orange-700",
  on_hold: "bg-gray-100 text-gray-700",
  failed: "bg-red-50 text-red-700",
};

export function OrderDetailView({ order }: { order: AdminOrderDetail }) {
  const [statusValue, setStatusValue] = useState(order.status);
  const [carrier, setCarrier] = useState(order.shipment?.carrier ?? "Colissimo");
  const [trackingNumber, setTrackingNumber] = useState(
    order.shipment?.trackingNumber ?? "",
  );
  const [internalNote, setInternalNote] = useState(order.internalNote ?? "");
  const [isStatusPending, startStatusTransition] = useTransition();
  const [isShipPending, startShipTransition] = useTransition();
  const [isRefundPending, startRefundTransition] = useTransition();
  const [isNotePending, startNoteTransition] = useTransition();

  const handleStatusChange = (next: string) => {
    setStatusValue(next);
    startStatusTransition(async () => {
      const res = await updateOrderStatus(order.id, next);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        setStatusValue(order.status);
        return;
      }
      toast.success("Statut mis à jour");
    });
  };

  const handleShip = () => {
    startShipTransition(async () => {
      const res = await markOrderShipped(order.id, carrier, trackingNumber);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Commande marquée comme expédiée — email envoyé");
    });
  };

  const handleRefund = () => {
    if (
      !window.confirm(
        "Confirmer le remboursement intégral via Stripe ? Cette action est irréversible.",
      )
    )
      return;
    startRefundTransition(async () => {
      const res = await refundOrder(order.id);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Remboursement effectué");
    });
  };

  const handleSaveNote = () => {
    startNoteTransition(async () => {
      const res = await updateInternalNote(order.id, internalNote);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Note enregistrée");
    });
  };

  const addr = order.shippingAddress;
  const billing = order.billingAddress;

  const canShip = ["confirmed", "processing"].includes(order.status);
  const canRefund =
    !!order.payment?.stripePaymentIntentId &&
    order.payment?.status !== "refunded" &&
    !["cancelled", "refunded"].includes(order.status);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <Link
          href="/admin/commandes"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux commandes
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-mono text-xl font-bold text-gray-900">
              {order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Passée le {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium",
                STATUS_PILL[order.status] ?? "bg-gray-100 text-gray-700",
              )}
            >
              {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ??
                order.status}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Articles ({order.items.length})
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[item.variantName, item.sku]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Livraison</span>
                <span>{formatPrice(order.shippingTotal)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Remise</span>
                  <span>-{formatPrice(order.discountTotal)}</span>
                </div>
              )}
              {order.taxTotal > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>TVA</span>
                  <span>{formatPrice(order.taxTotal)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(order.grandTotal)}</span>
              </div>
            </div>
          </motion.div>

          {(order.giftWrap || order.giftMessage || order.customerNote) && (
            <motion.div
              variants={staggerItem}
              className="bg-amber-50 rounded-xl border border-amber-100 p-5"
            >
              {order.giftWrap && (
                <p className="text-sm font-medium text-amber-800 mb-1">
                  🎁 Emballage cadeau demandé
                </p>
              )}
              {order.giftMessage && (
                <p className="text-sm italic text-amber-900 mb-2">
                  « {order.giftMessage} »
                </p>
              )}
              {order.customerNote && (
                <div className="mt-2 pt-2 border-t border-amber-100">
                  <p className="text-xs font-medium text-amber-800 mb-1">
                    Note du client
                  </p>
                  <p className="text-sm text-amber-900">{order.customerNote}</p>
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Note interne
            </h2>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Visible par l'équipe uniquement..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta resize-none"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleSaveNote}
                disabled={
                  isNotePending || internalNote === (order.internalNote ?? "")
                }
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isNotePending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Enregistrer
              </button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <h3 className="font-semibold text-gray-900 mb-3">Statut</h3>
            <div className="relative">
              <select
                value={statusValue}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isStatusPending}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {isStatusPending && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>
          </motion.div>

          {canShip && (
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <h3 className="font-semibold text-gray-900 mb-3">
                Marquer comme expédiée
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="Transporteur (ex. Colissimo)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
                />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="N° de suivi"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
                />
                <button
                  onClick={handleShip}
                  disabled={
                    isShipPending || !carrier.trim() || !trackingNumber.trim()
                  }
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isShipPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Truck className="w-4 h-4" />
                  )}
                  Marquer expédiée + email
                </button>
              </div>
            </motion.div>
          )}

          {canRefund && (
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Remboursement
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Rembourse {formatPrice(order.grandTotal)} via Stripe.
              </p>
              <button
                onClick={handleRefund}
                disabled={isRefundPending}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-orange-200 text-orange-700 bg-orange-50 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRefundPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Rembourser via Stripe
              </button>
            </motion.div>
          )}

          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Client</h3>
            </div>
            <div className="space-y-1 text-sm">
              {addr && (
                <p className="font-medium text-gray-900">
                  {[addr.firstName, addr.lastName].filter(Boolean).join(" ") ||
                    "—"}
                </p>
              )}
              {order.email && (
                <p className="text-gray-600">{order.email}</p>
              )}
              {order.phone && (
                <p className="text-gray-600">{order.phone}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {order.userId ? "Client connecté" : "Commande invitée"}
              </p>
            </div>
          </motion.div>

          {addr && (
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-gray-900">
                  Adresse de livraison
                </h3>
              </div>
              <div className="text-sm text-gray-600 space-y-0.5">
                {addr.line1 && <p>{addr.line1}</p>}
                {addr.line2 && <p>{addr.line2}</p>}
                {(addr.postalCode || addr.city) && (
                  <p>
                    {[addr.postalCode, addr.city].filter(Boolean).join(" ")}
                  </p>
                )}
                {addr.country && <p>{addr.country}</p>}
              </div>
            </motion.div>
          )}

          {billing && billing !== addr && (
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <h3 className="font-semibold text-gray-900 mb-3">
                Adresse de facturation
              </h3>
              <div className="text-sm text-gray-600 space-y-0.5">
                {billing.line1 && <p>{billing.line1}</p>}
                {billing.line2 && <p>{billing.line2}</p>}
                {(billing.postalCode || billing.city) && (
                  <p>
                    {[billing.postalCode, billing.city]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                )}
                {billing.country && <p>{billing.country}</p>}
              </div>
            </motion.div>
          )}

          {order.payment && (
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Paiement</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">
                  Statut :{" "}
                  <span className="font-medium text-gray-900">
                    {order.payment.status ?? "—"}
                  </span>
                </p>
                <p className="text-gray-600">
                  Montant :{" "}
                  <span className="font-medium text-gray-900">
                    {formatPrice(order.payment.amount)}
                  </span>
                </p>
                {order.payment.paidAt && (
                  <p className="text-xs text-gray-400">
                    Payée le {formatDate(order.payment.paidAt)}
                  </p>
                )}
                {order.payment.refundedAt && (
                  <p className="text-xs text-orange-500">
                    Remboursée le {formatDate(order.payment.refundedAt)}
                  </p>
                )}
                {order.payment.stripeReceiptUrl && (
                  <a
                    href={order.payment.stripeReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-terracotta hover:underline mt-2"
                  >
                    Reçu Stripe
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {order.shipment && (
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Expédition</h3>
              </div>
              <div className="space-y-1 text-sm">
                {order.shipment.carrier && (
                  <p className="text-gray-600">
                    Transporteur :{" "}
                    <span className="font-medium text-gray-900">
                      {order.shipment.carrier}
                    </span>
                  </p>
                )}
                {order.shipment.trackingNumber && (
                  <p className="text-gray-600">
                    Suivi :{" "}
                    <span className="font-mono text-xs text-gray-900">
                      {order.shipment.trackingNumber}
                    </span>
                  </p>
                )}
                {order.shipment.shippedAt && (
                  <p className="text-xs text-gray-400">
                    Expédiée le {formatDate(order.shipment.shippedAt)}
                  </p>
                )}
                {order.shipment.estimatedDelivery && (
                  <p className="text-xs text-gray-400">
                    Livraison estimée :{" "}
                    {formatDate(order.shipment.estimatedDelivery)}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
