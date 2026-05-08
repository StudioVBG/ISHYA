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
import { KPICard } from "@/components/ui/KPICard";
import { StatusBadge, type OrderStatus } from "@/components/ui/StatusBadge";
import type { AdminAnalyticsSummary } from "@/lib/queries/admin";

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
        "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
        isUp ? "text-success" : "text-destructive",
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
  const maxProductRevenue =
    data.topProducts.reduce((max, p) => Math.max(max, p.revenue), 0) || 1;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-bold text-foreground">Rapports</h2>
        <p className="text-sm text-steel">
          Activité sur les 30 derniers jours
        </p>
      </motion.div>

      {/* KPIs avec deltas */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-success-soft text-success flex items-center justify-center">
              <Euro className="w-5 h-5" />
            </div>
            <DeltaBadge value={revenueDelta} />
          </div>
          <p className="text-2xl font-semibold text-foreground tabular-nums">
            {formatPrice(data.revenueLast30)}
          </p>
          <p className="text-sm text-steel mt-1">
            CA · 30j (vs {formatPrice(data.revenuePrev30)} sur 30j précédents)
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-info-soft text-info flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <DeltaBadge value={ordersDelta} />
          </div>
          <p className="text-2xl font-semibold text-foreground tabular-nums">
            {data.ordersLast30}
          </p>
          <p className="text-sm text-steel mt-1">
            Commandes · 30j (vs {data.ordersPrev30})
          </p>
        </div>

        <KPICard
          label="Panier moyen · 30j"
          value={formatPrice(data.averageBasketLast30)}
          icon={BarChart3}
          variant="gold"
        />

        <KPICard
          label="Nouveaux clients · 30j"
          value={String(data.newCustomersLast30)}
          icon={Users}
          variant="accent"
        />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top produits */}
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-xl border border-border p-6"
        >
          <h3 className="text-base font-semibold text-foreground mb-4">
            Top 10 produits · 30j
          </h3>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-steel-soft">
              Pas encore de ventes sur cette période.
            </p>
          ) : (
            <div className="space-y-2">
              {data.topProducts.map((p, i) => {
                const pct = Math.round((p.revenue / maxProductRevenue) * 100);
                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground truncate flex-1">
                        <span className="text-steel-soft mr-2">#{i + 1}</span>
                        {p.name}
                      </span>
                      <span className="text-foreground font-medium ml-2 shrink-0 tabular-nums">
                        {formatPrice(p.revenue)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-bone-soft rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ember rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-steel-soft">
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
          className="bg-white rounded-xl border border-border p-6"
        >
          <h3 className="text-base font-semibold text-foreground mb-4">
            CA par catégorie · 30j
          </h3>
          {data.byCategory.length === 0 ? (
            <p className="text-sm text-steel-soft">
              Pas de ventes catégorisées sur cette période.
            </p>
          ) : (
            <div className="space-y-3">
              {data.byCategory.map((c) => {
                const pct = Math.round((c.revenue / maxCategoryRevenue) * 100);
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground">{c.name}</span>
                      <span className="text-foreground font-medium tabular-nums">
                        {formatPrice(c.revenue)}
                      </span>
                    </div>
                    <div className="h-2 bg-bone-soft rounded-full overflow-hidden">
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
        className="bg-white rounded-xl border border-border p-6"
      >
        <h3 className="text-base font-semibold text-foreground mb-4">
          Répartition des commandes par statut (toutes périodes)
        </h3>
        {totalOrders === 0 ? (
          <p className="text-sm text-steel-soft">Aucune commande.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Object.entries(data.ordersByStatus).map(([status, count]) => {
              const pct = Math.round((count / totalOrders) * 100);
              return (
                <div key={status} className="bg-ivory/60 rounded-lg p-3">
                  <StatusBadge status={status as OrderStatus} size="sm" />
                  <p className="text-xl font-semibold text-foreground mt-2 tabular-nums">
                    {count}
                  </p>
                  <p className="text-xs text-steel">{pct}% des commandes</p>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
