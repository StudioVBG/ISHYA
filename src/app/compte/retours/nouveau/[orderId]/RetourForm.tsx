"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Loader2,
  Send,
  Package,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { AccountReturnableOrder } from "@/lib/queries/account";
import { requestReturn } from "../../actions";

const REASONS: Array<{ value: string; label: string }> = [
  { value: "wrong_size", label: "Mauvaise taille" },
  { value: "defective", label: "Produit défectueux" },
  { value: "not_as_described", label: "Différent de la description" },
  { value: "wrong_item", label: "Mauvais article reçu" },
  { value: "arrived_late", label: "Arrivé en retard" },
  { value: "changed_mind", label: "Changement d'avis" },
  { value: "other", label: "Autre" },
];

export function RetourForm({ order }: { order: AccountReturnableOrder }) {
  const router = useRouter();
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  const toggleItem = (id: string, maxQty: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = maxQty;
      return next;
    });
  };

  const updateQty = (id: string, qty: number, max: number) => {
    if (qty < 1) qty = 1;
    if (qty > max) qty = max;
    setSelected((prev) => ({ ...prev, [id]: qty }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Sélectionnez un motif");
      return;
    }
    const items = Object.entries(selected).map(([orderItemId, quantity]) => ({
      orderItemId,
      quantity,
    }));
    if (items.length === 0) {
      toast.error("Sélectionnez au moins un article");
      return;
    }

    startTransition(async () => {
      const res = await requestReturn({
        orderId: order.id,
        reason,
        description,
        items,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Demande de retour envoyée. Notre équipe vous répondra sous 48 h.");
      router.push("/compte/retours");
      router.refresh();
    });
  };

  return (
    <div>
      <Link
        href="/compte/retours"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-terracotta transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour à mes demandes
      </Link>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-2">
          Demande de retour
        </h1>
        <p className="text-sm text-muted">
          Commande{" "}
          <span className="font-mono">{order.orderNumber}</span>
          {order.createdAt && ` du ${formatDate(order.createdAt)}`}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Articles à retourner */}
          <motion.section
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6"
          >
            <h2 className="font-display text-lg font-semibold mb-4">
              Quels articles souhaitez-vous retourner ?
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => {
                const isSelected = item.id in selected;
                return (
                  <label
                    key={item.id}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors",
                      isSelected
                        ? "border-terracotta bg-terracotta/5"
                        : "border-border hover:border-muted-light",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItem(item.id, item.quantity)}
                      className="rounded accent-terracotta"
                    />
                    <div className="w-14 h-14 rounded-lg bg-beige-nude-light overflow-hidden shrink-0 relative">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.productName}
                      </p>
                      {item.variantName && (
                        <p className="text-xs text-muted">{item.variantName}</p>
                      )}
                      <p className="text-xs text-muted mt-0.5">
                        Quantité commandée : {item.quantity} ·{" "}
                        {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    {isSelected && item.quantity > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">Qté</span>
                        <input
                          type="number"
                          min={1}
                          max={item.quantity}
                          value={selected[item.id]}
                          onChange={(e) =>
                            updateQty(
                              item.id,
                              parseInt(e.target.value, 10) || 1,
                              item.quantity,
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-14 px-2 py-1 border border-border rounded text-sm text-center"
                        />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </motion.section>

          {/* Motif */}
          <motion.section
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6"
          >
            <h2 className="font-display text-lg font-semibold mb-4">
              Motif du retour
            </h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    reason === r.value
                      ? "border-terracotta bg-terracotta/5"
                      : "border-border hover:border-muted-light",
                  )}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="accent-terracotta"
                  />
                  <span className="text-sm">{r.label}</span>
                </label>
              ))}
            </div>
          </motion.section>

          {/* Description */}
          <motion.section
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6"
          >
            <h2 className="font-display text-lg font-semibold mb-2">
              Détails complémentaires (facultatif)
            </h2>
            <p className="text-xs text-muted mb-3">
              Précisez le défaut, la nuance attendue, le problème de taille…
              Cela nous aidera à traiter votre demande plus rapidement.
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta resize-none"
            />
            <p className="text-xs text-muted mt-1">
              {description.length}/1000 caractères
            </p>
          </motion.section>

          <motion.div
            variants={staggerItem}
            className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3"
          >
            <RotateCcw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900">
              Une fois la demande validée, vous recevrez par email les
              instructions et l&apos;étiquette de retour. Le délai légal est de
              14 jours après la livraison (sauf exceptions : boucles
              d&apos;oreilles percées).
            </p>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="flex justify-end gap-3"
          >
            <Link href="/compte/retours" className="btn-secondary text-sm">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary text-sm gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Envoyer la demande
            </button>
          </motion.div>
        </motion.div>
      </form>
    </div>
  );
}
