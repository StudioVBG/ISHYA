"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Mail,
  Search,
  Download,
  Trash2,
  Loader2,
  UserMinus,
  UserPlus,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  deleteNewsletterSubscriber,
  loadNewsletterPage,
  resubscribeNewsletter,
  unsubscribeNewsletter,
} from "./actions";
import type { NewsletterRow } from "./types";

export type { NewsletterRow };

type Filter = "all" | "active" | "unsubscribed" | "bounced";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "Tous" },
  { value: "active", label: "Actifs" },
  { value: "unsubscribed", label: "Désabonnés" },
  { value: "bounced", label: "Bounces" },
];

function exportCsv(rows: NewsletterRow[]) {
  const header = ["email", "source", "subscribed_at", "unsubscribed_at", "reason"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.email,
        r.source ?? "",
        r.subscribedAt ?? "",
        r.unsubscribedAt ?? "",
        (r.unsubscribeReason ?? "").replace(/[\n,]/g, " "),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function NewsletterView({
  initialRows,
  initialNextCursor,
  total,
  pageSize,
}: {
  initialRows: NewsletterRow[];
  initialNextCursor: string | null;
  total: number;
  pageSize: number;
}) {
  const [rows, setRows] = useState(initialRows);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [filter, setFilter] = useState<Filter>("active");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, startLoadingMore] = useTransition();

  const deletingRow = rows.find((r) => r.id === deletingId);

  const counts = useMemo(
    () => ({
      all: rows.length,
      active: rows.filter((r) => !r.unsubscribedAt).length,
      unsubscribed: rows.filter((r) => r.unsubscribedAt).length,
      bounced: rows.filter((r) => (r.bounceCount ?? 0) > 0).length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "active" && r.unsubscribedAt) return false;
      if (filter === "unsubscribed" && !r.unsubscribedAt) return false;
      if (filter === "bounced" && (r.bounceCount ?? 0) === 0) return false;
      if (!q) return true;
      return (
        r.email.toLowerCase().includes(q) ||
        (r.source ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  const handleUnsub = (id: string) => {
    startTransition(async () => {
      const res = await unsubscribeNewsletter(id, "Désabonné par admin");
      if (res.ok) toast.success("Désabonné");
      else toast.error(res.error || "Erreur");
    });
  };

  const handleResub = (id: string) => {
    // RGPD : on ne peut pas réabonner un client sans son consentement explicite.
    // L'admin doit confirmer qu'elle/il a reçu une demande explicite du client
    // (ex. par téléphone ou email). Le serveur enverra alors un email de
    // confirmation, et le client devra cliquer pour vraiment réactiver.
    const ok = window.confirm(
      "RGPD — Confirmez-vous que ce client a explicitement demandé son réabonnement ?\n\n" +
        "Un email de confirmation lui sera envoyé. Il ne recevra aucun email marketing tant qu'il n'aura pas cliqué sur le lien.",
    );
    if (!ok) return;
    startTransition(async () => {
      const res = await resubscribeNewsletter(id, { acknowledgedConsent: true });
      if (res.ok) {
        toast.success("Email de confirmation envoyé au client");
      } else {
        toast.error(res.error || "Erreur");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    const id = deletingId;
    startTransition(async () => {
      const res = await deleteNewsletterSubscriber(id);
      setDeletingId(null);
      if (res.ok) toast.success("Supprimé");
      else toast.error(res.error || "Erreur");
    });
  };

  const handleLoadMore = () => {
    if (!nextCursor) return;
    startLoadingMore(async () => {
      const res = await loadNewsletterPage(nextCursor, pageSize);
      if (!res.ok || !res.data) {
        toast.error(res.error ?? "Erreur de chargement");
        return;
      }
      setRows((prev) => {
        // Dedupe par id au cas où une mutation server (resubscribe) a
        // re-créé un row entre temps. La table garantit déjà l'unicité,
        // mais ce filtre rend la fonction idempotente.
        const seen = new Set(prev.map((r) => r.id));
        const fresh = res.data!.rows.filter((r) => !seen.has(r.id));
        return [...prev, ...fresh];
      });
      setNextCursor(res.data.nextCursor);
    });
  };

  const remaining = Math.max(0, total - rows.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Newsletter</h2>
          <p className="text-sm text-steel">
            {counts.active} actifs · {counts.unsubscribed} désabonnés ·{" "}
            {rows.length} chargés sur {total} au total
            {remaining > 0 ? ` (${remaining} non chargés)` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un email…"
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
            />
          </div>
          <button
            onClick={() => exportCsv(filtered)}
            className="inline-flex items-center gap-2 px-3 py-2 border border-border bg-white rounded-lg text-sm font-medium hover:border-ember/40 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          const count = counts[f.value];
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors",
                active
                  ? "bg-ember text-white border-ember"
                  : "bg-white text-foreground border-border hover:border-ember/40",
              )}
            >
              {f.label}
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
              <th className="text-left px-4 py-3 font-semibold">Email</th>
              <th className="text-left px-4 py-3 font-semibold">Source</th>
              <th className="text-left px-4 py-3 font-semibold">Inscription</th>
              <th className="text-left px-4 py-3 font-semibold">Statut</th>
              <th className="text-left px-4 py-3 font-semibold">Délivrabilité</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-steel">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Aucun abonné</p>
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-bone-soft/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{r.email}</td>
                  <td className="px-4 py-3 text-steel">
                    {r.source ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-bone-soft text-xs">
                        {r.source}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-steel">
                    {r.subscribedAt ? formatDate(r.subscribedAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.unsubscribedAt ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-destructive-soft text-destructive text-xs font-medium border border-destructive/30">
                        Désabonné
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-success-soft text-success text-xs font-medium border border-success/30">
                        Actif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.bounceCount > 0 ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border",
                          r.lastBounceType === "complaint"
                            ? "bg-destructive-soft text-destructive border-destructive/30"
                            : r.lastBounceType === "hard"
                              ? "bg-destructive-soft text-destructive border-destructive/30"
                              : "bg-warning-soft text-warning border-warning/30",
                        )}
                        title={
                          r.lastBounceReason ??
                          `Type ${r.lastBounceType ?? "?"} · ${r.bounceCount} bounce(s)`
                        }
                      >
                        {r.lastBounceType === "complaint"
                          ? "🚫 Plainte"
                          : r.lastBounceType === "hard"
                            ? `❌ ${r.bounceCount}× hard`
                            : `⚠ ${r.bounceCount}× soft`}
                      </span>
                    ) : (
                      <span className="text-xs text-steel-soft">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {r.unsubscribedAt ? (
                        <button
                          disabled={isPending}
                          onClick={() => handleResub(r.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-border rounded hover:border-ember/40 disabled:opacity-50"
                        >
                          {isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserPlus className="w-3 h-3" />
                          )}
                          Réabonner
                        </button>
                      ) : (
                        <button
                          disabled={isPending}
                          onClick={() => handleUnsub(r.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-border rounded hover:border-ember/40 disabled:opacity-50"
                        >
                          {isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserMinus className="w-3 h-3" />
                          )}
                          Désabonner
                        </button>
                      )}
                      <button
                        disabled={isPending}
                        onClick={() => setDeletingId(r.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-destructive/30 text-destructive bg-destructive-soft rounded hover:bg-destructive/15 disabled:opacity-50"
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

      {nextCursor ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-white rounded-lg text-sm font-medium hover:border-ember/40 disabled:opacity-50 transition-colors"
          >
            {isLoadingMore ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Charger {Math.min(pageSize, remaining)} de plus
          </button>
          <p className="text-xs text-steel-soft">
            {remaining} abonné{remaining > 1 ? "s" : ""} non chargé
            {remaining > 1 ? "s" : ""}
          </p>
        </div>
      ) : null}

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Supprimer définitivement cet abonné ?"
        description={
          deletingRow
            ? `${deletingRow.email} sera supprimé de la base. Préférez le désabonnement (gardé pour le réabonnement et la conformité).`
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
