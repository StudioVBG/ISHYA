"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Award,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  Gift,
  RotateCcw,
  Calendar,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { AccountLoyaltySummary } from "@/lib/queries/account";

const TIER_LABELS: Record<string, string> = {
  bronze: "Bronze",
  silver: "Argent",
  gold: "Or",
  platinum: "Platine",
};

const TIER_COLORS: Record<string, string> = {
  bronze: "from-orange-300 to-orange-400",
  silver: "from-gray-300 to-gray-400",
  gold: "from-gold-light to-gold",
  platinum: "from-gray-700 to-gray-800",
};

const TYPE_LABELS: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  earn: {
    label: "Gagnés",
    className: "text-success bg-success-soft",
    icon: ShoppingBag,
  },
  redeem: {
    label: "Utilisés",
    className: "text-terracotta bg-terracotta/10",
    icon: Gift,
  },
  expire: {
    label: "Expirés",
    className: "text-warning bg-warning-soft",
    icon: Calendar,
  },
  adjust: {
    label: "Ajustement",
    className: "text-info bg-info-soft",
    icon: RotateCcw,
  },
};

export function FideliteView({ data }: { data: AccountLoyaltySummary }) {
  const tiers =
    data.tiers.length > 0
      ? data.tiers
      : [
          { name: "bronze", minPoints: 0, pointsMultiplier: 1, perks: [] },
          { name: "silver", minPoints: 300, pointsMultiplier: 1.2, perks: [] },
          { name: "gold", minPoints: 800, pointsMultiplier: 1.5, perks: [] },
          { name: "platinum", minPoints: 1500, pointsMultiplier: 2, perks: [] },
        ];

  const currentTierIndex = tiers.findLastIndex(
    (t) => data.points >= t.minPoints,
  );
  const currentTier = tiers[Math.max(0, currentTierIndex)];
  const nextTier = tiers[currentTierIndex + 1];
  const progressToNext = nextTier
    ? Math.min(
        100,
        ((data.points - currentTier.minPoints) /
          (nextTier.minPoints - currentTier.minPoints)) *
          100,
      )
    : 100;

  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-1">
          Programme fidélité
        </h1>
        <p className="text-sm text-muted">
          Cumulez des points à chaque achat et débloquez des avantages exclusifs.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Carte principale tier */}
        <motion.section
          variants={staggerItem}
          className={cn(
            "rounded-2xl p-6 sm:p-8 text-white bg-gradient-to-br",
            TIER_COLORS[currentTier.name] ?? "from-terracotta to-terracotta-dark",
          )}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs uppercase tracking-wider mb-3">
                <Award className="w-3.5 h-3.5" />
                Niveau {TIER_LABELS[currentTier.name] ?? currentTier.name}
              </div>
              <p className="font-display text-4xl sm:text-5xl font-semibold leading-none">
                {data.points} pts
              </p>
              {nextTier ? (
                <p className="text-sm text-white/80 mt-3">
                  Plus que{" "}
                  <strong className="text-white">
                    {nextTier.minPoints - data.points} pts
                  </strong>{" "}
                  pour atteindre le niveau{" "}
                  {TIER_LABELS[nextTier.name] ?? nextTier.name}
                </p>
              ) : (
                <p className="text-sm text-white/80 mt-3">
                  Niveau maximum atteint. Merci de votre fidélité !
                </p>
              )}
            </div>
          </div>

          {nextTier && (
            <div className="mt-6">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs text-white/70 mt-1.5">
                <span>{currentTier.minPoints} pts</span>
                <span>{nextTier.minPoints} pts</span>
              </div>
            </div>
          )}
        </motion.section>

        {/* Grille des tiers */}
        <motion.section variants={staggerItem}>
          <h2 className="font-display text-lg font-semibold mb-4">
            Les niveaux ISHYA
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {tiers.map((tier) => {
              const isCurrent = tier.name === currentTier.name;
              const isReached = data.points >= tier.minPoints;
              return (
                <div
                  key={tier.name}
                  className={cn(
                    "rounded-xl p-4 border transition-colors",
                    isCurrent
                      ? "border-terracotta bg-terracotta/5"
                      : isReached
                        ? "border-border bg-white"
                        : "border-dashed border-border/50 bg-white/50",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center mb-3",
                      TIER_COLORS[tier.name] ?? "from-gray-300 to-gray-400",
                    )}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-display text-base font-semibold">
                    {TIER_LABELS[tier.name] ?? tier.name}
                  </p>
                  <p className="text-xs text-muted">
                    Dès {tier.minPoints} pts
                  </p>
                  {tier.pointsMultiplier > 1 && (
                    <p className="text-xs text-success font-medium mt-2">
                      ×{tier.pointsMultiplier} sur les achats
                    </p>
                  )}
                  {tier.perks.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {tier.perks.slice(0, 3).map((p, i) => (
                        <li key={i} className="text-xs text-muted">
                          • {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Historique transactions */}
        <motion.section
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-display text-lg font-semibold">
              Historique des points
            </h2>
            <span className="text-xs text-muted">
              {data.transactions.length} mouvement
              {data.transactions.length > 1 ? "s" : ""}
            </span>
          </div>

          {data.transactions.length === 0 ? (
            <div className="text-center py-10">
              <TrendingUp className="w-10 h-10 mx-auto text-muted-light mb-3" />
              <p className="text-sm text-muted">
                Aucun mouvement pour le moment.
              </p>
              <p className="text-xs text-muted mt-1">
                Passez votre première commande pour commencer à cumuler des
                points.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {data.transactions.map((tx) => {
                const config = TYPE_LABELS[tx.type] ?? {
                  label: tx.type,
                  className: "text-muted bg-muted-soft",
                  icon: TrendingUp,
                };
                const Icon = config.icon;
                const isNegative = tx.points < 0;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        config.className,
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.description ?? config.label}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted">
                        {tx.createdAt && <span>{formatDate(tx.createdAt)}</span>}
                        {tx.orderNumber && (
                          <Link
                            href={`/compte/commandes/${tx.orderNumber}`}
                            className="text-terracotta hover:underline"
                          >
                            · {tx.orderNumber}
                          </Link>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "font-mono text-sm font-semibold shrink-0",
                        isNegative ? "text-warning" : "text-success",
                      )}
                    >
                      {isNegative ? "" : "+"}
                      {tx.points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
}
