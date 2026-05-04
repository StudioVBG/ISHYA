"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  RotateCcw,
  Check,
  X,
  Package,
  CircleCheck,
  Coins,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { StatusBadge, type OrderStatus } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import type { AdminReturnRow } from "@/lib/queries/admin";
import { updateReturnStatus } from "./actions";

const statusFilterOptions: { value: string; label: string }[] = [
  { value: "requested", label: "Demandé" },
  { value: "approved", label: "Approuvé" },
  { value: "rejected", label: "Refusé" },
  { value: "shipped_back", label: "Renvoyé" },
  { value: "received", label: "Reçu" },
  { value: "inspected", label: "Inspecté" },
  { value: "refunded", label: "Remboursé" },
  { value: "exchanged", label: "Échangé" },
  { value: "closed", label: "Fermé" },
];

const REASON_LABELS: Record<string, string> = {
  wrong_size: "Mauvaise taille",
  defective: "Produit défectueux",
  not_as_described: "Différent de la description",
  changed_mind: "Changement d'avis",
  arrived_late: "Arrivé en retard",
  wrong_item: "Mauvais article",
  other: "Autre",
};

export function RetoursView({ returns }: { returns: AdminReturnRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return returns.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !(r.orderNumber ?? "").toLowerCase().includes(q) &&
          !(r.customerEmail ?? "").toLowerCase().includes(q) &&
          !(r.customerName ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [returns, search, statusFilter]);

  const requestedCount = returns.filter((r) => r.status === "requested").length;

  const transition = (id: string, status: string) => {
    setPendingId(id);
    startTransition(async () => {
      const res = await updateReturnStatus(id, status);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Statut mis à jour");
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-bold text-foreground">Retours</h2>
        <p className="text-sm text-muted">
          {returns.length} retour{returns.length > 1 ? "s" : ""} ·
          <span className="text-warning ml-1">
            {requestedCount} en attente de traitement
          </span>
        </p>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
            <input
              type="text"
              placeholder="Rechercher par n° commande, email ou nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          >
            <option value="">Tous statuts</option>
            {statusFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-12 text-center text-muted-light"
        >
          <RotateCcw className="w-8 h-8 mx-auto mb-2 text-muted-light" />
          {returns.length === 0
            ? "Aucun retour pour l'instant."
            : "Aucun retour ne correspond à votre recherche."}
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="space-y-3">
          {filtered.map((r) => {
            const reasonLabel = r.reason
              ? REASON_LABELS[r.reason] ?? r.reason
              : "—";
            const isLoading = isPending && pendingId === r.id;

            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-border p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link
                        href={`/admin/commandes/${r.orderId}`}
                        className="font-mono text-sm text-terracotta hover:underline"
                      >
                        {r.orderNumber ?? r.orderId.slice(0, 8)}
                      </Link>
                      <StatusBadge
                        status={r.status as OrderStatus}
                        size="sm"
                      />
                      <span className="text-xs text-muted">{reasonLabel}</span>
                    </div>
                    <p className="text-sm text-foreground">
                      {r.customerName ?? r.customerEmail ?? "Client inconnu"}
                    </p>
                    {r.description && (
                      <p className="text-xs text-muted mt-1">{r.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-light mt-2">
                      {r.requestedAt && (
                        <span>Demandé le {formatDate(r.requestedAt)}</span>
                      )}
                      {r.refundAmount != null && (
                        <span>
                          · Remboursement {formatPrice(r.refundAmount)}
                        </span>
                      )}
                      {r.refundedAt && (
                        <span>· Remboursé le {formatDate(r.refundedAt)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                  {r.status === "requested" && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Check}
                        loading={isLoading}
                        disabled={isLoading}
                        onClick={() => transition(r.id, "approved")}
                        className="bg-success-soft text-success hover:bg-success/15 hover:text-success"
                      >
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={X}
                        disabled={isLoading}
                        onClick={() => transition(r.id, "rejected")}
                        className="bg-destructive-soft text-destructive hover:bg-destructive/15 hover:text-destructive"
                      >
                        Refuser
                      </Button>
                    </>
                  )}
                  {r.status === "approved" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Package}
                      loading={isLoading}
                      disabled={isLoading}
                      onClick={() => transition(r.id, "received")}
                      className="bg-info-soft text-info hover:bg-info/15 hover:text-info"
                    >
                      Marquer reçu
                    </Button>
                  )}
                  {(r.status === "received" || r.status === "inspected") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Coins}
                      loading={isLoading}
                      disabled={isLoading}
                      onClick={() => transition(r.id, "refunded")}
                      className="bg-success-soft text-success hover:bg-success/15 hover:text-success"
                    >
                      Marquer remboursé
                    </Button>
                  )}
                  {r.status !== "closed" && r.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={CircleCheck}
                      disabled={isLoading}
                      onClick={() => transition(r.id, "closed")}
                    >
                      Fermer
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
