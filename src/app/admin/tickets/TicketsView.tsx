"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  Headphones,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminTicketRow } from "@/lib/queries/admin";
import {
  assignTicketToMe,
  updateTicketPriority,
  updateTicketStatus,
} from "./actions";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  open: { label: "Ouvert", className: "bg-blue-50 text-blue-700" },
  in_progress: {
    label: "En cours",
    className: "bg-yellow-50 text-yellow-700",
  },
  waiting_customer: {
    label: "Attente client",
    className: "bg-purple-50 text-purple-700",
  },
  waiting_internal: {
    label: "Attente interne",
    className: "bg-orange-50 text-orange-700",
  },
  resolved: { label: "Résolu", className: "bg-emerald-50 text-emerald-700" },
  closed: { label: "Fermé", className: "bg-gray-100 text-gray-600" },
};

const PRIORITY_LABELS: Record<string, { label: string; className: string }> = {
  low: { label: "Basse", className: "bg-gray-100 text-gray-600" },
  medium: { label: "Moyenne", className: "bg-blue-50 text-blue-700" },
  high: { label: "Haute", className: "bg-orange-50 text-orange-700" },
  urgent: { label: "Urgente", className: "bg-red-50 text-red-700" },
};

const CATEGORY_LABELS: Record<string, string> = {
  order_issue: "Problème commande",
  product_question: "Question produit",
  shipping: "Livraison",
  return_exchange: "Retour / échange",
  payment: "Paiement",
  account: "Compte",
  complaint: "Réclamation",
  other: "Autre",
};

export function TicketsView({ tickets }: { tickets: AdminTicketRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !t.subject.toLowerCase().includes(q) &&
          !(t.customerEmail ?? "").toLowerCase().includes(q) &&
          !(t.customerName ?? "").toLowerCase().includes(q) &&
          !(t.orderNumber ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const openCount = tickets.filter((t) =>
    ["open", "in_progress", "waiting_customer", "waiting_internal"].includes(
      t.status,
    ),
  ).length;
  const urgentCount = tickets.filter(
    (t) => t.priority === "urgent" && t.status !== "closed",
  ).length;

  const transitionStatus = (id: string, status: string) => {
    setPendingId(id);
    startTransition(async () => {
      const res = await updateTicketStatus(id, status);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Statut mis à jour");
    });
  };

  const transitionPriority = (id: string, priority: string) => {
    setPendingId(id);
    startTransition(async () => {
      const res = await updateTicketPriority(id, priority);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Priorité mise à jour");
    });
  };

  const handleAssign = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      const res = await assignTicketToMe(id);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Ticket assigné");
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
        <h2 className="text-xl font-bold text-gray-900">Tickets support</h2>
        <p className="text-sm text-gray-500">
          {tickets.length} ticket{tickets.length > 1 ? "s" : ""} ·
          <span className="text-blue-700 ml-1">
            {openCount} ouvert{openCount > 1 ? "s" : ""}
          </span>
          {urgentCount > 0 && (
            <span className="text-red-600 ml-1">
              · {urgentCount} urgent{urgentCount > 1 ? "s" : ""}
            </span>
          )}
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
              placeholder="Rechercher (sujet, client, commande)..."
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
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          >
            <option value="">Toutes priorités</option>
            {Object.entries(PRIORITY_LABELS).map(([key, val]) => (
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
          <Headphones className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          {tickets.length === 0
            ? "Aucun ticket pour l'instant."
            : "Aucun ticket ne correspond à votre recherche."}
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="space-y-3">
          {filtered.map((t) => {
            const status = STATUS_LABELS[t.status] ?? {
              label: t.status,
              className: "bg-gray-100 text-gray-600",
            };
            const priority = PRIORITY_LABELS[t.priority] ?? {
              label: t.priority,
              className: "bg-gray-100 text-gray-600",
            };
            const categoryLabel = t.category
              ? CATEGORY_LABELS[t.category] ?? t.category
              : "—";
            const isLoading = isPending && pendingId === t.id;

            return (
              <div
                key={t.id}
                className={cn(
                  "bg-white rounded-xl border p-5",
                  t.priority === "urgent" && t.status !== "closed"
                    ? "border-red-200"
                    : "border-gray-200",
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          priority.className,
                        )}
                      >
                        {priority.label}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {categoryLabel}
                      </span>
                      {t.channel && (
                        <span className="text-xs text-gray-400">
                          · {t.channel}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">{t.subject}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {t.customerName ?? t.customerEmail ?? "Client inconnu"}
                      {t.customerEmail && t.customerName && (
                        <span className="text-gray-400">
                          {" "}
                          · {t.customerEmail}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mt-2">
                      {t.createdAt && (
                        <span>Ouvert le {formatDate(t.createdAt)}</span>
                      )}
                      {t.orderNumber && (
                        <Link
                          href={`/admin/commandes/${t.orderId}`}
                          className="text-terracotta hover:underline"
                        >
                          · Commande {t.orderNumber}
                        </Link>
                      )}
                      {!t.assignedTo && (
                        <span className="text-orange-600 font-medium">
                          · Non assigné
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <select
                    value={t.status}
                    onChange={(e) => transitionStatus(t.id, e.target.value)}
                    disabled={isLoading}
                    className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                  >
                    {Object.entries(STATUS_LABELS).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={t.priority}
                    onChange={(e) => transitionPriority(t.id, e.target.value)}
                    disabled={isLoading}
                    className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                  >
                    {Object.entries(PRIORITY_LABELS).map(([key, val]) => (
                      <option key={key} value={key}>
                        Priorité : {val.label}
                      </option>
                    ))}
                  </select>
                  {!t.assignedTo && (
                    <button
                      onClick={() => handleAssign(t.id)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-terracotta/10 text-terracotta rounded-lg text-xs font-medium hover:bg-terracotta/20 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <UserCheck className="w-3 h-3" />
                      )}
                      M&apos;assigner
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
