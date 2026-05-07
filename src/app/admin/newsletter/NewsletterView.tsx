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
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import {
  deleteNewsletterSubscriber,
  resubscribeNewsletter,
  unsubscribeNewsletter,
} from "./actions";

export interface NewsletterRow {
  id: string;
  email: string;
  source: string | null;
  subscribedAt: string | null;
  unsubscribedAt: string | null;
  unsubscribeReason: string | null;
  confirmedAt: string | null;
  marketingConsent: boolean;
}

type Filter = "all" | "active" | "unsubscribed";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "Tous" },
  { value: "active", label: "Actifs" },
  { value: "unsubscribed", label: "Désabonnés" },
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
  rows,
  totalLimit,
}: {
  rows: NewsletterRow[];
  totalLimit?: number;
}) {
  const [filter, setFilter] = useState<Filter>("active");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const counts = useMemo(
    () => ({
      all: rows.length,
      active: rows.filter((r) => !r.unsubscribedAt).length,
      unsubscribed: rows.filter((r) => r.unsubscribedAt).length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "active" && r.unsubscribedAt) return false;
      if (filter === "unsubscribed" && !r.unsubscribedAt) return false;
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

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer définitivement cet abonné ?")) return;
    startTransition(async () => {
      const res = await deleteNewsletterSubscriber(id);
      if (res.ok) toast.success("Supprimé");
      else toast.error(res.error || "Erreur");
    });
  };

  const isTruncated = totalLimit != null && rows.length >= totalLimit;

  return (
    <div className="space-y-6">
      {isTruncated ? (
        <div className="rounded-lg border border-warning bg-warning-soft px-4 py-3 text-sm text-foreground">
          La liste est tronquée à {totalLimit} abonnés (les plus récents).
          Pour exporter l&apos;intégralité, utilisez le bouton « Export CSV »
          (limité à la même fenêtre) ou demandez un export complet via une
          requête SQL côté Supabase.
        </div>
      ) : null}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Newsletter</h2>
          <p className="text-sm text-muted">
            {counts.active} actifs · {counts.unsubscribed} désabonnés ·{" "}
            {counts.all} au total
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un email…"
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          <button
            onClick={() => exportCsv(filtered)}
            className="inline-flex items-center gap-2 px-3 py-2 border border-border bg-white rounded-lg text-sm font-medium hover:border-terracotta/40 transition-colors"
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
              <th className="text-left px-4 py-3 font-semibold">Email</th>
              <th className="text-left px-4 py-3 font-semibold">Source</th>
              <th className="text-left px-4 py-3 font-semibold">Inscription</th>
              <th className="text-left px-4 py-3 font-semibold">Statut</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Aucun abonné</p>
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted-soft/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{r.email}</td>
                  <td className="px-4 py-3 text-muted">
                    {r.source ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted-soft text-xs">
                        {r.source}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.subscribedAt ? formatDate(r.subscribedAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.unsubscribedAt ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                        Désabonné
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                        Actif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {r.unsubscribedAt ? (
                        <button
                          disabled={isPending}
                          onClick={() => handleResub(r.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-border rounded hover:border-terracotta/40 disabled:opacity-50"
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
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-border rounded hover:border-terracotta/40 disabled:opacity-50"
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
                        onClick={() => handleDelete(r.id)}
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
    </div>
  );
}
