import Link from "next/link";
import { MessageCircle, Plus } from "lucide-react";
import { getCurrentUserTickets } from "@/lib/queries/account";
import { formatDate } from "@/lib/utils";
import { StatusBadge, type StatusVariant } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Aide & messages — ISHYA",
};

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

export default async function MesTicketsPage() {
  const tickets = await getCurrentUserTickets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">
            Aide & messages
          </h1>
          <p className="text-sm text-steel mt-1">
            Vos échanges avec l&apos;équipe ISHYA.
          </p>
        </div>
        <Link
          href="/compte/tickets/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ember text-bone text-sm font-medium hover:bg-ember-deep transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle demande
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-bone-soft rounded-xl border border-border p-10 text-center">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 text-steel-soft" />
          <p className="text-foreground font-medium">
            Vous n&apos;avez pas encore de message.
          </p>
          <p className="text-sm text-steel mt-1">
            Une question, un souci sur une commande&nbsp;? Notre équipe vous
            répond généralement sous 48&nbsp;h ouvrées.
          </p>
          <Link
            href="/compte/tickets/nouveau"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ember text-bone text-sm font-medium hover:bg-ember-deep"
          >
            <Plus className="w-4 h-4" />
            Ouvrir une demande
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((t) => {
            const status =
              STATUS_LABELS[t.status] ?? STATUS_LABELS.open;
            return (
              <li key={t.id}>
                <Link
                  href={`/compte/tickets/${t.id}`}
                  className="block bg-bone-soft rounded-xl border border-border p-4 hover:border-ember/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <StatusBadge variant={status.variant} size="sm">
                          {status.label}
                        </StatusBadge>
                        {t.category && (
                          <span className="text-xs text-steel">
                            {CATEGORY_LABELS[t.category] ?? t.category}
                          </span>
                        )}
                        {t.orderNumber && (
                          <span className="text-xs text-steel">
                            · Commande {t.orderNumber}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-foreground truncate">
                        {t.subject}
                      </p>
                      <p className="text-xs text-steel mt-1">
                        Mis à jour le {formatDate(t.lastMessageAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
