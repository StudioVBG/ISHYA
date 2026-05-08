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
import { formatPrice, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { StatusBadge, type OrderStatus } from "@/components/ui/StatusBadge";
import type { AccountReturn } from "@/lib/queries/account";

const STATUS_ICONS: Record<string, React.ElementType> = {
  requested: Clock,
  approved: CheckCircle2,
  rejected: X,
  shipped_back: Truck,
  received: Package,
  inspected: CheckCircle2,
  refunded: Coins,
  exchanged: CheckCircle2,
  closed: CheckCircle2,
};

const STATUS_ICON_BG: Record<string, string> = {
  requested: "bg-warning-soft text-warning",
  approved: "bg-info-soft text-info",
  rejected: "bg-destructive-soft text-destructive",
  shipped_back: "bg-accent-purple-soft text-accent-purple",
  received: "bg-info-soft text-info",
  inspected: "bg-info-soft text-info",
  refunded: "bg-success-soft text-success",
  exchanged: "bg-success-soft text-success",
  closed: "bg-bone-soft text-steel",
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
        <div className="bg-bone-soft rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-bone-soft flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-8 h-8 text-ember" />
          </div>
          <h2 className="font-display text-lg mb-2">
            Aucune demande de retour
          </h2>
          <p className="text-sm text-steel mb-6 max-w-md mx-auto">
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
            const Icon = STATUS_ICONS[r.status] ?? Clock;
            const iconBg =
              STATUS_ICON_BG[r.status] ?? "bg-bone-soft text-steel";
            const reasonLabel = REASON_LABELS[r.reason] ?? r.reason;

            return (
              <motion.div
                key={r.id}
                variants={staggerItem}
                className="bg-bone-soft rounded-xl border border-border p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {r.orderNumber ? (
                          <Link
                            href={`/compte/commandes/${r.orderNumber}`}
                            className="font-mono text-sm font-medium hover:text-ember transition-colors"
                          >
                            {r.orderNumber}
                          </Link>
                        ) : (
                          <span className="font-mono text-sm font-medium">
                            Retour
                          </span>
                        )}
                        <StatusBadge
                          status={r.status as OrderStatus}
                          size="sm"
                        />
                      </div>
                      <p className="text-sm text-foreground">{reasonLabel}</p>
                      {r.description && (
                        <p className="text-xs text-steel mt-1 max-w-lg">
                          {r.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-steel mt-2">
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
                      <p className="text-xs text-steel">Remboursement</p>
                      <p className="font-display text-base font-semibold text-success tabular-nums">
                        {formatPrice(r.refundAmount)}
                      </p>
                    </div>
                  )}
                </div>

                {r.trackingNumber && (
                  <div className="mt-3 pt-3 border-t border-border/50 text-xs text-steel">
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
