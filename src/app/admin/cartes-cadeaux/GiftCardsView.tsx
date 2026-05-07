"use client";

import { useMemo, useState, useTransition } from "react";
import { Gift, Search, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { updateGiftCardStatus, type GiftCardStatus } from "./actions";

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
  redeemed: "bg-muted-soft text-foreground border-border",
  expired: "bg-muted-soft text-foreground border-border",
  cancelled: "bg-destructive-soft text-destructive border-destructive/30",
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount);
}

type Filter = "all" | GiftCardStatus;

const FILTERS: Filter[] = ["all", "pending", "paid", "sent", "redeemed", "expired", "cancelled"];

export function GiftCardsView({ cards }: { cards: GiftCardRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

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
          <h2 className="text-2xl font-semibold text-foreground">Cartes cadeaux</h2>
          <p className="text-sm text-muted">
            {cards.length} cartes · Émis :{" "}
            <strong className="text-foreground">{formatMoney(totalIssued, "EUR")}</strong> · Solde
            actif :{" "}
            <strong className="text-foreground">{formatMoney(totalRemaining, "EUR")}</strong>
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Code, destinataire…"
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
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
                  ? "bg-terracotta text-white border-terracotta"
                  : "bg-white text-foreground border-border hover:border-terracotta/40",
              )}
            >
              {f === "all" ? "Toutes" : STATUS_LABELS[f]}
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-semibold",
                  active ? "bg-white/20" : "bg-muted-soft text-muted",
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
          <thead className="bg-muted-soft text-xs uppercase tracking-wide text-muted">
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
                <td colSpan={8} className="text-center py-12 text-muted">
                  <Gift className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Aucune carte cadeau</p>
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-muted-soft/40 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copyCode(c.code)}
                      className="inline-flex items-center gap-1 font-mono text-xs px-2 py-1 rounded bg-muted-soft hover:bg-muted transition-colors"
                      title="Copier"
                    >
                      {c.code}
                      <Copy className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-foreground">{c.recipientName ?? "—"}</p>
                      <p className="text-xs text-muted">{c.recipientEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-foreground">{c.senderName ?? "—"}</p>
                      <p className="text-xs text-muted">{c.senderEmail ?? ""}</p>
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
                  <td className="px-4 py-3 text-muted text-xs">
                    {c.createdAt ? formatDate(c.createdAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <select
                        disabled={isPending}
                        value={c.status}
                        onChange={(e) =>
                          handleStatus(c.id, e.target.value as GiftCardStatus)
                        }
                        className="text-xs border border-border rounded px-2 py-1 bg-white disabled:opacity-50"
                      >
                        {(Object.keys(STATUS_LABELS) as GiftCardStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                      {isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin text-muted" />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
