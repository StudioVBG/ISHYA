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
import { StatusBadge, type OrderStatus } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
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
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux commandes
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-mono text-xl font-bold text-foreground">
              {order.orderNumber}
            </h1>
            <p className="text-sm text-muted mt-1">
              Passée le {formatDate(order.createdAt)}
            </p>
          </div>
          <StatusBadge status={order.status as OrderStatus} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6"
          >
            <h2 className="text-base font-semibold text-foreground mb-4">
              Articles ({order.items.length})
            </h2>
            <div className="divide-y divide-border/50">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="w-12 h-12 rounded-lg bg-muted-soft flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {[item.variantName, item.sku]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <p className="text-sm text-muted">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatPrice(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 space-y-1.5 text-sm tabular-nums">
              <div className="flex justify-between text-muted">
                <span>Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Livraison</span>
                <span>{formatPrice(order.shippingTotal)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-success">
                  <span>Remise</span>
                  <span>-{formatPrice(order.discountTotal)}</span>
                </div>
              )}
              {order.appliedDiscounts.length > 0 && (
                <div className="pl-4 -mt-1 space-y-0.5 text-xs text-muted">
                  {order.appliedDiscounts.map((d) => (
                    <div key={d.id} className="flex justify-between">
                      <span className="font-mono">{d.code}</span>
                      <span>-{formatPrice(d.amountSaved)}</span>
                    </div>
                  ))}
                </div>
              )}
              {order.taxTotal > 0 && (
                <div className="flex justify-between text-muted">
                  <span>TVA</span>
                  <span>{formatPrice(order.taxTotal)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base text-foreground pt-2 border-t border-border/50">
                <span>Total</span>
                <span>{formatPrice(order.grandTotal)}</span>
              </div>
            </div>
          </motion.div>

          {(order.giftWrap || order.giftMessage || order.customerNote) && (
            <motion.div
              variants={staggerItem}
              className="bg-warning-soft rounded-xl border border-warning/20 p-5"
            >
              {order.giftWrap && (
                <p className="text-sm font-medium text-warning mb-1">
                  🎁 Emballage cadeau demandé
                </p>
              )}
              {order.giftMessage && (
                <p className="text-sm italic text-warning mb-2">
                  « {order.giftMessage} »
                </p>
              )}
              {order.customerNote && (
                <div className="mt-2 pt-2 border-t border-warning/20">
                  <p className="text-xs font-medium text-warning mb-1">
                    Note du client
                  </p>
                  <p className="text-sm text-warning">{order.customerNote}</p>
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6"
          >
            <h2 className="text-base font-semibold text-foreground mb-4">
              Note interne
            </h2>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Visible par l'équipe uniquement..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta resize-none"
            />
            <div className="flex justify-end mt-3">
              <Button
                size="sm"
                icon={Save}
                loading={isNotePending}
                disabled={
                  isNotePending || internalNote === (order.internalNote ?? "")
                }
                onClick={handleSaveNote}
                className="bg-foreground text-white hover:bg-foreground/85"
              >
                Enregistrer
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-3">Statut</h3>
            <div className="relative">
              <select
                value={statusValue}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isStatusPending}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {isStatusPending && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted" />
              )}
            </div>
          </motion.div>

          {canShip && (
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-xl border border-border p-5"
            >
              <h3 className="font-semibold text-foreground mb-3">
                Marquer comme expédiée
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="Transporteur (ex. Colissimo)"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
                />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="N° de suivi"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
                />
                <Button
                  fullWidth
                  size="md"
                  icon={Truck}
                  loading={isShipPending}
                  disabled={
                    isShipPending || !carrier.trim() || !trackingNumber.trim()
                  }
                  onClick={handleShip}
                  className="bg-accent-purple text-white hover:bg-accent-purple/90"
                >
                  Marquer expédiée + email
                </Button>
              </div>
            </motion.div>
          )}

          {canRefund && (
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-xl border border-border p-5"
            >
              <h3 className="font-semibold text-foreground mb-2">
                Remboursement
              </h3>
              <p className="text-xs text-muted mb-3">
                Rembourse {formatPrice(order.grandTotal)} via Stripe.
              </p>
              <Button
                fullWidth
                size="md"
                variant="ghost"
                icon={RefreshCw}
                loading={isRefundPending}
                disabled={isRefundPending}
                onClick={handleRefund}
                className="bg-warning-soft text-warning hover:bg-warning/15 hover:text-warning border border-warning/20"
              >
                Rembourser via Stripe
              </Button>
            </motion.div>
          )}

          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-border p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-muted" />
              <h3 className="font-semibold text-foreground">Client</h3>
            </div>
            <div className="space-y-1 text-sm">
              {addr && (
                <p className="font-medium text-foreground">
                  {[addr.firstName, addr.lastName].filter(Boolean).join(" ") ||
                    "—"}
                </p>
              )}
              {order.email && <p className="text-muted">{order.email}</p>}
              {order.phone && <p className="text-muted">{order.phone}</p>}
              <p className="text-xs text-muted-light mt-2">
                {order.userId ? "Client connecté" : "Commande invitée"}
              </p>
            </div>
          </motion.div>

          {addr && (
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-xl border border-border p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-muted" />
                <h3 className="font-semibold text-foreground">
                  Adresse de livraison
                </h3>
              </div>
              <div className="text-sm text-muted space-y-0.5">
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
              className="bg-white rounded-xl border border-border p-5"
            >
              <h3 className="font-semibold text-foreground mb-3">
                Adresse de facturation
              </h3>
              <div className="text-sm text-muted space-y-0.5">
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
              className="bg-white rounded-xl border border-border p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-muted" />
                <h3 className="font-semibold text-foreground">Paiement</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted">
                  Statut :{" "}
                  <span className="font-medium text-foreground">
                    {order.payment.status ?? "—"}
                  </span>
                </p>
                <p className="text-muted">
                  Montant :{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {formatPrice(order.payment.amount)}
                  </span>
                </p>
                {order.payment.paidAt && (
                  <p className="text-xs text-muted-light">
                    Payée le {formatDate(order.payment.paidAt)}
                  </p>
                )}
                {order.payment.refundedAt && (
                  <p className="text-xs text-warning">
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
              className="bg-white rounded-xl border border-border p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-muted" />
                <h3 className="font-semibold text-foreground">Expédition</h3>
              </div>
              <div className="space-y-1 text-sm">
                {order.shipment.carrier && (
                  <p className="text-muted">
                    Transporteur :{" "}
                    <span className="font-medium text-foreground">
                      {order.shipment.carrier}
                    </span>
                  </p>
                )}
                {order.shipment.trackingNumber && (
                  <p className="text-muted">
                    Suivi :{" "}
                    <span className="font-mono text-xs text-foreground">
                      {order.shipment.trackingNumber}
                    </span>
                  </p>
                )}
                {order.shipment.shippedAt && (
                  <p className="text-xs text-muted-light">
                    Expédiée le {formatDate(order.shipment.shippedAt)}
                  </p>
                )}
                {order.shipment.estimatedDelivery && (
                  <p className="text-xs text-muted-light">
                    Livraison estimée :{" "}
                    {formatDate(order.shipment.estimatedDelivery)}
                  </p>
                )}
              </div>

              {order.trackingEvents.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
                    Historique de suivi
                  </p>
                  <ol className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {order.trackingEvents.map((e, idx) => (
                      <li key={e.id} className="flex gap-3 text-sm">
                        <div className="relative shrink-0">
                          <span
                            className={cn(
                              "block w-2 h-2 rounded-full mt-1.5",
                              idx === 0
                                ? "bg-terracotta"
                                : "bg-muted-light",
                            )}
                          />
                          {idx < order.trackingEvents.length - 1 ? (
                            <span className="absolute left-1/2 top-3 -translate-x-1/2 w-px h-full bg-border" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            {e.status}
                          </p>
                          {e.description ? (
                            <p className="text-xs text-muted">
                              {e.description}
                            </p>
                          ) : null}
                          <p className="text-[10px] text-muted-light">
                            {formatDate(e.occurredAt)}
                            {e.location ? ` · ${e.location}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
