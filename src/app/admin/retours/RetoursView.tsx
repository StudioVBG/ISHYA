"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  RotateCcw,
  Check,
  X,
  Package,
  CircleCheck,
  Coins,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminReturnRow } from "@/lib/queries/admin";
import { updateReturnStatus } from "./actions";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  requested: { label: "Demandé", className: "bg-yellow-50 text-yellow-700" },
  approved: { label: "Approuvé", className: "bg-blue-50 text-blue-700" },
  rejected: { label: "Refusé", className: "bg-red-50 text-red-700" },
  shipped_back: {
    label: "Renvoyé",
    className: "bg-purple-50 text-purple-700",
  },
  received: { label: "Reçu", className: "bg-cyan-50 text-cyan-700" },
  inspected: { label: "Inspecté", className: "bg-indigo-50 text-indigo-700" },
  refunded: { label: "Remboursé", className: "bg-emerald-50 text-emerald-700" },
  exchanged: { label: "Échangé", className: "bg-emerald-50 text-emerald-700" },
  closed: { label: "Fermé", className: "bg-gray-100 text-gray-600" },
};

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
        <h2 className="text-xl font-bold text-gray-900">Retours</h2>
        <p className="text-sm text-gray-500">
          {returns.length} retour{returns.length > 1 ? "s" : ""} ·
          <span className="text-yellow-700 ml-1">
            {requestedCount} en attente de traitement
          </span>
        </p>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-gray-200 p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par n° commande, email ou nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          >
            <option value="">Tous statuts</option>
            {Object.entries(STATUS_LABELS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400"
        >
          <RotateCcw className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          {returns.length === 0
            ? "Aucun retour pour l'instant."
            : "Aucun retour ne correspond à votre recherche."}
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="space-y-3">
          {filtered.map((r) => {
            const status = STATUS_LABELS[r.status] ?? {
              label: r.status,
              className: "bg-gray-100 text-gray-600",
            };
            const reasonLabel = r.reason
              ? REASON_LABELS[r.reason] ?? r.reason
              : "—";
            const isLoading = isPending && pendingId === r.id;

            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-gray-200 p-5"
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
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {reasonLabel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {r.customerName ?? r.customerEmail ?? "Client inconnu"}
                    </p>
                    {r.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {r.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mt-2">
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

                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                  {r.status === "requested" && (
                    <>
                      <button
                        onClick={() => transition(r.id, "approved")}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Approuver
                      </button>
                      <button
                        onClick={() => transition(r.id, "rejected")}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        Refuser
                      </button>
                    </>
                  )}
                  {r.status === "approved" && (
                    <button
                      onClick={() => transition(r.id, "received")}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-medium hover:bg-cyan-100 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Package className="w-3.5 h-3.5" />
                      )}
                      Marquer reçu
                    </button>
                  )}
                  {(r.status === "received" || r.status === "inspected") && (
                    <button
                      onClick={() => transition(r.id, "refunded")}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Coins className="w-3.5 h-3.5" />
                      )}
                      Marquer remboursé
                    </button>
                  )}
                  {r.status !== "closed" && r.status !== "rejected" && (
                    <button
                      onClick={() => transition(r.id, "closed")}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <CircleCheck className="w-3.5 h-3.5" />
                      Fermer
                    </button>
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
