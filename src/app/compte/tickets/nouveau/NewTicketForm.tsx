"use client";

import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { createUserTicket } from "../actions";

const CATEGORIES = [
  { value: "order_issue", label: "Problème de commande" },
  { value: "product_question", label: "Question produit" },
  { value: "shipping", label: "Livraison" },
  { value: "return_exchange", label: "Retour ou échange" },
  { value: "payment", label: "Paiement" },
  { value: "account", label: "Mon compte" },
  { value: "complaint", label: "Réclamation" },
  { value: "other", label: "Autre" },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]["value"];

interface NewTicketFormProps {
  orders: Array<{ id: string; orderNumber: string }>;
}

export function NewTicketForm({ orders }: NewTicketFormProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CategoryValue>("other");
  const [orderId, setOrderId] = useState<string>("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createUserTicket({
        subject,
        body,
        category,
        orderId: orderId || null,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
      }
      // Si ok, le server action redirige vers /compte/tickets/[id]
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-border rounded-xl p-6 space-y-5"
    >
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Catégorie <span className="text-destructive">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryValue)}
          className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {orders.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Commande concernée
          </label>
          <select
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          >
            <option value="">— Aucune commande —</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                Commande {o.orderNumber}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Sujet <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          maxLength={200}
          placeholder="En une phrase, votre demande"
          className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Votre message <span className="text-destructive">*</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={7}
          maxLength={5000}
          placeholder="Décrivez votre demande aussi précisément que possible : numéro de commande, photos si pertinent, contexte…"
          className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 resize-y"
        />
        <p className="text-xs text-muted mt-1">
          {body.length}/5000 caractères
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={pending || !subject.trim() || !body.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-terracotta text-white text-sm font-medium hover:bg-terracotta-dark disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Envoyer ma demande
        </button>
      </div>
    </form>
  );
}
