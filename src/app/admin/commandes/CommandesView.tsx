"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Download, Eye } from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminOrderListItem } from "@/lib/queries/admin";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-gray-100 text-gray-700" },
  confirmed: { label: "Payée", className: "bg-emerald-50 text-emerald-700" },
  processing: {
    label: "En préparation",
    className: "bg-blue-50 text-blue-700",
  },
  shipped: { label: "Expédiée", className: "bg-purple-50 text-purple-700" },
  delivered: { label: "Livrée", className: "bg-green-50 text-green-700" },
  cancelled: { label: "Annulée", className: "bg-red-50 text-red-700" },
  refunded: { label: "Remboursée", className: "bg-orange-50 text-orange-700" },
  partially_refunded: {
    label: "Remboursée partiel.",
    className: "bg-orange-50 text-orange-700",
  },
  on_hold: { label: "En pause", className: "bg-gray-100 text-gray-700" },
  failed: { label: "Échec", className: "bg-red-50 text-red-700" },
};

export function CommandesView({
  orders,
}: {
  orders: AdminOrderListItem[];
}) {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchesNumber = o.orderNumber.toLowerCase().includes(q);
        const matchesEmail = o.customerEmail?.toLowerCase().includes(q);
        const matchesName = o.customerName?.toLowerCase().includes(q);
        if (!matchesNumber && !matchesEmail && !matchesName) return false;
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900">Commandes</h2>
          <p className="text-sm text-gray-500">{orders.length} commandes</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-gray-200 p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par n° ou client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          >
            <option value="">Tous statuts</option>
            {Object.entries(statusConfig).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  N° Commande
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Articles
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    {orders.length === 0
                      ? "Aucune commande pour l'instant."
                      : "Aucune commande ne correspond à votre recherche."}
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const s = statusConfig[order.status] ?? {
                    label: order.status,
                    className: "bg-gray-100 text-gray-700",
                  };
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/commandes/${order.id}`}
                          className="font-mono text-xs text-terracotta hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.customerName ?? "—"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {order.customerEmail ?? "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {order.itemCount}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            s.className,
                          )}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/commandes/${order.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-terracotta transition-colors inline-block"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
