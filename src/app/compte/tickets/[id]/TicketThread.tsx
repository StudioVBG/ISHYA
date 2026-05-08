"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Send, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { StatusBadge, type StatusVariant } from "@/components/ui/StatusBadge";
import type { AccountTicketDetail } from "@/lib/queries/account";
import { replyToUserTicket } from "../actions";

const STATUS_LABELS: Record<string, { label: string; variant: StatusVariant }> = {
  open: { label: "Ouvert", variant: "info" },
  in_progress: { label: "En cours", variant: "warning" },
  waiting_customer: { label: "Réponse attendue", variant: "accent" },
  waiting_internal: { label: "Pris en charge", variant: "info" },
  resolved: { label: "Résolu", variant: "success" },
  closed: { label: "Fermé", variant: "neutral" },
};

const CATEGORY_LABELS: Record<string, string> = {
  order_issue: "Problème de commande",
  product_question: "Question produit",
  shipping: "Livraison",
  return_exchange: "Retour ou échange",
  payment: "Paiement",
  account: "Mon compte",
  complaint: "Réclamation",
  other: "Autre",
};

export function TicketThread({ ticket }: { ticket: AccountTicketDetail }) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  const status = STATUS_LABELS[ticket.status] ?? STATUS_LABELS.open;
  const isClosed = ticket.status === "closed";

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    startTransition(async () => {
      const res = await replyToUserTicket(ticket.id, body);
      if (res.ok) {
        setBody("");
        toast.success("Message envoyé");
      } else {
        toast.error(res.error ?? "Erreur");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-bone-soft border border-border rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-xl text-foreground">
              {ticket.subject}
            </h1>
            <p className="text-xs text-steel mt-1">
              {ticket.category && (
                <>
                  {CATEGORY_LABELS[ticket.category] ?? ticket.category} ·{" "}
                </>
              )}
              Ouvert le {formatDate(ticket.createdAt)}
              {ticket.orderNumber && (
                <> · Commande {ticket.orderNumber}</>
              )}
            </p>
          </div>
          <StatusBadge variant={status.variant}>{status.label}</StatusBadge>
        </div>
      </div>

      <div className="bg-bone-soft border border-border rounded-xl divide-y divide-border/60">
        {ticket.messages.map((m) => (
          <div key={m.id} className="p-5">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                  m.isFromAdmin
                    ? "bg-ember/10 text-ember"
                    : "bg-bone-soft text-foreground/70",
                )}
              >
                {m.isFromAdmin ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    {m.authorName ?? (m.isFromAdmin ? "ISHYA" : "Vous")}
                  </span>
                  <span className="text-xs text-steel">
                    · {formatDate(m.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 mt-2 whitespace-pre-wrap">
                  {m.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isClosed ? (
        <div className="bg-bone-soft/40 border border-border rounded-xl p-5 text-center">
          <p className="text-sm text-foreground">
            Ce ticket est fermé.{" "}
            <Link
              href="/compte/tickets/nouveau"
              className="text-ember hover:underline"
            >
              Ouvrir une nouvelle demande
            </Link>
          </p>
        </div>
      ) : (
        <form
          onSubmit={onSend}
          className="bg-bone-soft border border-border rounded-xl p-5 space-y-3"
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Votre réponse…"
            rows={5}
            maxLength={5000}
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 resize-y"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-steel">
              {body.length}/5000 caractères
            </p>
            <button
              type="submit"
              disabled={pending || !body.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-ember text-bone text-sm font-medium hover:bg-ember-deep disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Envoyer
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
