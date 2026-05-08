"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  Award,
  Heart,
  Star,
  ChevronRight,
  User,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { StatusBadge, type OrderStatus } from "@/components/ui/StatusBadge";
import { KPICard } from "@/components/ui/KPICard";
import type {
  AccountOrderListItem,
  AccountStats,
} from "@/lib/queries/account";

const loyaltyTiers = [
  { name: "Bronze", min: 0, gradient: "from-terracotta-light to-terracotta" },
  { name: "Argent", min: 300, gradient: "from-muted-light to-muted" },
  { name: "Or", min: 800, gradient: "from-gold-light to-gold" },
  { name: "Platine", min: 1500, gradient: "from-foreground/70 to-foreground" },
];

const quickLinks = [
  { label: "Modifier mon profil", href: "/compte/profil", icon: User },
  { label: "Voir mes favoris", href: "/compte/favoris", icon: Heart },
  { label: "Contacter le support", href: "/contact", icon: MessageCircle },
];

export function DashboardView({
  firstName,
  stats,
  recentOrders,
}: {
  firstName: string | null;
  stats: AccountStats;
  recentOrders: AccountOrderListItem[];
}) {
  const cards = [
    {
      label: "Commandes",
      value: String(stats.ordersCount),
      icon: Package,
      variant: "brand" as const,
      href: "/compte/commandes",
    },
    {
      label: "Points fidélité",
      value: `${stats.loyaltyPoints} pts`,
      detail: `Niveau ${capitalize(stats.loyaltyTier)}`,
      icon: Award,
      variant: "gold" as const,
      href: "/compte/fidelite",
    },
    {
      label: "Favoris",
      value: String(stats.wishlistCount),
      icon: Heart,
      variant: "brand" as const,
      href: "/compte/favoris",
    },
    {
      label: "Avis laissés",
      value: String(stats.reviewsCount),
      icon: Star,
      variant: "warning" as const,
      href: "/compte/avis",
    },
  ];

  const currentTierIndex = Math.max(
    0,
    loyaltyTiers
      .slice()
      .reverse()
      .findIndex((t) => stats.loyaltyPoints >= t.min),
  );
  const tierIndex = loyaltyTiers.length - 1 - currentTierIndex;
  const nextTier = loyaltyTiers[tierIndex + 1];
  const currentTier = loyaltyTiers[tierIndex];
  const progressToNext = nextTier
    ? Math.min(
        100,
        ((stats.loyaltyPoints - currentTier.min) /
          (nextTier.min - currentTier.min)) *
          100,
      )
    : 100;

  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
          Bonjour{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="text-steel mt-1">
          Bienvenue dans votre espace personnel ISHYA
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
      >
        {cards.map((stat) => (
          <KPICard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            detail={stat.detail}
            icon={stat.icon}
            variant={stat.variant}
            href={stat.href}
          />
        ))}
      </motion.div>

      {recentOrders.length > 0 && (
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">
              Commandes récentes
            </h2>
            <Link
              href="/compte/commandes"
              className="text-sm text-ember hover:text-ember-deep font-medium flex items-center gap-1"
            >
              Tout voir
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-bone-soft rounded-xl border border-border overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_1fr_auto] gap-4 px-5 py-3 bg-ivory/50 text-xs font-medium text-steel uppercase tracking-wider border-b border-border">
              <span>N° Commande</span>
              <span>Date</span>
              <span>Statut</span>
              <span>Total</span>
              <span />
            </div>
            {recentOrders.map((order, i) => (
              <Link
                key={order.id}
                href={`/compte/commandes/${order.orderNumber}`}
                className={cn(
                  "grid sm:grid-cols-[1fr_1fr_auto_1fr_auto] gap-2 sm:gap-4 px-5 py-4 hover:bg-bone-soft/30 transition-colors items-center",
                  i < recentOrders.length - 1 && "border-b border-border",
                )}
              >
                <span className="font-mono text-sm font-medium">
                  {order.orderNumber}
                </span>
                <span className="text-sm text-steel">
                  {formatDate(order.createdAt)}
                </span>
                <StatusBadge status={order.status as OrderStatus} />
                <span className="text-sm font-medium tabular-nums">
                  {formatPrice(order.total)}
                </span>
                <ChevronRight className="w-4 h-4 text-steel hidden sm:block" />
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      <motion.section
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mb-10"
      >
        <h2 className="font-display text-lg font-semibold mb-4">
          Programme de fidélité
        </h2>
        <div className="bg-bone-soft rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-bone",
                currentTier.gradient,
              )}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Niveau{" "}
                <span className="text-ember-deep">{currentTier.name}</span>
              </p>
              <p className="text-xs text-steel">
                {stats.loyaltyPoints} points •{" "}
                {nextTier
                  ? `${nextTier.min - stats.loyaltyPoints} points avant le niveau ${nextTier.name}`
                  : "Niveau maximum atteint"}
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="flex justify-between text-[10px] text-steel mb-2">
              {loyaltyTiers.map((tier) => (
                <span
                  key={tier.name}
                  className={cn(
                    "font-medium uppercase tracking-wider",
                    stats.loyaltyPoints >= tier.min && "text-ember-deep",
                  )}
                >
                  {tier.name}
                </span>
              ))}
            </div>
            <div className="h-2 bg-bone-soft rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((tierIndex + progressToNext / 100) / (loyaltyTiers.length - 1)) * 100}%`,
                }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-gold-light to-gold"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <h2 className="font-display text-lg font-semibold mb-4">Accès rapide</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 p-4 bg-bone-soft rounded-xl border border-border hover:border-ember/30 hover:shadow-sm transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-bone-soft flex items-center justify-center">
                  <Icon className="w-4 h-4 text-ember" />
                </div>
                <span className="text-sm font-medium group-hover:text-ember transition-colors">
                  {link.label}
                </span>
                <ChevronRight className="w-4 h-4 text-steel ml-auto" />
              </Link>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
