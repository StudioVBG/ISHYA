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
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { StatusBadge, type OrderStatus } from "@/components/ui/StatusBadge";
import { KPICard } from "@/components/ui/KPICard";
import type {
  AdminDashboardStats,
  AdminOrderListItem,
  AdminLowStockRow,
} from "@/lib/queries/admin";

type AlertVariant = "destructive" | "warning";

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
      variant: "success" as const,
    },
    {
      label: "Commandes",
      value: String(stats.todayOrders),
      detail: "Aujourd'hui",
      icon: ShoppingCart,
      variant: "info" as const,
    },
    {
      label: "Panier moyen",
      value: formatPrice(stats.averageBasket),
      detail: "Sur 30 jours",
      icon: Users,
      variant: "gold" as const,
    },
    {
      label: "Clients",
      value: String(stats.totalCustomers),
      detail: "Au total",
      icon: Users,
      variant: "accent" as const,
    },
  ];

  const alerts: Array<{
    type: "stock" | "retour" | "ticket";
    message: string;
    variant: AlertVariant;
  }> = [
    ...lowStock.slice(0, 3).map((row) => ({
      type: "stock" as const,
      message:
        row.quantity === 0
          ? `${row.productName} – ${row.variantSku ?? "variante"} : rupture`
          : `${row.productName} – ${row.variantSku ?? "variante"} : ${row.quantity} restant${row.quantity > 1 ? "s" : ""}`,
      variant: "destructive" as AlertVariant,
    })),
    ...(stats.pendingReturns > 0
      ? [
          {
            type: "retour" as const,
            message: `${stats.pendingReturns} retour${stats.pendingReturns > 1 ? "s" : ""} en attente de validation`,
            variant: "warning" as AlertVariant,
          },
        ]
      : []),
    ...(stats.openTickets > 0
      ? [
          {
            type: "ticket" as const,
            message: `${stats.openTickets} ticket${stats.openTickets > 1 ? "s" : ""} ouvert${stats.openTickets > 1 ? "s" : ""}`,
            variant: "warning" as AlertVariant,
          },
        ]
      : []),
  ];

  const alertIcons: Record<string, React.ElementType> = {
    stock: AlertTriangle,
    retour: RotateCcw,
    ticket: Headphones,
  };

  const alertVariantClasses: Record<AlertVariant, string> = {
    destructive:
      "bg-destructive-soft text-destructive border-destructive/20",
    warning: "bg-warning-soft text-warning border-warning/20",
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            detail={kpi.detail}
            icon={kpi.icon}
            variant={kpi.variant}
          />
        ))}
      </div>

      <motion.div
        variants={fadeInUp}
        className="bg-white rounded-xl border border-border p-6"
      >
        <h2 className="text-base font-semibold text-foreground mb-4">
          CA des 30 derniers jours
        </h2>
        <div className="h-64 sm:h-72 lg:h-80">
          {stats.revenueByDay.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-sm text-steel-soft">
              Pas encore de ventes sur les 30 derniers jours.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenueByDay}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  stroke="var(--color-muted)"
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="var(--color-muted)"
                  tickFormatter={(v) => `${v}€`}
                />
                <Tooltip
                  formatter={(value) => [`${value} €`, "CA"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    fontSize: "13px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ca"
                  stroke="var(--color-terracotta)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: "var(--color-terracotta)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-xl border border-border p-6"
        >
          <h2 className="text-base font-semibold text-foreground mb-4">
            Top 5 produits
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-steel-soft">
              Pas encore de ventes sur 30 jours.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium text-steel">
                      Produit
                    </th>
                    <th className="text-right py-2 font-medium text-steel">
                      Vendus
                    </th>
                    <th className="text-right py-2 font-medium text-steel">
                      CA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2.5">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <Image
                              src={p.imageUrl}
                              alt={p.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-bone-soft flex items-center justify-center">
                              <Package className="w-4 h-4 text-steel" />
                            </div>
                          )}
                          <span className="font-medium text-foreground">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-right text-steel py-2.5 tabular-nums">
                        {p.quantity}
                      </td>
                      <td className="text-right font-medium text-foreground py-2.5 tabular-nums">
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
          className="bg-white rounded-xl border border-border p-6"
        >
          <h2 className="text-base font-semibold text-foreground mb-4">
            Alertes
          </h2>
          {alerts.length === 0 ? (
            <p className="text-sm text-steel-soft">Aucune alerte. ✓</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert, i) => {
                const Icon = alertIcons[alert.type] ?? AlertTriangle;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border",
                      alertVariantClasses[alert.variant],
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
        className="bg-white rounded-xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">
            Commandes récentes
          </h2>
          <Link
            href="/admin/commandes"
            className="text-sm text-ember hover:underline"
          >
            Tout voir
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-steel-soft">
            Aucune commande pour l&apos;instant.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium text-steel">
                    N° Commande
                  </th>
                  <th className="text-left py-2 font-medium text-steel">
                    Client
                  </th>
                  <th className="text-left py-2 font-medium text-steel">
                    Date
                  </th>
                  <th className="text-left py-2 font-medium text-steel">
                    Statut
                  </th>
                  <th className="text-right py-2 font-medium text-steel">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-2.5">
                      <Link
                        href={`/admin/commandes/${order.id}`}
                        className="font-mono text-xs text-ember hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-2.5 text-foreground">
                      {order.customerName ?? order.customerEmail ?? "—"}
                    </td>
                    <td className="py-2.5 text-steel">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge
                        status={order.status as OrderStatus}
                        size="sm"
                      />
                    </td>
                    <td className="py-2.5 text-right font-medium text-foreground tabular-nums">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
