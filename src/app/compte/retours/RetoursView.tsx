"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Plus,
  Clock,
  CheckCircle2,
  Truck,
  X,
  Coins,
  Package,
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { AccountReturn } from "@/lib/queries/account";

const STATUS_LABELS: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  requested: {
    label: "En attente",
    className: "bg-yellow-50 text-yellow-700",
    icon: Clock,
  },
  approved: {
    label: "Approuvé",
    className: "bg-blue-50 text-blue-700",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Refusé",
    className: "bg-red-50 text-red-700",
    icon: X,
  },
  shipped_back: {
    label: "Renvoyé",
    className: "bg-purple-50 text-purple-700",
    icon: Truck,
  },
  received: {
    label: "Reçu",
    className: "bg-cyan-50 text-cyan-700",
    icon: Package,
  },
  inspected: {
    label: "Inspecté",
    className: "bg-indigo-50 text-indigo-700",
    icon: CheckCircle2,
  },
  refunded: {
    label: "Remboursé",
    className: "bg-emerald-50 text-emerald-700",
    icon: Coins,
  },
  exchanged: {
    label: "Échangé",
    className: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  closed: {
    label: "Fermé",
    className: "bg-gray-100 text-gray-600",
    icon: CheckCircle2,
  },
};

const REASON_LABELS: Record<string, string> = {
  wrong_size: "Mauvaise taille",
  defective: "Produit défectueux",
  not_as_described: "Différent de la description",
  changed_mind: "Changement d'avis",
  arrived_late: "Arrivé en retard",
  wrong_item: "Mauvais article",
  other: "Autre",
};

export function RetoursView({ returns }: { returns: AccountReturn[] }) {
  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">
          Mes retours
        </h1>
        <Link href="/compte/commandes" className="btn-primary text-sm gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle demande
        </Link>
      </motion.div>

      {returns.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-beige-nude-light flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-8 h-8 text-terracotta" />
          </div>
          <h2 className="font-display text-lg mb-2">
            Aucune demande de retour
          </h2>
          <p className="text-sm text-muted mb-6 max-w-md mx-auto">
            Vous disposez de 14 jours après réception pour retourner un article.
            Rendez-vous sur le détail d&apos;une commande livrée pour démarrer une
            demande.
          </p>
          <Link href="/compte/commandes" className="btn-primary inline-flex">
            Voir mes commandes
          </Link>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {returns.map((r) => {
            const status = STATUS_LABELS[r.status] ?? {
              label: r.status,
              className: "bg-gray-100 text-gray-600",
              icon: Clock,
            };
            const Icon = status.icon;
            const reasonLabel = REASON_LABELS[r.reason] ?? r.reason;

            return (
              <motion.div
                key={r.id}
                variants={staggerItem}
                className="bg-white rounded-xl border border-border p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        status.className,
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {r.orderNumber ? (
                          <Link
                            href={`/compte/commandes/${r.orderNumber}`}
                            className="font-mono text-sm font-medium hover:text-terracotta transition-colors"
                          >
                            {r.orderNumber}
                          </Link>
                        ) : (
                          <span className="font-mono text-sm font-medium">
                            Retour
                          </span>
                        )}
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            status.className,
                          )}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{reasonLabel}</p>
                      {r.description && (
                        <p className="text-xs text-muted mt-1 max-w-lg">
                          {r.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted mt-2">
                        {r.createdAt && (
                          <span>Demandé le {formatDate(r.createdAt)}</span>
                        )}
                        {r.approvedAt && (
                          <span>· Approuvé le {formatDate(r.approvedAt)}</span>
                        )}
                        {r.refundedAt && (
                          <span>
                            · Remboursé le {formatDate(r.refundedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {r.refundAmount != null && (
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted">Remboursement</p>
                      <p className="font-display text-base font-semibold text-emerald-600">
                        {formatPrice(r.refundAmount)}
                      </p>
                    </div>
                  )}
                </div>

                {r.trackingNumber && (
                  <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted">
                    Numéro de suivi retour :{" "}
                    <span className="font-mono text-foreground">
                      {r.trackingNumber}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
