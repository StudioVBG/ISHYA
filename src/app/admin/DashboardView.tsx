"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Euro,
  Users,
  Package,
  AlertTriangle,
  RotateCcw,
  Headphones,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type {
  AdminDashboardStats,
  AdminOrderListItem,
  AdminLowStockRow,
} from "@/lib/queries/admin";

const statusLabels: Record<string, { label: string; className: string }> = {
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
};

export function DashboardView({
  stats,
  recentOrders,
  lowStock,
}: {
  stats: AdminDashboardStats;
  recentOrders: AdminOrderListItem[];
  lowStock: AdminLowStockRow[];
}) {
  const kpis = [
    {
      label: "CA du jour",
      value: formatPrice(stats.todayRevenue),
      detail: "Aujourd'hui",
      icon: Euro,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Commandes",
      value: String(stats.todayOrders),
      detail: "Aujourd'hui",
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Panier moyen",
      value: formatPrice(stats.averageBasket),
      detail: "Sur 30 jours",
      icon: Users,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Clients",
      value: String(stats.totalCustomers),
      detail: "Au total",
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const alerts: Array<{
    type: "stock" | "retour" | "ticket";
    message: string;
    color: string;
  }> = [
    ...lowStock.slice(0, 3).map((row) => ({
      type: "stock" as const,
      message:
        row.quantity === 0
          ? `${row.productName} – ${row.variantSku ?? "variante"} : rupture`
          : `${row.productName} – ${row.variantSku ?? "variante"} : ${row.quantity} restant${row.quantity > 1 ? "s" : ""}`,
      color: "bg-red-50 text-red-700 border-red-200",
    })),
    ...(stats.pendingReturns > 0
      ? [
          {
            type: "retour" as const,
            message: `${stats.pendingReturns} retour${stats.pendingReturns > 1 ? "s" : ""} en attente de validation`,
            color: "bg-orange-50 text-orange-700 border-orange-200",
          },
        ]
      : []),
    ...(stats.openTickets > 0
      ? [
          {
            type: "ticket" as const,
            message: `${stats.openTickets} ticket${stats.openTickets > 1 ? "s" : ""} ouvert${stats.openTickets > 1 ? "s" : ""}`,
            color: "bg-yellow-50 text-yellow-700 border-yellow-200",
          },
        ]
      : []),
  ];

  const alertIcons: Record<string, React.ElementType> = {
    stock: AlertTriangle,
    retour: RotateCcw,
    ticket: Headphones,
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              variants={staggerItem}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    kpi.color,
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-sm text-gray-500 mt-1">
                {kpi.label} · {kpi.detail}
              </p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        variants={fadeInUp}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          CA des 30 derniers jours
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                tickFormatter={(v) => `${v}€`}
              />
              <Tooltip
                formatter={(value) => [`${value} €`, "CA"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "13px",
                }}
              />
              <Line
                type="monotone"
                dataKey="ca"
                stroke="#DF887B"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#DF887B" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Top 5 produits
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-gray-400">
              Pas encore de ventes sur 30 jours.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 font-medium text-gray-500">
                      Produit
                    </th>
                    <th className="text-right py-2 font-medium text-gray-500">
                      Vendus
                    </th>
                    <th className="text-right py-2 font-medium text-gray-500">
                      CA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-2.5">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <Image
                              src={p.imageUrl}
                              alt=""
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <span className="font-medium text-gray-900">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-right text-gray-600 py-2.5">
                        {p.quantity}
                      </td>
                      <td className="text-right font-medium text-gray-900 py-2.5">
                        {formatPrice(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Alertes
          </h2>
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune alerte. ✓</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert, i) => {
                const Icon = alertIcons[alert.type] ?? AlertTriangle;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border",
                      alert.color,
                    )}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="text-sm">{alert.message}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        variants={fadeInUp}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Commandes récentes
          </h2>
          <Link
            href="/admin/commandes"
            className="text-sm text-terracotta hover:underline"
          >
            Tout voir
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400">
            Aucune commande pour l&apos;instant.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-medium text-gray-500">
                    N° Commande
                  </th>
                  <th className="text-left py-2 font-medium text-gray-500">
                    Client
                  </th>
                  <th className="text-left py-2 font-medium text-gray-500">
                    Date
                  </th>
                  <th className="text-left py-2 font-medium text-gray-500">
                    Statut
                  </th>
                  <th className="text-right py-2 font-medium text-gray-500">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const s = statusLabels[order.status] ?? {
                    label: order.status,
                    className: "bg-gray-100 text-gray-700",
                  };
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-2.5">
                        <Link
                          href={`/admin/commandes/${order.id}`}
                          className="font-mono text-xs text-terracotta hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 text-gray-900">
                        {order.customerName ?? order.customerEmail ?? "—"}
                      </td>
                      <td className="py-2.5 text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            s.className,
                          )}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-medium text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
