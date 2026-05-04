import { notFound } from "next/navigation";
import Link from "next/link";
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
  CreditCard,
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { StatusBadge, type OrderStatus } from "@/components/ui/StatusBadge";
import {
  getCurrentUserOrderByNumber,
  type AccountOrderDetail,
} from "@/lib/queries/account";

function buildTimeline(order: AccountOrderDetail) {
  const reachedConfirmed = [
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ].includes(order.status);
  const reachedProcessing = ["processing", "shipped", "delivered"].includes(
    order.status,
  );
  const reachedShipped =
    ["shipped", "delivered"].includes(order.status) ||
    Boolean(order.shipment?.shippedAt);
  const reachedDelivered =
    order.status === "delivered" || Boolean(order.shipment?.deliveredAt);

  return [
    {
      label: "Commande reçue",
      date: formatDate(order.createdAt),
      icon: Clock,
      completed: true,
    },
    {
      label: "Paiement confirmé",
      date: reachedConfirmed ? formatDate(order.createdAt) : "En attente",
      icon: CreditCard,
      completed: reachedConfirmed,
    },
    {
      label: "En préparation",
      date: reachedProcessing ? "En cours" : "À venir",
      icon: Package,
      completed: reachedProcessing,
    },
    {
      label: "Expédiée",
      date: order.shipment?.shippedAt
        ? formatDate(order.shipment.shippedAt)
        : "À venir",
      icon: Truck,
      completed: reachedShipped,
    },
    {
      label: "Livrée",
      date: order.shipment?.deliveredAt
        ? formatDate(order.shipment.deliveredAt)
        : order.shipment?.estimatedDelivery
          ? `Estimée : ${formatDate(order.shipment.estimatedDelivery)}`
          : "À venir",
      icon: MapPin,
      completed: reachedDelivered,
    },
  ];
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getCurrentUserOrderByNumber(id);
  if (!order) notFound();

  const timeline = buildTimeline(order);
  const addr = order.shippingAddress;

  return (
    <div>
      <Link
        href="/compte/commandes"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-terracotta transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour aux commandes
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            Commande {order.orderNumber}
          </h1>
          <p className="text-sm text-muted mt-1">
            Passée le {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-display text-lg font-semibold mb-6">
              Suivi de commande
            </h2>
            <div className="relative">
              {timeline.map((step, i) => {
                const Icon = step.icon;
                const isLast = i === timeline.length - 1;
                return (
                  <div key={step.label} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10",
                          step.completed
                            ? "bg-terracotta text-white"
                            : "bg-gray-100 text-muted",
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
                            step.completed ? "bg-terracotta" : "bg-gray-200",
                          )}
                        />
                      )}
                    </div>
                    <div className="pb-2">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          !step.completed && "text-muted",
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
            {order.shipment?.trackingNumber && (
              <Link
                href={`/compte/commandes/${order.orderNumber}/suivi`}
                className="inline-flex items-center gap-1.5 text-sm text-terracotta hover:text-terracotta-dark font-medium mt-4"
              >
                Voir le suivi détaillé
                <Truck className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-display text-lg font-semibold mb-4">
              Articles
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 last:pb-0 last:border-0 border-b border-border"
                >
                  <div className="w-16 h-16 rounded-lg bg-beige-nude-light flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-terracotta/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.productName}
                    </p>
                    {item.variantName && (
                      <p className="text-xs text-muted mt-0.5">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-xs text-muted">Qté : {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">
                    {formatPrice(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary text-sm gap-2">
              <FileText className="w-4 h-4" />
              Télécharger la facture
            </button>
            {(order.status === "delivered" || order.status === "shipped") && (
              <Link
                href={`/compte/retours/nouveau/${order.id}`}
                className="btn-secondary text-sm gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Demander un retour
              </Link>
            )}
            <Link href="/contact" className="btn-secondary text-sm gap-2">
              <MessageCircle className="w-4 h-4" />
              Contacter le support
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold mb-4">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Livraison</span>
                <span
                  className={cn(
                    order.shippingTotal === 0 && "text-success font-medium",
                  )}
                >
                  {order.shippingTotal === 0
                    ? "Offerte"
                    : formatPrice(order.shippingTotal)}
                </span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-terracotta">
                  <span>Réduction</span>
                  <span>-{formatPrice(order.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {addr && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-display font-semibold mb-3">
                Adresse de livraison
              </h3>
              <div className="text-sm text-muted space-y-0.5">
                <p className="text-foreground font-medium">
                  {[addr.firstName, addr.lastName].filter(Boolean).join(" ")}
                </p>
                {addr.line1 && <p>{addr.line1}</p>}
                {addr.line2 && <p>{addr.line2}</p>}
                {(addr.postalCode || addr.city) && (
                  <p>
                    {[addr.postalCode, addr.city].filter(Boolean).join(" ")}
                  </p>
                )}
                {addr.country && <p>{addr.country}</p>}
              </div>
            </div>
          )}

          {order.giftWrap && (
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-5">
              <h3 className="font-display font-semibold mb-2 text-gold-dark">
                Emballage cadeau
              </h3>
              {order.giftMessage && (
                <p className="text-sm italic text-foreground/80">
                  « {order.giftMessage} »
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
