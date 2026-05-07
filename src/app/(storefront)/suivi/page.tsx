"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  CheckCircle2,
  Truck,
  PackageCheck,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { lookupOrder, type OrderTracking } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente de paiement",
  paid: "Paiement confirmé",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Préparation",
  label_created: "Étiquette créée",
  shipped: "Expédié",
  in_transit: "En transit",
  out_for_delivery: "En cours de livraison",
  delivered: "Livré",
  failed: "Échec de livraison",
  returned: "Retourné",
};

export default function SuiviPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await lookupOrder({
        orderNumber: orderNumber.trim(),
        email: email.trim(),
      });
      if (!res.ok) {
        setError(res.error);
        setTracking(null);
        return;
      }
      setTracking(res.data);
    });
  }

  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 md:py-24 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-gold/10 text-gold-dark px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4"
            >
              <Package className="w-3.5 h-3.5" />
              Suivi
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl lg:text-6xl mb-4"
            >
              Suivre ma commande
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted">
              Entrez votre numéro de commande et votre adresse email pour suivre
              votre colis en temps réel.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="py-16 px-4">
        <div className="container max-w-2xl mx-auto">
          <motion.form
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            onSubmit={handleSubmit}
            className="bg-white border border-border rounded-2xl p-6 md:p-8 space-y-4 mb-12"
          >
            <motion.div variants={fadeInUp}>
              <label htmlFor="order" className="block text-sm font-medium mb-2">
                Numéro de commande
              </label>
              <input
                id="order"
                type="text"
                required
                placeholder="Ex : ISH-M1A2B3C-XY4Z"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                disabled={isPending}
                className="w-full px-4 py-3 bg-ivory border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all disabled:opacity-60"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <label
                htmlFor="track-email"
                className="block text-sm font-medium mb-2"
              >
                Adresse email
              </label>
              <input
                id="track-email"
                type="email"
                required
                placeholder="L'email utilisé lors de la commande"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                className="w-full px-4 py-3 bg-ivory border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all disabled:opacity-60"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary w-full gap-2 disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {isPending ? "Recherche..." : "Rechercher"}
              </button>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </motion.form>

          {tracking && <TrackingResult tracking={tracking} />}
        </div>
      </div>
    </>
  );
}

