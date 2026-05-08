"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ChevronRight, Search } from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { StatusBadge, type OrderStatus } from "@/components/ui/StatusBadge";
import type {
  AccountOrderListItem,
  AccountOrderStatus,
} from "@/lib/queries/account";

const FILTER_LABELS: Record<AccountOrderStatus, string> = {
  pending: "En attente",
  confirmed: "Payée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
  partially_refunded: "Remb. partiel",
  on_hold: "En pause",
  failed: "Échec",
};

const FILTERABLE_STATUSES: AccountOrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function CommandesView({ orders }: { orders: AccountOrderListItem[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AccountOrderStatus | null>(
    null,
  );

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !o.orderNumber.toLowerCase().includes(q) &&
          !o.itemNames.some((name) => name.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [orders, search, statusFilter]);

  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">
          Mes commandes
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel" />
          <input
            type="text"
            placeholder="Rechercher une commande..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-border bg-bone-soft text-sm focus:outline-none focus:ring-2 focus:ring-ember/30 focus:border-ember transition-all w-48 sm:w-56"
          />
        </div>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide"
      >
        <button
          onClick={() => setStatusFilter(null)}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-medium shrink-0 border transition-colors",
            statusFilter === null
              ? "bg-ember text-bone border-ember"
              : "bg-bone-soft border-border hover:border-ember/30",
          )}
        >
          Toutes ({orders.length})
        </button>
        {FILTERABLE_STATUSES.map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium shrink-0 border transition-colors",
                isActive
                  ? "bg-foreground text-bone border-foreground"
                  : "bg-bone-soft border-border text-foreground hover:border-ember/30",
              )}
            >
              {FILTER_LABELS[status]} ({count})
            </button>
          );
        })}
      </motion.div>

      {orders.length === 0 ? (
        <div className="bg-bone-soft rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-bone-soft flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-ember" />
          </div>
          <h2 className="font-display text-lg mb-2">
            Vous n&apos;avez pas encore passé de commande
          </h2>
          <p className="text-sm text-steel mb-6">
            Découvrez notre boutique et trouvez votre premier bijou ISHYA.
          </p>
          <Link href="/boutique" className="btn-primary inline-flex">
            Aller à la boutique
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-bone-soft rounded-xl border border-border p-12 text-center">
          <p className="text-sm text-steel">
            Aucune commande ne correspond à votre recherche.
          </p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filtered.map((order) => (
            <motion.div key={order.id} variants={staggerItem}>
              <Link
                href={`/compte/commandes/${order.orderNumber}`}
                className="block bg-bone-soft rounded-xl border border-border p-5 hover:border-ember/30 hover:shadow-sm transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-bone-soft flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-ember" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-medium group-hover:text-ember transition-colors">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-steel mt-0.5">
                        {formatDate(order.createdAt)} • {order.itemCount}{" "}
                        article{order.itemCount > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <StatusBadge status={order.status as OrderStatus} />
                    <span className="text-sm font-semibold min-w-[70px] text-right tabular-nums">
                      {formatPrice(order.total)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-steel group-hover:text-ember transition-colors hidden sm:block" />
                  </div>
                </div>

                {order.itemNames.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex flex-wrap gap-2">
                      {order.itemNames.map((name, i) => (
                        <span
                          key={i}
                          className="text-xs text-steel bg-ivory px-2 py-1 rounded"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
