"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ChevronRight, Search, Filter } from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const statusConfig: Record<
  string,
  { color: string; bgColor: string }
> = {
  "En attente": { color: "text-yellow-700", bgColor: "bg-yellow-100" },
  Payée: { color: "text-blue-700", bgColor: "bg-blue-100" },
  "En préparation": { color: "text-orange-700", bgColor: "bg-orange-100" },
  Expédiée: { color: "text-purple-700", bgColor: "bg-purple-100" },
  Livrée: { color: "text-green-700", bgColor: "bg-green-100" },
  Annulée: { color: "text-red-700", bgColor: "bg-red-100" },
};

const demoOrders = [
  {
    id: "ISH-2K6F3A-X9R2",
    date: "2026-03-15T10:00:00Z",
    status: "Expédiée",
    total: 97,
    items: [
      { name: "Collier Fleur d'Oranger", qty: 1 },
      { name: "Boucles Goutte de Rosée", qty: 1 },
    ],
  },
  {
    id: "ISH-2K5M1B-T4P7",
    date: "2026-03-08T14:30:00Z",
    status: "Livrée",
    total: 45,
    items: [{ name: "Collier Fleur d'Oranger", qty: 1 }],
  },
  {
    id: "ISH-2K4H9C-J6N1",
    date: "2026-02-22T09:15:00Z",
    status: "Livrée",
    total: 72,
    items: [{ name: "Pack Duo Floral", qty: 1 }],
  },
  {
    id: "ISH-2K3A7D-P2M5",
    date: "2026-02-10T16:45:00Z",
    status: "En préparation",
    total: 38,
    items: [{ name: "Bracelet Jardin Secret", qty: 1 }],
  },
  {
    id: "ISH-2K2B4E-R8L3",
    date: "2026-01-28T11:00:00Z",
    status: "Annulée",
    total: 52,
    items: [{ name: "Collier Pétale de Rose", qty: 1 }],
  },
];

export default function CommandesPage() {
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
              className="pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all w-48 sm:w-56"
            />
          </div>
          <button className="p-2.5 rounded-lg border border-border bg-white hover:border-terracotta/30 transition-colors">
            <Filter className="w-4 h-4 text-muted" />
          </button>
        </div>
      </motion.div>

      {/* Status filter pills */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide"
      >
        <button className="px-4 py-1.5 rounded-full text-xs font-medium bg-terracotta text-white shrink-0">
          Toutes (5)
        </button>
        {Object.entries(statusConfig).map(([status, config]) => (
          <button
            key={status}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium shrink-0 border border-border bg-white hover:border-terracotta/30 transition-colors",
              config.color
            )}
          >
            {status}
          </button>
        ))}
      </motion.div>

      {/* Orders */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {demoOrders.map((order) => {
          const config = statusConfig[order.status];
          return (
            <motion.div key={order.id} variants={staggerItem}>
              <Link
                href={`/compte/commandes/${order.id}`}
                className="block bg-white rounded-xl border border-border p-5 hover:border-terracotta/30 hover:shadow-sm transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-beige-nude-light flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-terracotta" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-medium group-hover:text-terracotta transition-colors">
                        {order.id}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {formatDate(order.date)} •{" "}
                        {order.items.length} article{order.items.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        config?.bgColor,
                        config?.color
                      )}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm font-semibold min-w-[70px] text-right">
                      {formatPrice(order.total)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-terracotta transition-colors hidden sm:block" />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, i) => (
                      <span
                        key={i}
                        className="text-xs text-muted bg-ivory px-2 py-1 rounded"
                      >
                        {item.name}
                        {item.qty > 1 && ` ×${item.qty}`}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
