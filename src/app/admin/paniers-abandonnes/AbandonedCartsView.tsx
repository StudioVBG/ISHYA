"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Trash2,
  Loader2,
  Send,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { deleteAbandonedCart, sendReminderEmail } from "./actions";

export interface AbandonedCartRow {
  id: string;
  email: string | null;
  customerName: string | null;
  cartTotal: number | null;
  itemsCount: number;
  reminderSentAt: string | null;
  remindersCount: number;
  recovered: boolean;
  recoveredOrderNumber: string | null;
  recoveredOrderId: string | null;
  abandonedAt: string | null;
}

type Filter = "all" | "open" | "reminded" | "recovered";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "Tous" },
  { value: "open", label: "À relancer" },
  { value: "reminded", label: "Relancés" },
  { value: "recovered", label: "Récupérés" },
];

function formatMoney(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export function AbandonedCartsView({ rows }: { rows: AbandonedCartRow[] }) {
  const [filter, setFilter] = useState<Filter>("open");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const deletingCart = rows.find((r) => r.id === deletingId);

  const counts = useMemo(
    () => ({
      all: rows.length,
      open: rows.filter((r) => !r.recovered && !r.reminderSentAt).length,
      reminded: rows.filter((r) => !r.recovered && r.reminderSentAt).length,
      recovered: rows.filter((r) => r.recovered).length,
    }),
    [rows],
  );

  const totalOpen = useMemo(
    () =>
      rows
        .filter((r) => !r.recovered)
        .reduce((s, r) => s + (r.cartTotal ?? 0), 0),
    [rows],
  );

  const totalRecovered = useMemo(
    () =>
      rows
        .filter((r) => r.recovered)
        .reduce((s, r) => s + (r.cartTotal ?? 0), 0),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "open" && (r.recovered || r.reminderSentAt)) return false;
      if (filter === "reminded" && (r.recovered || !r.reminderSentAt))
        return false;
      if (filter === "recovered" && !r.recovered) return false;
      if (!q) return true;
      return (
        (r.email ?? "").toLowerCase().includes(q) ||
        (r.customerName ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  const handleRemind = (r: AbandonedCartRow) => {
    if (!r.email) {
      toast.error("Pas d'email pour ce panier");
      return;
    }
    if (r.remindersCount >= 3) {
      toast.error("Les 3 relances ont déjà été envoyées");
      return;
    }
    startTransition(async () => {
      const res = await sendReminderEmail(r.id);
      if (res.ok) {
        toast.success(`Relance #${res.step} envoyée à ${r.email}`);
      } else {
        toast.error(res.error || "Erreur");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    const id = deletingId;
    startTransition(async () => {
      const res = await deleteAbandonedCart(id);
      setDeletingId(null);
      if (res.ok) toast.success("Supprimé");
      else toast.error(res.error || "Erreur");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Paniers abandonnés
          </h2>
          <p className="text-sm text-muted">
            {counts.all} paniers · Manque à gagner :{" "}
            <strong className="text-foreground">
              {formatMoney(totalOpen)}
            </strong>{" "}
            · Récupéré :{" "}
            <strong className="text-success">
              {formatMoney(totalRecovered)}
            </strong>
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Email, nom…"
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors",
                active
                  ? "bg-terracotta text-white border-terracotta"
                  : "bg-white text-foreground border-border hover:border-terracotta/40",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-semibold",
                  active ? "bg-white/20" : "bg-muted-soft text-muted",
                )}
              >
                {counts[f.value]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted-soft text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Client</th>
              <th className="text-right px-4 py-3 font-semibold">Articles</th>
              <th className="text-right px-4 py-3 font-semibold">Montant</th>
              <th className="text-left px-4 py-3 font-semibold">Abandonné</th>
              <th className="text-left px-4 py-3 font-semibold">Relances</th>
              <th className="text-left px-4 py-3 font-semibold">Statut</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Aucun panier abandonné</p>
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted-soft/40">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-foreground">
                        {r.customerName ?? "—"}
                      </p>
                      <p className="text-xs text-muted">{r.email ?? "—"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-muted">
                    {r.itemsCount || "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {r.cartTotal != null ? formatMoney(r.cartTotal) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {r.abandonedAt ? formatDate(r.abandonedAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {r.remindersCount > 0 ? (
                      <div>
                        <span className="font-semibold text-foreground">
                          {r.remindersCount}
                        </span>{" "}
                        relance{r.remindersCount > 1 ? "s" : ""}
                        {r.reminderSentAt ? (
                          <p className="text-[10px]">
                            Dernière : {formatDate(r.reminderSentAt)}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.recovered ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-success-soft text-success border border-success/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Récupéré
                      </span>
                    ) : r.reminderSentAt ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-warning-soft text-warning border border-warning/20">
                        Relancé
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-terracotta/10 text-terracotta border border-terracotta/20">
                        À relancer
                      </span>
                    )}
                    {r.recoveredOrderNumber && r.recoveredOrderId ? (
                      <Link
                        href={`/admin/commandes/${r.recoveredOrderId}`}
                        className="block mt-1 text-[10px] text-terracotta hover:underline"
                      >
                        {r.recoveredOrderNumber}
                        <ExternalLink className="w-2.5 h-2.5 inline ml-0.5" />
                      </Link>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {!r.recovered && r.email ? (
                        <button
                          disabled={isPending || r.remindersCount >= 3}
                          onClick={() => handleRemind(r)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-border rounded hover:border-terracotta/40 disabled:opacity-50"
                          title={
                            r.remindersCount >= 3
                              ? "3 relances déjà envoyées"
                              : `Envoyer la relance #${r.remindersCount + 1}`
                          }
                        >
                          {isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          {r.remindersCount >= 3 ? "Épuisé" : "Relancer"}
                        </button>
                      ) : null}
                      <button
                        disabled={isPending}
                        onClick={() => setDeletingId(r.id)}
                        className="inline-flex items-center px-2 py-1 text-xs border border-destructive/30 text-destructive bg-destructive-soft rounded hover:bg-destructive/15 disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted">
        Le bouton « Relancer » envoie l&apos;email du palier suivant (#1, #2 ou
        #3) via Resend, en s&apos;appuyant sur la dédupe <code>email_logs</code>.
        Le cron <code>/api/cron/abandoned-carts</code> envoie automatiquement à
        1h / 24h / 48h.
      </p>

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Supprimer définitivement ce panier ?"
        description={
          deletingCart
            ? `Le panier de ${deletingCart.email ?? "(invité)"} sera supprimé. L'historique des relances sera perdu.`
            : undefined
        }
        confirmLabel="Supprimer"
        tone="destructive"
        pending={isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
