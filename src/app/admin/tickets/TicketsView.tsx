"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Headphones, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  StatusBadge,
  type StatusVariant,
} from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import type { AdminTicketRow } from "@/lib/queries/admin";
import {
  assignTicketToMe,
  updateTicketPriority,
  updateTicketStatus,
} from "./actions";

type StatusKey =
  | "open"
  | "in_progress"
  | "waiting_customer"
  | "waiting_internal"
  | "resolved"
  | "closed";

type PriorityKey = "low" | "medium" | "high" | "urgent";

const STATUS_CONFIG: Record<
  StatusKey,
  { label: string; variant: StatusVariant }
> = {
  open: { label: "Ouvert", variant: "info" },
  in_progress: { label: "En cours", variant: "warning" },
  waiting_customer: { label: "Attente client", variant: "accent" },
  waiting_internal: { label: "Attente interne", variant: "warning" },
  resolved: { label: "Résolu", variant: "success" },
  closed: { label: "Fermé", variant: "neutral" },
};

const PRIORITY_CONFIG: Record<
  PriorityKey,
  { label: string; variant: StatusVariant }
> = {
  low: { label: "Basse", variant: "neutral" },
  medium: { label: "Moyenne", variant: "info" },
  high: { label: "Haute", variant: "warning" },
  urgent: { label: "Urgente", variant: "destructive" },
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
        <h2 className="text-xl font-bold text-foreground">Tickets support</h2>
        <p className="text-sm text-steel">
          {tickets.length} ticket{tickets.length > 1 ? "s" : ""} ·
          <span className="text-info ml-1">
            {openCount} ouvert{openCount > 1 ? "s" : ""}
          </span>
          {urgentCount > 0 && (
            <span className="text-destructive ml-1">
              · {urgentCount} urgent{urgentCount > 1 ? "s" : ""}
            </span>
          )}
        </p>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-soft" />
            <input
              type="text"
              placeholder="Rechercher (sujet, client, commande)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
          >
            <option value="">Tous statuts</option>
            {(Object.entries(STATUS_CONFIG) as [StatusKey, { label: string; variant: StatusVariant }][]).map(
              ([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ),
            )}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
          >
            <option value="">Toutes priorités</option>
            {(Object.entries(PRIORITY_CONFIG) as [PriorityKey, { label: string; variant: StatusVariant }][]).map(
              ([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ),
            )}
          </select>
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-12 text-center text-steel-soft"
        >
          <Headphones className="w-8 h-8 mx-auto mb-2 text-steel-soft" />
          {tickets.length === 0
            ? "Aucun ticket pour l'instant."
            : "Aucun ticket ne correspond à votre recherche."}
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="space-y-3">
          {filtered.map((t) => {
            const status =
              STATUS_CONFIG[t.status as StatusKey] ?? {
                label: t.status,
                variant: "neutral" as StatusVariant,
              };
            const priority =
              PRIORITY_CONFIG[t.priority as PriorityKey] ?? {
                label: t.priority,
                variant: "neutral" as StatusVariant,
              };
            const categoryLabel = t.category
              ? CATEGORY_LABELS[t.category] ?? t.category
              : "—";
            const isLoading = isPending && pendingId === t.id;
            const isUrgent =
              t.priority === "urgent" && t.status !== "closed";

            return (
              <div
                key={t.id}
                className={cn(
                  "bg-white rounded-xl border p-5",
                  isUrgent ? "border-destructive/30" : "border-border",
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusBadge variant={priority.variant} size="sm">
                        {priority.label}
                      </StatusBadge>
                      <StatusBadge variant={status.variant} size="sm">
                        {status.label}
                      </StatusBadge>
                      <span className="text-xs text-steel">
                        {categoryLabel}
                      </span>
                      {t.channel && (
                        <span className="text-xs text-steel-soft">
                          · {t.channel}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/admin/tickets/${t.id}`}
                      className="font-medium text-foreground hover:text-ember transition-colors block"
                    >
                      {t.subject}
                    </Link>
                    <p className="text-sm text-steel mt-1">
                      {t.customerName ?? t.customerEmail ?? "Client inconnu"}
                      {t.customerEmail && t.customerName && (
                        <span className="text-steel-soft">
                          {" "}
                          · {t.customerEmail}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-steel-soft mt-2">
                      {t.createdAt && (
                        <span>Ouvert le {formatDate(t.createdAt)}</span>
                      )}
                      {t.orderNumber && (
                        <Link
                          href={`/admin/commandes/${t.orderId}`}
                          className="text-ember hover:underline"
                        >
                          · Commande {t.orderNumber}
                        </Link>
                      )}
                      {!t.assignedTo && (
                        <span className="text-warning font-medium">
                          · Non assigné
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/50">
                  <select
                    value={t.status}
                    onChange={(e) => transitionStatus(t.id, e.target.value)}
                    disabled={isLoading}
                    className="px-2 py-1 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ember/20"
                  >
                    {(Object.entries(STATUS_CONFIG) as [StatusKey, { label: string; variant: StatusVariant }][]).map(
                      ([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
                      ),
                    )}
                  </select>
                  <select
                    value={t.priority}
                    onChange={(e) =>
                      transitionPriority(t.id, e.target.value)
                    }
                    disabled={isLoading}
                    className="px-2 py-1 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ember/20"
                  >
                    {(Object.entries(PRIORITY_CONFIG) as [PriorityKey, { label: string; variant: StatusVariant }][]).map(
                      ([key, val]) => (
                        <option key={key} value={key}>
                          Priorité : {val.label}
                        </option>
                      ),
                    )}
                  </select>
                  {!t.assignedTo && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={UserCheck}
                      loading={isLoading}
                      disabled={isLoading}
                      onClick={() => handleAssign(t.id)}
                      className="bg-ember/10 text-ember hover:bg-ember/20"
                    >
                      M&apos;assigner
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
