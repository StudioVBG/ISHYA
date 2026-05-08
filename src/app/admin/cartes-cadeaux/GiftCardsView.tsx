"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Search,
  Loader2,
  Copy,
  X,
  Send,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import {
  resendGiftCardEmail,
  updateGiftCardStatus,
  type GiftCardStatus,
} from "./actions";

export interface GiftCardRow {
  id: string;
  code: string;
  initialAmount: number;
  amountRemaining: number;
  currency: string;
  recipientEmail: string;
  recipientName: string | null;
  senderName: string | null;
  senderEmail: string | null;
  message: string | null;
  deliveryDate: string | null;
  status: GiftCardStatus;
  paidAt: string | null;
  sentAt: string | null;
  expiresAt: string | null;
  createdAt: string | null;
}

const STATUS_LABELS: Record<GiftCardStatus, string> = {
  pending: "En attente",
  paid: "Payée",
  sent: "Envoyée",
  redeemed: "Utilisée",
  expired: "Expirée",
  cancelled: "Annulée",
};

const STATUS_STYLE: Record<GiftCardStatus, string> = {
  pending: "bg-warning-soft text-warning border-warning/30",
  paid: "bg-info-soft text-info border-info/30",
  sent: "bg-success-soft text-success border-success/30",
  redeemed: "bg-bone-soft text-steel border-border",
  expired: "bg-bone-soft text-steel-soft border-border",
  cancelled: "bg-destructive-soft text-destructive border-destructive/30",
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount);
}

type Filter = "all" | GiftCardStatus;

const FILTERS: Filter[] = [
  "all",
  "pending",
  "paid",
  "sent",
  "redeemed",
  "expired",
  "cancelled",
];

