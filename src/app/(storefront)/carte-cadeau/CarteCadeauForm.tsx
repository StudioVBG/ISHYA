"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CarteCadeauForm({ amounts }: { amounts: number[] }) {
  const [amount, setAmount] = useState<number>(50);
  const [custom, setCustom] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [loading, setLoading] = useState(false);

  const finalAmount = custom ? Math.max(10, parseInt(custom, 10) || 0) : amount;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientEmail.trim() || finalAmount < 10) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/gift-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          recipientEmail: recipientEmail.trim(),
          recipientName: recipientName.trim() || undefined,
          senderName: senderName.trim() || undefined,
          senderEmail: senderEmail.trim() || undefined,
          message: message.trim() || undefined,
          deliveryDate: deliveryDate || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        checkoutUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.checkoutUrl) {
        toast.error(data.error ?? "Impossible de lancer le paiement.");
        return;
      }
      window.location.assign(data.checkoutUrl);
    } catch (err) {
      console.error("[gift-card] submit failed", err);
      toast.error("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-border rounded-2xl p-6 sm:p-8 space-y-6"
    >
      <div>
        <label className="block text-xs font-medium text-foreground mb-3 uppercase tracking-wider">
          Montant
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
          {amounts.map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => {
                setAmount(a);
                setCustom("");
              }}
              className={cn(
                "py-3 rounded-lg text-sm font-medium border transition-all",
                amount === a && !custom
                  ? "bg-terracotta text-white border-terracotta"
                  : "bg-white text-foreground border-border hover:border-terracotta",
              )}
            >
              {a} €
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">ou</span>
          <input
            type="number"
            min={10}
            max={1000}
            placeholder="Montant libre (min. 10 €)"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-2 uppercase tracking-wider">
            Prénom du destinataire
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-2 uppercase tracking-wider">
            Email du destinataire *
          </label>
          <input
            type="email"
            required
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-2 uppercase tracking-wider">
            Votre nom (apparaîtra sur la carte)
          </label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-2 uppercase tracking-wider">
            Votre email <span className="text-muted normal-case">(reçu Stripe)</span>
          </label>
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-2 uppercase tracking-wider">
          Message (facultatif, 250 caractères max)
        </label>
        <textarea
          rows={3}
          maxLength={250}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Joyeux anniversaire ma belle…"
          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-2 uppercase tracking-wider">
          Date d&apos;envoi
        </label>
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
        />
        <p className="text-xs text-muted mt-1.5">
          Laissez vide pour un envoi immédiat après paiement.
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <p className="text-xs text-muted uppercase tracking-wider">Total</p>
          <p className="font-display text-3xl">{finalAmount} €</p>
        </div>
        <button
          type="submit"
          disabled={loading || finalAmount < 10}
          className="btn-primary inline-flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Continuer vers le paiement
        </button>
      </div>
    </form>
  );
}
