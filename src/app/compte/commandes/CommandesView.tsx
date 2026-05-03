"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ChevronRight, Search, Filter } from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type {
  AccountOrderListItem,
  AccountOrderStatus,
} from "@/lib/queries/account";

const statusLabels: Record<
  AccountOrderStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: { label: "En attente", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  confirmed: { label: "Payée", color: "text-blue-700", bgColor: "bg-blue-100" },
  processing: { label: "En préparation", color: "text-orange-700", bgColor: "bg-orange-100" },
  shipped: { label: "Expédiée", color: "text-purple-700", bgColor: "bg-purple-100" },
  delivered: { label: "Livrée", color: "text-green-700", bgColor: "bg-green-100" },
  cancelled: { label: "Annulée", color: "text-red-700", bgColor: "bg-red-100" },
  refunded: { label: "Remboursée", color: "text-orange-700", bgColor: "bg-orange-100" },
  partially_refunded: { label: "Partiel.", color: "text-orange-700", bgColor: "bg-orange-100" },
  on_hold: { label: "En pause", color: "text-gray-700", bgColor: "bg-gray-100" },
  failed: { label: "Échec", color: "text-red-700", bgColor: "bg-red-100" },
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
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all w-48 sm:w-56"
            />
          </div>
          <button className="p-2.5 rounded-lg border border-border bg-white hover:border-terracotta/30 transition-colors">
            <Filter className="w-4 h-4 text-muted" />
          </button>
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
              ? "bg-terracotta text-white border-terracotta"
              : "bg-white border-border hover:border-terracotta/30",
          )}
        >
          Toutes ({orders.length})
        </button>
        {FILTERABLE_STATUSES.map((status) => {
          const config = statusLabels[status];
          const count = orders.filter((o) => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium shrink-0 border transition-colors",
                statusFilter === status
                  ? `${config.bgColor} ${config.color} border-transparent`
                  : "bg-white border-border hover:border-terracotta/30",
                statusFilter !== status && config.color,
              )}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </motion.div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-beige-nude-light flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-terracotta" />
          </div>
          <h2 className="font-display text-lg mb-2">
            Vous n&apos;avez pas encore passé de commande
          </h2>
          <p className="text-sm text-muted mb-6">
            Découvrez notre boutique et trouvez votre premier bijou ISHYA.
          </p>
          <Link href="/boutique" className="btn-primary inline-flex">
            Aller à la boutique
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <p className="text-sm text-muted">
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
          {filtered.map((order) => {
            const config = statusLabels[order.status];
            return (
              <motion.div key={order.id} variants={staggerItem}>
                <Link
                  href={`/compte/commandes/${order.orderNumber}`}
                  className="block bg-white rounded-xl border border-border p-5 hover:border-terracotta/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-beige-nude-light flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-terracotta" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-medium group-hover:text-terracotta transition-colors">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {formatDate(order.createdAt)} • {order.itemCount}{" "}
                          article{order.itemCount > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          config.bgColor,
                          config.color,
                        )}
                      >
                        {config.label}
                      </span>
                      <span className="text-sm font-semibold min-w-[70px] text-right">
                        {formatPrice(order.total)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted group-hover:text-terracotta transition-colors hidden sm:block" />
                    </div>
                  </div>

                  {order.itemNames.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex flex-wrap gap-2">
                        {order.itemNames.map((name, i) => (
                          <span
                            key={i}
                            className="text-xs text-muted bg-ivory px-2 py-1 rounded"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