export function GiftCardsView({ cards }: { cards: GiftCardRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [drawerCard, setDrawerCard] = useState<GiftCardRow | null>(null);
  const [isResending, startResendTransition] = useTransition();

  // Synchronise le drawer avec les rows (si la carte est mise à jour, on
  // affiche les nouvelles valeurs sans la fermer).
  useEffect(() => {
    if (!drawerCard) return;
    const fresh = cards.find((c) => c.id === drawerCard.id);
    if (fresh && fresh !== drawerCard) setDrawerCard(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  // Escape ferme le drawer
  useEffect(() => {
    if (!drawerCard) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerCard(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [drawerCard]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: cards.length };
    for (const card of cards) c[card.status] = (c[card.status] ?? 0) + 1;
    return c;
  }, [cards]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      return (
        c.code.toLowerCase().includes(q) ||
        c.recipientEmail.toLowerCase().includes(q) ||
        (c.recipientName ?? "").toLowerCase().includes(q) ||
        (c.senderName ?? "").toLowerCase().includes(q)
      );
    });
  }, [cards, filter, search]);

  const handleStatus = (id: string, status: GiftCardStatus) => {
    startTransition(async () => {
      const res = await updateGiftCardStatus(id, status);
      if (res.ok) toast.success("Statut mis à jour");
      else toast.error(res.error || "Erreur");
    });
  };

  const handleResend = (card: GiftCardRow) => {
    startResendTransition(async () => {
      const res = await resendGiftCardEmail(card.id);
      if (res.ok) {
        toast.success(`Email renvoyé à ${card.recipientEmail}`);
      } else {
        toast.error(res.error || "Erreur");
      }
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copié");
  };

  const totalIssued = cards
    .filter((c) => c.status !== "cancelled")
    .reduce((s, c) => s + c.initialAmount, 0);
  const totalRemaining = cards
    .filter((c) => ["paid", "sent"].includes(c.status))
    .reduce((s, c) => s + c.amountRemaining, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Cartes cadeaux</h2>
          <p className="text-sm text-steel">
            {cards.length} cartes · Émis :{" "}
            <strong className="text-foreground">
              {formatMoney(totalIssued, "EUR")}
            </strong>{" "}
            · Solde actif :{" "}
            <strong className="text-foreground">
              {formatMoney(totalRemaining, "EUR")}
            </strong>
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Code, destinataire…"
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f;
          const count = counts[f] ?? 0;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors",
                active
                  ? "bg-ember text-white border-ember"
                  : "bg-white text-foreground border-border hover:border-ember/40",
              )}
            >
              {f === "all" ? "Toutes" : STATUS_LABELS[f]}
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-semibold",
                  active ? "bg-white/20" : "bg-bone-soft text-steel",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bone-soft text-xs uppercase tracking-wide text-steel">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Code</th>
              <th className="text-left px-4 py-3 font-semibold">Destinataire</th>
              <th className="text-left px-4 py-3 font-semibold">Émetteur</th>
              <th className="text-right px-4 py-3 font-semibold">Initial</th>
              <th className="text-right px-4 py-3 font-semibold">Restant</th>
              <th className="text-left px-4 py-3 font-semibold">Statut</th>
              <th className="text-left px-4 py-3 font-semibold">Créée</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-steel">
                  <Gift className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Aucune carte cadeau</p>
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-bone-soft/40 transition-colors cursor-pointer"
                  onClick={() => setDrawerCard(c)}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCode(c.code);
                      }}
                      aria-label={`Copier le code ${c.code}`}
                      className="inline-flex items-center gap-1 font-mono text-xs px-2 py-1 rounded bg-bone-soft hover:bg-muted transition-colors"
                      title="Copier"
                    >
                      {c.code}
                      <Copy className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-foreground">
                        {c.recipientName ?? "—"}
                      </p>
                      <p className="text-xs text-steel">{c.recipientEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-foreground">{c.senderName ?? "—"}</p>
                      <p className="text-xs text-steel">{c.senderEmail ?? ""}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatMoney(c.initialAmount, c.currency)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatMoney(c.amountRemaining, c.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border",
                        STATUS_STYLE[c.status],
                      )}
                    >
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-steel text-xs">
                    {c.createdAt ? formatDate(c.createdAt) : "—"}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <select
                        disabled={isPending}
                        value={c.status}
                        onChange={(e) =>
                          handleStatus(c.id, e.target.value as GiftCardStatus)
                        }
                        aria-label={`Statut de la carte ${c.code}`}
                        className="text-xs border border-border rounded px-2 py-1 bg-white disabled:opacity-50"
                      >
                        {(Object.keys(STATUS_LABELS) as GiftCardStatus[]).map(
                          (s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ),
                        )}
                      </select>
                      {isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin text-steel" />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {drawerCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setDrawerCard(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="gift-drawer-title"
            >
              <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
                <h2
                  id="gift-drawer-title"
                  className="text-base font-semibold text-foreground inline-flex items-center gap-2"
                >
                  <Gift className="w-4 h-4 text-ember" />
                  Carte cadeau
                </h2>
                <button
                  type="button"
                  onClick={() => setDrawerCard(null)}
                  aria-label="Fermer"
                  className="p-1.5 rounded-lg hover:bg-bone-soft text-steel transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 text-sm">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => copyCode(drawerCard.code)}
                    className="inline-flex items-center gap-2 font-mono text-base font-semibold px-3 py-2 rounded-lg bg-bone-soft hover:bg-muted transition-colors"
                    title="Copier le code"
                  >
                    {drawerCard.code}
                    <Copy className="w-4 h-4" />
                  </button>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border",
                      STATUS_STYLE[drawerCard.status],
                    )}
                  >
                    {STATUS_LABELS[drawerCard.status]}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <dt className="text-xs font-semibold text-steel uppercase tracking-wider">
                      Montant initial
                    </dt>
                    <dd className="text-foreground mt-0.5 text-lg font-semibold">
                      {formatMoney(drawerCard.initialAmount, drawerCard.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-steel uppercase tracking-wider">
                      Solde restant
                    </dt>
                    <dd className="text-foreground mt-0.5 text-lg font-semibold">
                      {formatMoney(drawerCard.amountRemaining, drawerCard.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-steel uppercase tracking-wider">
                      Destinataire
                    </dt>
                    <dd className="text-foreground mt-0.5">
                      {drawerCard.recipientName ?? "—"}
                      <br />
                      <span className="text-steel text-xs">
                        {drawerCard.recipientEmail}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-steel uppercase tracking-wider">
                      Émetteur
                    </dt>
                    <dd className="text-foreground mt-0.5">
                      {drawerCard.senderName ?? "—"}
                      {drawerCard.senderEmail && (
                        <>
                          <br />
                          <span className="text-steel text-xs">
                            {drawerCard.senderEmail}
                          </span>
                        </>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-steel uppercase tracking-wider">
                      Créée le
                    </dt>
                    <dd className="text-foreground mt-0.5">
                      {drawerCard.createdAt
                        ? formatDate(drawerCard.createdAt)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-steel uppercase tracking-wider">
                      Date de remise
                    </dt>
                    <dd className="text-foreground mt-0.5">
                      {drawerCard.deliveryDate
                        ? formatDate(drawerCard.deliveryDate)
                        : "Immédiate"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-steel uppercase tracking-wider">
                      Payée le
                    </dt>
                    <dd className="text-foreground mt-0.5">
                      {drawerCard.paidAt
                        ? formatDate(drawerCard.paidAt)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-steel uppercase tracking-wider">
                      Email envoyé le
                    </dt>
                    <dd className="text-foreground mt-0.5">
                      {drawerCard.sentAt
                        ? formatDate(drawerCard.sentAt)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-steel uppercase tracking-wider">
                      Expire le
                    </dt>
                    <dd className="text-foreground mt-0.5">
                      {drawerCard.expiresAt
                        ? formatDate(drawerCard.expiresAt)
                        : "Jamais"}
                    </dd>
                  </div>
                </dl>

                {drawerCard.message && (
                  <div>
                    <h3 className="text-xs font-semibold text-steel uppercase tracking-wider mb-2">
                      Message personnel
                    </h3>
                    <p className="bg-bone-soft rounded-lg p-3 text-foreground italic whitespace-pre-wrap">
                      « {drawerCard.message} »
                    </p>
                  </div>
                )}

                <div className="border-t border-border pt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleResend(drawerCard)}
                    disabled={
                      isResending ||
                      drawerCard.status === "cancelled" ||
                      drawerCard.status === "redeemed" ||
                      drawerCard.status === "expired"
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-foreground text-white rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                  >
                    {isResending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Renvoyer l&apos;email
                  </button>
                  <a
                    href={`mailto:${drawerCard.recipientEmail}?subject=Votre carte cadeau ISHYA`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-bone-soft transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Contacter par email
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
