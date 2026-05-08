"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Download, Eye } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { StatusBadge, type OrderStatus } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import type { AdminOrderListItem } from "@/lib/queries/admin";

const statusFilterOptions: { value: string; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Payée" },
  { value: "processing", label: "En préparation" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
  { value: "refunded", label: "Remboursée" },
  { value: "partially_refunded", label: "Remb. partiel" },
  { value: "on_hold", label: "En pause" },
  { value: "failed", label: "Échec" },
];

function exportOrdersCsv(rows: AdminOrderListItem[]) {
  const header = [
    "order_number",
    "created_at",
    "customer_name",
    "customer_email",
    "status",
    "item_count",
    "total",
  ];
  const lines = [
    header.join(","),
    ...rows.map((o) =>
      [
        o.orderNumber,
        o.createdAt ?? "",
        o.customerName ?? "",
        o.customerEmail ?? "",
        o.status,
        o.itemCount,
        o.total,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

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
          <h2 className="text-xl font-bold text-foreground">Commandes</h2>
          <p className="text-sm text-steel">{orders.length} commandes</p>
        </div>
        <Button
          variant="secondary"
          size="md"
          icon={Download}
          onClick={() => exportOrdersCsv(filtered)}
          disabled={filtered.length === 0}
        >
          Export CSV
        </Button>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-soft" />
            <input
              type="text"
              placeholder="Rechercher par n° ou client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
          >
            <option value="">Tous statuts</option>
            {statusFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-ivory/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                  N° Commande
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-steel uppercase tracking-wider">
                  Articles
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-steel uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-steel uppercase tracking-wider">
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
                    className="px-4 py-12 text-center text-steel-soft"
                  >
                    {orders.length === 0
                      ? "Aucune commande pour l'instant."
                      : "Aucune commande ne correspond à votre recherche."}
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/50 last:border-0 hover:bg-ivory/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/commandes/${order.id}`}
                        className="font-mono text-xs text-ember hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {order.customerName ?? "—"}
                        </p>
                        <p className="text-xs text-steel-soft">
                          {order.customerEmail ?? "—"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-steel">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center text-steel tabular-nums">
                      {order.itemCount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge
                        status={order.status as OrderStatus}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground tabular-nums">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/commandes/${order.id}`}
                        className="p-1.5 rounded-lg hover:bg-bone-soft text-steel hover:text-ember transition-colors inline-block"
                        aria-label="Voir le détail"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
