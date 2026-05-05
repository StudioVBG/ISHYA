"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Send,
  Loader2,
  ShieldCheck,
  User,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { StatusBadge, type StatusVariant } from "@/components/ui/StatusBadge";
import type { AdminTicketDetail } from "@/lib/queries/admin";
import {
  replyToTicketAsAdmin,
  updateTicketPriority,
  updateTicketStatus,
} from "../actions";

const STATUS_LABELS: Record<string, { label: string; variant: StatusVariant }> = {
  open: { label: "Ouvert", variant: "info" },
  in_progress: { label: "En cours", variant: "warning" },
  waiting_customer: { label: "Attente client", variant: "accent" },
  waiting_internal: { label: "Attente interne", variant: "warning" },
  resolved: { label: "Résolu", variant: "success" },
  closed: { label: "Fermé", variant: "neutral" },
};

const PRIORITY_LABELS: Record<string, { label: string; variant: StatusVariant }> = {
  low: { label: "Basse", variant: "neutral" },
  medium: { label: "Moyenne", variant: "info" },
  high: { label: "Haute", variant: "warning" },
  urgent: { label: "Urgente", variant: "destructive" },
};

const STATUS_OPTIONS = Object.keys(STATUS_LABELS);
const PRIORITY_OPTIONS = Object.keys(PRIORITY_LABELS);

export function TicketConversation({
  ticket,
}: {
  ticket: AdminTicketDetail;
}) {
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [pending, startTransition] = useTransition();

  const status = STATUS_LABELS[ticket.status] ?? STATUS_LABELS.open;
  const priority = PRIORITY_LABELS[ticket.priority] ?? PRIORITY_LABELS.medium;
  const isClosed = ticket.status === "closed";

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    startTransition(async () => {
      const res = await replyToTicketAsAdmin(ticket.id, body, { isInternal });
      if (res.ok) {
        setBody("");
        setIsInternal(false);
        toast.success(isInternal ? "Note interne ajoutée" : "Réponse envoyée");
      } else {
        toast.error(res.error ?? "Erreur");
      }
    });
  };

  const onStatusChange = (next: string) => {
    startTransition(async () => {
      const res = await updateTicketStatus(ticket.id, next);
      if (res.ok) toast.success("Statut mis à jour");
      else toast.error(res.error ?? "Erreur");
    });
  };

  const onPriorityChange = (next: string) => {
    startTransition(async () => {
      const res = await updateTicketPriority(ticket.id, next);
      if (res.ok) toast.success("Priorité mise à jour");
      else toast.error(res.error ?? "Erreur");
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux tickets
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {ticket.subject}
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Ouvert le{" "}
                  {ticket.createdAt ? formatDate(ticket.createdAt) : "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge variant={status.variant}>{status.label}</StatusBadge>
                <StatusBadge variant={priority.variant}>{priority.label}</StatusBadge>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {ticket.messages.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                Aucun message pour l&apos;instant.
              </div>
            ) : (
              ticket.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "p-5",
                    m.isInternal && "bg-amber-50/40",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                        m.authorIsAdmin
                          ? "bg-terracotta/10 text-terracotta"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {m.authorIsAdmin ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">
                          {m.authorName ?? (m.authorIsAdmin ? "Équipe ISHYA" : "Client")}
                        </span>
                        {m.isInternal && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                            <Lock className="w-3 h-3" />
                            Note interne
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          · {formatDate(m.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                        {m.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {!isClosed && (
            <form
              onSubmit={onSend}
              className="bg-white border border-gray-200 rounded-xl p-5 space-y-3"
            >
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  isInternal
                    ? "Note interne (visible uniquement par l'équipe)…"
                    : "Réponse au client…"
                }
                rows={5}
                maxLength={5000}
                className={cn(
                  "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 resize-y",
                  isInternal
                    ? "border-amber-300 bg-amber-50/40 focus:ring-amber-200"
                    : "border-gray-300 focus:ring-terracotta/20",
                )}
              />
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="accent-amber-500"
                  />
                  Note interne (invisible côté client)
                </label>
                <button
                  type="submit"
                  disabled={pending || !body.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-terracotta text-white text-sm font-medium hover:bg-terracotta-dark disabled:opacity-50"
                >
                  {pending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Envoyer
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {body.length}/5000 caractères
              </p>
            </form>
          )}

          {isClosed && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-500">
              Ce ticket est fermé. Rouvrez-le depuis le panneau latéral pour
              répondre.
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Client
            </h2>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {ticket.customerName ?? "Client anonyme"}
              </p>
              {ticket.customerEmail && (
                <a
                  href={`mailto:${ticket.customerEmail}`}
                  className="text-xs text-terracotta hover:underline"
                >
                  {ticket.customerEmail}
                </a>
              )}
            </div>
            {ticket.orderNumber && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Commande liée</p>
                <Link
                  href={`/admin/commandes/${ticket.orderId}`}
                  className="text-sm text-terracotta hover:underline"
                >
                  #{ticket.orderNumber}
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              État
            </h2>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Statut</label>
              <select
                value={ticket.status}
                onChange={(e) => onStatusChange(e.target.value)}
                disabled={pending}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Priorité
              </label>
              <select
                value={ticket.priority}
                onChange={(e) => onPriorityChange(e.target.value)}
                disabled={pending}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2 text-xs text-gray-500">
            <div>
              <span className="text-gray-400">Canal :</span>{" "}
              {ticket.channel ?? "—"}
            </div>
            <div>
              <span className="text-gray-400">Catégorie :</span>{" "}
              {ticket.category ?? "—"}
            </div>
            <div>
              <span className="text-gray-400">Créé :</span>{" "}
              {ticket.createdAt ? formatDate(ticket.createdAt) : "—"}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
