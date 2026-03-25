"use client";

import { motion } from "framer-motion";
import {
  Gift,
  Award,
  Star,
  TrendingUp,
  ShoppingBag,
  MessageSquare,
  UserPlus,
  Check,
  Lock,
  Sparkles,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const currentPoints = 450;
const currentTier = "Argent";
const currentTierIndex = 1;

const tiers = [
  {
    name: "Bronze",
    min: 0,
    icon: "🥉",
    color: "from-orange-200 to-orange-300",
    textColor: "text-orange-700",
    perks: [
      "Livraison offerte dès 60€",
      "Accès aux ventes privées",
      "Newsletter exclusive",
    ],
  },
  {
    name: "Argent",
    min: 300,
    icon: "🥈",
    color: "from-gray-200 to-gray-400",
    textColor: "text-gray-700",
    perks: [
      "Livraison offerte dès 40€",
      "Accès anticipé aux collections",
      "-5% sur votre anniversaire",
      "Emballage cadeau offert",
    ],
  },
  {
    name: "Or",
    min: 800,
    icon: "🥇",
    color: "from-amber-200 to-amber-400",
    textColor: "text-amber-700",
    perks: [
      "Livraison offerte",
      "Accès exclusif aux éditions limitées",
      "-10% permanent",
      "Retours gratuits sous 60 jours",
      "Service client prioritaire",
    ],
  },
  {
    name: "Platine",
    min: 1500,
    icon: "💎",
    color: "from-violet-200 to-violet-400",
    textColor: "text-violet-700",
    perks: [
      "Livraison express offerte",
      "Bijou exclusif pour votre anniversaire",
      "-15% permanent",
      "Invitations événements VIP",
      "Personal shopper dédié",
      "Gravure offerte",
    ],
  },
];

const pointsHistory = [
  {
    date: "2026-03-15",
    description: "Commande #ISH-2K6F3A-X9R2",
    points: 97,
    type: "earn" as const,
  },
  {
    date: "2026-03-08",
    description: "Commande #ISH-2K5M1B-T4P7",
    points: 45,
    type: "earn" as const,
  },
  {
    date: "2026-03-01",
    description: "Avis publié - Pack Duo Floral",
    points: 20,
    type: "earn" as const,
  },
  {
    date: "2026-02-22",
    description: "Commande #ISH-2K4H9C-J6N1",
    points: 72,
    type: "earn" as const,
  },
  {
    date: "2026-02-14",
    description: "Bonus Saint-Valentin",
    points: 50,
    type: "earn" as const,
  },
  {
    date: "2026-02-10",
    description: "Avis publié - Bague Pivoine",
    points: 20,
    type: "earn" as const,
  },
  {
    date: "2026-01-20",
    description: "Remise fidélité utilisée",
    points: -100,
    type: "spend" as const,
  },
  {
    date: "2026-01-15",
    description: "Commande #ISH-2K2B4E-R8L3",
    points: 52,
    type: "earn" as const,
  },
];

const earnMethods = [
  {
    icon: ShoppingBag,
    title: "Achats",
    description: "1 point par euro dépensé",
  },
  {
    icon: MessageSquare,
    title: "Avis",
    description: "20 points par avis publié",
  },
  {
    icon: UserPlus,
    title: "Parrainage",
    description: "100 points par filleul(e)",
  },
  {
    icon: Gift,
    title: "Anniversaire",
    description: "50 points le jour J",
  },
];

export default function FidelitePage() {
  const nextTier = tiers[currentTierIndex + 1];
  const prevTierMin = tiers[currentTierIndex].min;
  const progressToNext = nextTier
    ? ((currentPoints - prevTierMin) / (nextTier.min - prevTierMin)) * 100
    : 100;

  return (
    <div>
      <motion.h1
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="font-display text-2xl sm:text-3xl font-semibold mb-8"
      >
        Programme de fidélité
      </motion.h1>

      {/* Current tier card */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className={cn(
          "rounded-2xl p-6 sm:p-8 mb-8 bg-gradient-to-br text-foreground relative overflow-hidden",
          tiers[currentTierIndex].color
        )}
      >
        <div className="absolute top-4 right-4 text-5xl opacity-30">
          {tiers[currentTierIndex].icon}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Niveau actuel
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-1">
            {currentTier}
          </h2>
          <p className="text-lg font-semibold">
            {currentPoints}{" "}
            <span className="text-sm font-normal">points</span>
          </p>

          {nextTier && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progression vers {nextTier.name}</span>
                <span className="font-semibold">
                  {nextTier.min - currentPoints} pts restants
                </span>
              </div>
              <div className="h-3 bg-white/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  className="h-full rounded-full bg-white"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tier comparison */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <h2 className="font-display text-lg font-semibold mb-4">
          Avantages par niveau
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier, i) => {
            const isCurrentOrAbove = i <= currentTierIndex;
            const isCurrent = i === currentTierIndex;
            return (
              <div
                key={tier.name}
                className={cn(
                  "rounded-xl border p-4 transition-all",
                  isCurrent
                    ? "border-terracotta bg-terracotta/5 shadow-sm"
                    : isCurrentOrAbove
                      ? "border-border bg-white"
                      : "border-border bg-gray-50"
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{tier.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{tier.name}</p>
                    <p className="text-[10px] text-muted">
                      {tier.min}+ points
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] font-medium bg-terracotta text-white rounded-full">
                      Actuel
                    </span>
                  )}
                </div>
                <ul className="space-y-1.5">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-1.5 text-xs">
                      {isCurrentOrAbove ? (
                        <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-muted-light shrink-0 mt-0.5" />
                      )}
                      <span
                        className={cn(
                          !isCurrentOrAbove && "text-muted"
                        )}
                      >
                        {perk}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* How to earn */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="mb-10"
      >
        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold" />
          Comment gagner des points
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {earnMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.title}
                className="bg-white rounded-xl border border-border p-4 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-beige-nude-light flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-terracotta" />
                </div>
                <p className="text-sm font-medium">{method.title}</p>
                <p className="text-xs text-muted mt-0.5">
                  {method.description}
                </p>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Points history */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <h2 className="font-display text-lg font-semibold mb-4">
          Historique des points
        </h2>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {pointsHistory.map((entry, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className={cn(
                "flex items-center justify-between px-5 py-3.5",
                i < pointsHistory.length - 1 && "border-b border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    entry.type === "earn"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  )}
                >
                  {entry.type === "earn" ? "+" : "−"}
                </div>
                <div>
                  <p className="text-sm font-medium">{entry.description}</p>
                  <p className="text-xs text-muted">{formatDate(entry.date)}</p>
                </div>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold",
                  entry.type === "earn" ? "text-success" : "text-destructive"
                )}
              >
                {entry.points > 0 ? "+" : ""}
                {entry.points} pts
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
