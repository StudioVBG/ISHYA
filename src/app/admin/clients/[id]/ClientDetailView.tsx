"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingCart,
  Star,
  Calendar,
  Award,
  Package,
  Cake,
  ShieldOff,
  Heart,
  Ruler,
  Bell,
  Coins,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import {
  StatusBadge,
  type OrderStatus,
} from "@/components/ui/StatusBadge";
import type { AdminClientDetail } from "@/lib/queries/admin";

const tierConfig: Record<string, { label: string; className: string }> = {
  bronze: { label: "Bronze", className: "bg-warning-soft text-warning" },
  silver: { label: "Argent", className: "bg-border text-foreground" },
  gold: { label: "Or", className: "bg-gold/15 text-gold-dark" },
  platinum: {
    label: "Platine",
    className: "bg-accent-purple-soft text-accent-purple",
  },
};

function formatActivityDate(value: string): string {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export function ClientDetailView({ client }: { client: AdminClientDetail }) {
  const fullName =
    [client.firstName, client.lastName].filter(Boolean).join(" ") ||
    "Client sans nom";
  const tier = tierConfig[client.loyaltyTier] ?? {
    label: client.loyaltyTier,
    className: "bg-muted-soft text-foreground",
  };

  const kpis = [
    { label: "CA total", value: formatPrice(client.totalSpent), icon: ShoppingCart },
    { label: "Commandes", value: String(client.ordersCount), icon: Package },
    { label: "Panier moyen", value: formatPrice(client.averageBasket), icon: Star },
    { label: "Points fidélité", value: `${client.loyaltyPoints} pts`, icon: Award },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={staggerItem}
        className="flex items-center gap-3"
      >
        <Link
          href="/admin/clients"
          className="p-2 rounded-lg hover:bg-muted-soft transition-colors"
          aria-label="Retour"
        >
          <ChevronLeft className="w-5 h-5 text-muted" />
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {client.avatarUrl ? (
            <Image
              src={client.avatarUrl}
              alt={fullName}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center">
              <User className="w-5 h-5 text-terracotta" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground truncate">
              {fullName}
            </h2>
            <p className="text-sm text-muted">
              {client.createdAt
                ? `Client depuis ${formatDate(client.createdAt)}`
                : "Date d'inscription inconnue"}
            </p>
          </div>
          {!client.isActive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive-soft text-destructive shrink-0">
              <ShieldOff className="w-3 h-3" />
              Désactivé
            </span>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              variants={staggerItem}
              className="bg-white rounded-xl border border-border p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-muted" />
                <span className="text-sm text-muted">{kpi.label}</span>
              </div>
              <p className="text-xl font-semibold text-foreground tabular-nums">
                {kpi.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-4">Informations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted" />
                <span className="text-foreground">{fullName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted" />
                <span className="text-foreground break-all">
                  {client.email ?? "—"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted" />
                <span className="text-foreground">{client.phone ?? "—"}</span>
              </div>
              {client.dateOfBirth && (
                <div className="flex items-center gap-3">
                  <Cake className="w-4 h-4 text-muted" />
                  <span className="text-foreground">
                    {formatDate(client.dateOfBirth)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted" />
                <span className="text-foreground">
                  {client.createdAt
                    ? `Inscrit le ${formatDate(client.createdAt)}`
                    : "Date inconnue"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-muted" />
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    tier.className,
                  )}
                >
                  {tier.label} · {client.loyaltyPoints} pts
                </span>
              </div>
              {client.lastLoginAt && (
                <p className="text-xs text-muted-light pt-2 border-t border-border/50">
                  Dernière connexion le {formatActivityDate(client.lastLoginAt)}
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-4">
              Adresses ({client.addresses.length})
            </h3>
            {client.addresses.length === 0 ? (
              <p className="text-sm text-muted-light">
                Aucune adresse enregistrée.
              </p>
            ) : (
              <div className="space-y-3">
                {client.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3 rounded-lg border border-border/60 text-sm"
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <MapPin className="w-3.5 h-3.5 text-muted" />
                      <span className="font-medium text-foreground">
                        {addr.label ??
                          (addr.type === "billing"
                            ? "Facturation"
                            : "Livraison")}
                      </span>
                      {addr.isDefault && (
                        <StatusBadge variant="success" size="sm">
                          Par défaut
                        </StatusBadge>
                      )}
                    </div>
                    <p className="text-foreground ml-5.5">
                      {addr.firstName} {addr.lastName}
                    </p>
                    {addr.company && (
                      <p className="text-muted ml-5.5">{addr.company}</p>
                    )}
                    <p className="text-muted ml-5.5">{addr.line1}</p>
                    {addr.line2 && (
                      <p className="text-muted ml-5.5">{addr.line2}</p>
                    )}
                    <p className="text-muted ml-5.5">
                      {addr.postalCode} {addr.city}
                      {addr.state ? ` (${addr.state})` : ""}
                    </p>
                    <p className="text-muted ml-5.5">{addr.country}</p>
                    {addr.phone && (
                      <p className="text-xs text-muted-light ml-5.5 mt-1">
                        {addr.phone}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-4">
              Historique des commandes ({client.orders.length})
            </h3>
            {client.orders.length === 0 ? (
              <p className="text-sm text-muted-light">
                Aucune commande pour ce client.
              </p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {client.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/commandes/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-ivory/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-terracotta truncate">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-muted-light mt-0.5">
                        {formatDate(order.createdAt)} · {order.itemCount}{" "}
                        article{order.itemCount > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1 shrink-0">
                      <p className="font-medium text-sm text-foreground tabular-nums">
                        {formatPrice(order.total)}
                      </p>
                      <StatusBadge
                        status={order.status as OrderStatus}
                        size="sm"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-4">
              Avis laissés ({client.reviews.length})
            </h3>
            {client.reviews.length === 0 ? (
              <p className="text-sm text-muted-light">
                Aucun avis publié.
              </p>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto">
                {client.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-3 rounded-lg border border-border/60"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {review.productName}
                      </span>
                      <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star
                            key={s}
                            className={cn(
                              "w-3.5 h-3.5",
                              s < review.rating
                                ? "text-gold fill-gold"
                                : "text-border",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    {review.title && (
                      <p className="text-sm font-medium text-foreground">
                        {review.title}
                      </p>
                    )}
                    {review.body && (
                      <p className="text-sm text-muted">{review.body}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-light">
                        {review.createdAt
                          ? formatDate(review.createdAt)
                          : "—"}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-wide font-semibold",
                          review.isApproved
                            ? "text-success"
                            : "text-warning",
                        )}
                      >
                        {review.isApproved ? "Publié" : "En attente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-4 inline-flex items-center gap-2">
              <Heart className="w-4 h-4 text-terracotta" />
              Wishlist ({client.wishlist.length})
            </h3>
            {client.wishlist.length === 0 ? (
              <p className="text-sm text-muted-light">
                Aucun produit en favoris.
              </p>
            ) : (
              <ul className="space-y-2">
                {client.wishlist.slice(0, 10).map((w) => (
                  <li
                    key={w.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <Link
                      href={`/produit/${w.productSlug}`}
                      target="_blank"
                      className="text-foreground hover:text-terracotta truncate"
                    >
                      {w.productName}
                    </Link>
                    <span className="text-xs text-muted-light shrink-0">
                      {w.createdAt ? formatDate(w.createdAt) : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-4 inline-flex items-center gap-2">
              <Ruler className="w-4 h-4 text-muted" />
              Tailles enregistrées ({client.savedSizes.length})
            </h3>
            {client.savedSizes.length === 0 ? (
              <p className="text-sm text-muted-light">
                Aucune taille enregistrée.
              </p>
            ) : (
              <div className="space-y-3">
                {client.savedSizes.map((s) => (
                  <div
                    key={s.id}
                    className="border border-border rounded-lg p-3"
                  >
                    <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">
                      {s.label}
                    </p>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                      {s.ringSize && (
                        <>
                          <dt className="text-muted">Bague</dt>
                          <dd className="text-foreground font-medium">
                            {s.ringSize}
                          </dd>
                        </>
                      )}
                      {s.braceletSize && (
                        <>
                          <dt className="text-muted">Bracelet</dt>
                          <dd className="text-foreground font-medium">
                            {s.braceletSize}
                          </dd>
                        </>
                      )}
                      {s.necklaceLength && (
                        <>
                          <dt className="text-muted">Collier</dt>
                          <dd className="text-foreground font-medium">
                            {s.necklaceLength}
                          </dd>
                        </>
                      )}
                      {s.ankletLength && (
                        <>
                          <dt className="text-muted">Cheville</dt>
                          <dd className="text-foreground font-medium">
                            {s.ankletLength}
                          </dd>
                        </>
                      )}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-4 inline-flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted" />
              Préférences de notification
            </h3>
            {client.notificationPreferences ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {(
                  [
                    ["emailMarketing", "Email · Marketing"],
                    ["emailOrderUpdates", "Email · Suivi commandes"],
                    ["emailReviewReplies", "Email · Réponses aux avis"],
                    ["smsMarketing", "SMS · Marketing"],
                    ["smsOrderUpdates", "SMS · Suivi commandes"],
                    ["pushEnabled", "Notifications push"],
                  ] as const
                ).map(([key, label]) => {
                  const enabled =
                    client.notificationPreferences?.[key] ?? false;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-2"
                    >
                      {enabled ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-light" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          enabled ? "text-foreground" : "text-muted-light",
                        )}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-light">
                Préférences par défaut (le client n&apos;a rien personnalisé).
              </p>
            )}
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-4 inline-flex items-center gap-2">
              <Coins className="w-4 h-4 text-gold" />
              Points de fidélité — historique
            </h3>
            {client.loyaltyTransactions.length === 0 ? (
              <p className="text-sm text-muted-light">
                Aucune transaction enregistrée.
              </p>
            ) : (
              <ul className="space-y-2">
                {client.loyaltyTransactions.slice(0, 12).map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 text-sm border-b border-border/40 last:border-0 pb-2 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-foreground">
                        {t.description ?? t.type}
                      </p>
                      <p className="text-xs text-muted-light">
                        {t.orderNumber ? `Commande ${t.orderNumber} · ` : ""}
                        {t.createdAt ? formatDate(t.createdAt) : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-mono font-semibold",
                        t.points >= 0 ? "text-success" : "text-destructive",
                      )}
                    >
                      {t.points >= 0 ? "+" : ""}
                      {t.points}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>

        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-xl border border-border p-5"
        >
          <h3 className="font-semibold text-foreground mb-4">
            Activité récente
          </h3>
          {client.activity.length === 0 ? (
            <p className="text-sm text-muted-light">
              Aucune activité enregistrée.
            </p>
          ) : (
            <div className="space-y-4 max-h-[760px] overflow-y-auto">
              {client.activity.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-terracotta mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{event.event}</p>
                    <p className="text-xs text-muted-light">
                      {formatActivityDate(event.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
