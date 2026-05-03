"use client";

import { motion } from "framer-motion";
import {
  Euro,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminAnalyticsSummary } from "@/lib/queries/admin";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-gray-100 text-gray-700" },
  confirmed: { label: "Payée", className: "bg-emerald-50 text-emerald-700" },
  processing: { label: "En préparation", className: "bg-blue-50 text-blue-700" },
  shipped: { label: "Expédiée", className: "bg-purple-50 text-purple-700" },
  delivered: { label: "Livrée", className: "bg-green-50 text-green-700" },
  cancelled: { label: "Annulée", className: "bg-red-50 text-red-700" },
  refunded: { label: "Remboursée", className: "bg-orange-50 text-orange-700" },
  partially_refunded: { label: "Remb. partiel", className: "bg-orange-50 text-orange-700" },
  on_hold: { label: "En pause", className: "bg-gray-100 text-gray-700" },
  failed: { label: "Échec", className: "bg-red-50 text-red-700" },
};

function deltaPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function DeltaBadge({ value }: { value: number }) {
  const isUp = value >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        isUp ? "text-emerald-600" : "text-red-500",
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {isUp ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

export function RapportsView({ data }: { data: AdminAnalyticsSummary }) {
  const revenueDelta = deltaPercent(data.revenueLast30, data.revenuePrev30);
  const ordersDelta = deltaPercent(data.ordersLast30, data.ordersPrev30);
  const maxCategoryRevenue =
    data.byCategory.reduce((max, c) => Math.max(max, c.revenue), 0) || 1;
  const totalOrders = Object.values(data.ordersByStatus).reduce(
    (s, n) => s + n,
    0,
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-bold text-gray-900">Rapports</h2>
        <p className="text-sm text-gray-500">
          Activité sur les 30 derniers jours
        </p>
      </motion.div>

      {/* KPIs */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Euro className="w-5 h-5" />
            </div>
            <DeltaBadge value={revenueDelta} />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(data.revenueLast30)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            CA · 30j (vs {formatPrice(data.revenuePrev30)} sur 30j précédents)
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <DeltaBadge value={ordersDelta} />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.ordersLast30}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Commandes · 30j (vs {data.ordersPrev30})
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(data.averageBasketLast30)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Panier moyen · 30j</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.newCustomersLast30}
          </p>
          <p className="text-sm text-gray-500 mt-1">Nouveaux clients · 30j</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top produits */}
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Top 10 produits · 30j
          </h3>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-gray-400">
              Pas encore de ventes sur cette période.
            </p>
          ) : (
            <div className="space-y-2">
              {data.topProducts.map((p, i) => {
                const pct = Math.round(
                  (p.revenue /
                    Math.max(...data.topProducts.map((x) => x.revenue))) *
                    100,
                );
                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 truncate flex-1">
                        <span className="text-gray-400 mr-2">#{i + 1}</span>
                        {p.name}
                      </span>
                      <span className="text-gray-900 font-medium ml-2 shrink-0">
                        {formatPrice(p.revenue)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-terracotta rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      {p.quantity} vendu{p.quantity > 1 ? "s" : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Revenue par catégorie */}
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            CA par catégorie · 30j
          </h3>
          {data.byCategory.length === 0 ? (
            <p className="text-sm text-gray-400">
              Pas de ventes catégorisées sur cette période.
            </p>
          ) : (
            <div className="space-y-3">
              {data.byCategory.map((c) => {
                const pct = Math.round((c.revenue / maxCategoryRevenue) * 100);
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{c.name}</span>
                      <span className="text-gray-900 font-medium">
                        {formatPrice(c.revenue)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-terracotta to-gold rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Distribution statuts */}
      <motion.div
        variants={fadeInUp}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Répartition des commandes par statut (toutes périodes)
        </h3>
        {totalOrders === 0 ? (
          <p className="text-sm text-gray-400">Aucune commande.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Object.entries(data.ordersByStatus).map(([status, count]) => {
              const config = STATUS_LABELS[status] ?? {
                label: status,
                className: "bg-gray-100 text-gray-600",
              };
              const pct = Math.round((count / totalOrders) * 100);
              return (
                <div
                  key={status}
                  className="bg-gray-50 rounded-lg p-3"
                >
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                      config.className,
                    )}
                  >
                    {config.label}
                  </span>
                  <p className="text-xl font-bold text-gray-900 mt-2">
                    {count}
                  </p>
                  <p className="text-xs text-gray-500">{pct}% des commandes</p>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
