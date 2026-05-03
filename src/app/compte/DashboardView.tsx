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
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/animations";
import type {
  AccountOrderListItem,
  AccountStats,
} from "@/lib/queries/account";

const loyaltyTiers = [
  { name: "Bronze", min: 0, color: "bg-orange-300" },
  { name: "Argent", min: 300, color: "bg-gray-400" },
  { name: "Or", min: 800, color: "bg-gold" },
  { name: "Platine", min: 1500, color: "bg-gray-700" },
];

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Payée", className: "bg-blue-100 text-blue-700" },
  processing: {
    label: "En préparation",
    className: "bg-orange-100 text-orange-700",
  },
  shipped: { label: "Expédiée", className: "bg-purple-100 text-purple-700" },
  delivered: { label: "Livrée", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée", className: "bg-red-100 text-red-700" },
  refunded: { label: "Remboursée", className: "bg-orange-100 text-orange-700" },
};

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
      color: "bg-terracotta/10 text-terracotta",
      href: "/compte/commandes",
    },
    {
      label: "Points fidélité",
      value: `${stats.loyaltyPoints} pts`,
      subtext: `Niveau ${capitalize(stats.loyaltyTier)}`,
      icon: Award,
      color: "bg-gold/10 text-gold-dark",
      href: "/compte/fidelite",
    },
    {
      label: "Favoris",
      value: String(stats.wishlistCount),
      icon: Heart,
      color: "bg-pink-50 text-pink-500",
      href: "/compte/favoris",
    },
    {
      label: "Avis laissés",
      value: String(stats.reviewsCount),
      icon: Star,
      color: "bg-amber-50 text-amber-600",
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
        <p className="text-muted mt-1">
          Bienvenue dans votre espace personnel ISHYA
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
      >
        {cards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={staggerItem}>
              <Link
                href={stat.href}
                className="block p-5 bg-white rounded-xl border border-border hover:border-terracotta/30 hover:shadow-sm transition-all group"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                    stat.color,
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-semibold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted mt-0.5">{stat.label}</p>
                {stat.subtext && (
                  <p className="text-xs text-gold-dark font-medium mt-1">
                    {stat.subtext}
                  </p>
                )}
              </Link>
            </motion.div>
          );
        })}
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
              className="text-sm text-terracotta hover:text-terracotta-dark font-medium flex items-center gap-1"
            >
              Tout voir
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_1fr_auto] gap-4 px-5 py-3 bg-ivory/50 text-xs font-medium text-muted uppercase tracking-wider border-b border-border">
              <span>N° Commande</span>
              <span>Date</span>
              <span>Statut</span>
              <span>Total</span>
              <span />
            </div>
            {recentOrders.map((order, i) => {
              const status = statusLabels[order.status] ?? {
                label: order.status,
                className: "bg-gray-100 text-gray-700",
              };
              return (
                <Link
                  key={order.id}
                  href={`/compte/commandes/${order.orderNumber}`}
                  className={cn(
                    "grid sm:grid-cols-[1fr_1fr_auto_1fr_auto] gap-2 sm:gap-4 px-5 py-4 hover:bg-beige-nude-light/30 transition-colors items-center",
                    i < recentOrders.length - 1 && "border-b border-border",
                  )}
                >
                  <span className="font-mono text-sm font-medium">
                    {order.orderNumber}
                  </span>
                  <span className="text-sm text-muted">
                    {formatDate(order.createdAt)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex px-2.5 py-1 rounded-full text-xs font-medium w-fit",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                  <span className="text-sm font-medium">
                    {formatPrice(order.total)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted hidden sm:block" />
                </Link>
              );
            })}
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
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Niveau{" "}
                <span className="text-gold-dark">{currentTier.name}</span>
              </p>
              <p className="text-xs text-muted">
                {stats.loyaltyPoints} points •{" "}
                {nextTier
                  ? `${nextTier.min - stats.loyaltyPoints} points avant le niveau ${nextTier.name}`
                  : "Niveau maximum atteint"}
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="flex justify-between text-[10px] text-muted mb-2">
              {loyaltyTiers.map((tier) => (
                <span
                  key={tier.name}
                  className={cn(
                    "font-medium",
                    stats.loyaltyPoints >= tier.min && "text-gold-dark",
                  )}
                >
                  {tier.name}
                </span>
              ))}
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border hover:border-terracotta/30 hover:shadow-sm transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-beige-nude-light flex items-center justify-center">
                  <Icon className="w-4 h-4 text-terracotta" />
                </div>
                <span className="text-sm font-medium group-hover:text-terracotta transition-colors">
                  {link.label}
                </span>
                <ChevronRight className="w-4 h-4 text-muted ml-auto" />
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
