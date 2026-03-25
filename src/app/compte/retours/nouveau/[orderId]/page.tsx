"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  Upload,
  RotateCcw,
  AlertCircle,
  Check,
  Loader2,
  X,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const returnSchema = z.object({
  reason: z.string().min(1, "Veuillez sélectionner un motif"),
  details: z.string().optional(),
});

type ReturnFormData = z.infer<typeof returnSchema>;

const reasons = [
  "Mauvaise taille",
  "Article défectueux",
  "Ne correspond pas à la description",
  "Changement d'avis",
  "Article reçu endommagé",
  "Autre",
];

const orderItems = [
  {
    id: "item-1",
    productId: "prod-001",
    name: "Collier Fleur d'Oranger",
    variant: "45cm - Or",
    qty: 1,
    price: 45,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=120&h=120&fit=crop",
  },
  {
    id: "item-2",
    productId: "prod-010",
    name: "Boucles Goutte de Rosée",
    variant: "Unique - Argent",
    qty: 1,
    price: 36,
    image:
      "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=120&h=120&fit=crop",
  },
];

export default function NouveauRetourPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
  });

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const onSubmit = async (_data: ReturnFormData) => {
    if (selectedItems.length === 0) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all";

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-success" />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-2">
          Demande envoyée !
        </h2>
        <p className="text-muted mb-6 max-w-md mx-auto">
          Votre demande de retour a été soumise avec succès. Vous recevrez un
          e-mail de confirmation avec les instructions de retour sous 24 à 48h.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/compte/retours" className="btn-secondary text-sm">
            Voir mes retours
          </Link>
          <Link href="/compte/commandes" className="btn-primary text-sm">
            Mes commandes
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <Link
        href={`/compte/commandes/${orderId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-terracotta transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour à la commande
      </Link>

      <motion.h1
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="font-display text-2xl font-semibold mb-2"
      >
        Demander un retour
      </motion.h1>
      <motion.p
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.05 }}
        className="text-sm text-muted mb-8"
      >
        Commande {orderId}
      </motion.p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Select items */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6"
          >
            <h2 className="font-display text-lg font-semibold mb-4">
              Sélectionnez les articles à retourner
            </h2>
            {selectedItems.length === 0 && (
              <p className="text-xs text-destructive mb-3">
                Veuillez sélectionner au moins un article
              </p>
            )}
            <div className="space-y-3">
              {orderItems.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-3 rounded-lg border transition-all text-left",
                      isSelected
                        ? "border-terracotta bg-terracotta/5"
                        : "border-border hover:border-terracotta/30"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "border-terracotta bg-terracotta"
                          : "border-border"
                      )}
                    >
                      {isSelected && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-beige-nude-light shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted">{item.variant}</p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">
                      {formatPrice(item.price)}
                    </p>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Reason */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6"
          >
            <h2 className="font-display text-lg font-semibold mb-4">
              Motif du retour
            </h2>
            <div>
              <select
                {...register("reason")}
                className={cn(
                  inputClass,
                  "appearance-none",
                  errors.reason && "border-destructive"
                )}
                defaultValue=""
              >
                <option value="" disabled>
                  Sélectionnez un motif...
                </option>
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              {errors.reason && (
                <p className="text-xs text-destructive mt-1">
                  {errors.reason.message}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1.5">
                Détails supplémentaires (optionnel)
              </label>
              <textarea
                {...register("details")}
                rows={3}
                placeholder="Décrivez le problème rencontré..."
                className={cn(inputClass, "resize-none")}
              />
            </div>

            {/* Photo upload */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1.5">
                Photos (optionnel)
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-terracotta/30 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-light mx-auto mb-2" />
                <p className="text-sm text-muted">
                  Glissez vos photos ici ou{" "}
                  <span className="text-terracotta font-medium">
                    parcourir
                  </span>
                </p>
                <p className="text-xs text-muted-light mt-1">
                  JPG, PNG. 5 Mo max par fichier.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Return policy */}
          <motion.div
            variants={staggerItem}
            className="flex items-start gap-3 p-4 bg-beige-nude-light/50 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Rappel politique de retour</p>
              <ul className="text-xs text-muted mt-1 space-y-0.5 list-disc list-inside">
                <li>Retour sous 30 jours après réception</li>
                <li>Articles non portés, dans leur emballage d&apos;origine</li>
                <li>Remboursement sous 5-10 jours après réception</li>
                <li>Les frais de retour sont à votre charge (sauf article défectueux)</li>
              </ul>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div variants={staggerItem}>
            <button
              type="submit"
              disabled={submitting || selectedItems.length === 0}
              className="btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              {submitting ? "Envoi en cours..." : "Soumettre la demande"}
            </button>
          </motion.div>
        </motion.div>
      </form>
    </div>
  );
}