function TrackingResult({ tracking }: { tracking: OrderTracking }) {
  const statusBadge = getStatusBadge(tracking);
  const timeline = buildTimeline(tracking);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div
        variants={fadeInUp}
        className="bg-white border border-border rounded-2xl p-6 md:p-8 mb-8"
      >
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">
              Commande
            </p>
            <p className="font-medium">{tracking.orderNumber}</p>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
              statusBadge.className,
            )}
          >
            {statusBadge.icon}
            {statusBadge.label}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted mb-0.5">Date de commande</p>
            <p className="font-medium">{formatDate(tracking.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Transporteur</p>
            <p className="font-medium">
              {tracking.shipment?.carrier ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Livraison estimée</p>
            <p className="font-medium">
              {tracking.shipment?.estimatedDelivery
                ? formatDate(tracking.shipment.estimatedDelivery)
                : "—"}
            </p>
          </div>
        </div>

        {tracking.shipment?.trackingNumber && (
          <p className="text-xs text-muted mt-4">
            N° de suivi :{" "}
            <span className="font-mono text-foreground">
              {tracking.shipment.trackingNumber}
            </span>
          </p>
        )}
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="bg-white border border-border rounded-2xl p-6 md:p-8"
      >
        <h2 className="font-display text-xl mb-8">Historique du suivi</h2>
        <div className="relative">
          {timeline.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === timeline.length - 1;
            return (
              <motion.div
                key={i}
                variants={staggerItem}
                className="flex gap-4 pb-8 last:pb-0"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2",
                      step.done
                        ? "bg-terracotta border-terracotta text-white"
                        : "bg-white border-border text-muted",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "w-0.5 flex-1 min-h-[2rem]",
                        step.done ? "bg-terracotta" : "bg-border",
                      )}
                    />
                  )}
                </div>

                <div className="pt-1.5 pb-2">
                  <p
                    className={cn(
                      "font-medium text-sm",
                      !step.done && "text-muted",
                    )}
                  >
                    {step.title}
                  </p>
                  {step.date && (
                    <p className="text-xs text-muted mt-0.5">{step.date}</p>
                  )}
                  {step.desc && (
                    <p className="text-sm text-muted mt-1">{step.desc}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="mt-8 bg-beige-nude-light/50 rounded-xl p-5 text-center"
      >
        <p className="text-sm text-muted">
          Un problème avec votre livraison ?{" "}
          <a
            href="/contact"
            className="text-terracotta font-medium hover:underline"
          >
            Contactez-nous
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
}

function getStatusBadge(t: OrderTracking) {
  if (t.cancelledAt) {
    return {
      label: "Annulée",
      className: "bg-destructive/10 text-destructive",
      icon: <X className="w-3.5 h-3.5" />,
    };
  }
  if (t.deliveredAt) {
    return {
      label: "Livrée",
      className: "bg-success/10 text-success",
      icon: <PackageCheck className="w-3.5 h-3.5" />,
    };
  }
  if (t.shipment?.status === "out_for_delivery") {
    return {
      label: "En cours de livraison",
      className: "bg-gold/10 text-gold-dark",
      icon: <Truck className="w-3.5 h-3.5" />,
    };
  }
  if (t.shippedAt || t.shipment?.status === "in_transit" || t.shipment?.status === "shipped") {
    return {
      label: "En transit",
      className: "bg-gold/10 text-gold-dark",
      icon: <Truck className="w-3.5 h-3.5" />,
    };
  }
  return {
    label: STATUS_LABELS[t.status] ?? "En traitement",
    className: "bg-muted-soft text-muted",
    icon: <Package className="w-3.5 h-3.5" />,
  };
}

interface TimelineStep {
  icon: typeof CheckCircle2;
  title: string;
  date: string | null;
  desc: string | null;
  done: boolean;
}

function buildTimeline(t: OrderTracking): TimelineStep[] {
  // Étapes officielles dérivées de l'order ; on enrichit avec les
  // tracking_events si présents (ils donnent la granularité fine du transporteur).
  const steps: TimelineStep[] = [
    {
      icon: CheckCircle2,
      title: "Commande confirmée",
      date: t.createdAt ? formatDate(t.createdAt) : null,
      desc: "Votre paiement a été validé.",
      done: true,
    },
    {
      icon: Package,
      title: "En préparation",
      date: null,
      desc: "Votre colis est en cours d'emballage dans notre atelier.",
      done: ["processing", "shipped", "delivered"].includes(t.status),
    },
    {
      icon: Truck,
      title: "Expédiée",
      date: t.shippedAt ? formatDate(t.shippedAt) : null,
      desc: t.shipment?.trackingNumber
        ? `Pris en charge${t.shipment.carrier ? ` par ${t.shipment.carrier}` : ""} – N° ${t.shipment.trackingNumber}`
        : null,
      done: !!t.shippedAt || t.status === "shipped" || t.status === "delivered",
    },
    {
      icon: PackageCheck,
      title: "Livrée",
      date: t.deliveredAt
        ? formatDate(t.deliveredAt)
        : t.shipment?.estimatedDelivery
          ? `Estimation : ${formatDate(t.shipment.estimatedDelivery)}`
          : null,
      desc: t.deliveredAt
        ? "Votre commande a été remise."
        : "Livraison prévue à l'adresse indiquée.",
      done: !!t.deliveredAt,
    },
  ];

  // Si on a des tracking_events précis, on insère les plus récents entre
  // l'expédition et la livraison.
  if (t.events.length > 0) {
    const transitEvents: TimelineStep[] = t.events
      .slice(0, 3)
      .map((e) => ({
        icon: Truck,
        title:
          SHIPMENT_STATUS_LABELS[e.status] ?? e.status.replaceAll("_", " "),
        date: formatDate(e.occurredAt),
        desc: [e.description, e.location].filter(Boolean).join(" — ") || null,
        done: true,
      }));
    return [...steps.slice(0, 3), ...transitEvents, steps[3]];
  }

  return steps;
}
