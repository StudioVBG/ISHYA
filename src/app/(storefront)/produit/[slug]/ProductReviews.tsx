"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, CheckCircle2, Loader2, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations";
import type {
  ProductReviewSummary,
  PublicReview,
} from "@/lib/queries/storefront";
import { submitReview } from "./actions";

interface Props {
  productId: string;
  productSlug: string;
  reviews: PublicReview[];
  summary: ProductReviewSummary;
  canReview: boolean;
}

export function ProductReviews({
  productId,
  productSlug,
  reviews,
  summary,
  canReview,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }
    startTransition(async () => {
      const res = await submitReview({
        productId,
        productSlug,
        rating,
        title: title.trim() || null,
        body: body.trim() || null,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success(
        "Merci ! Votre avis sera publié après validation par notre équipe.",
      );
      setShowForm(false);
      setRating(0);
      setTitle("");
      setBody("");
    });
  };

  return (
    <section className="py-16 px-4 border-t border-border">
      <div className="container max-w-4xl">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-terracotta uppercase tracking-widest text-xs mb-2">
              Avis vérifiés
            </p>
            <h2 className="font-display text-3xl">Ce que nos clientes en disent</h2>
            {summary.count > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < Math.round(summary.average)
                          ? "fill-gold text-gold"
                          : "fill-border text-border",
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {summary.average.toFixed(1)}
                </span>
                <span className="text-sm text-muted">
                  · {summary.count} avis
                </span>
              </div>
            )}
          </div>

          {canReview && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-sm gap-2"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Donner mon avis
            </button>
          )}
        </motion.div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-border p-6 mb-10 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                Votre note *
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(n)}
                    className="p-1 rounded transition-colors"
                  >
                    <Star
                      className={cn(
                        "w-6 h-6 transition-colors",
                        n <= (hoverRating || rating)
                          ? "fill-gold text-gold"
                          : "fill-border text-border",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Titre</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
                placeholder="Une merveille !"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Votre avis
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta resize-none"
                placeholder="Partagez votre expérience..."
              />
              <p className="text-xs text-muted mt-1">
                {body.length}/2000 caractères
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={isPending}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isPending || rating === 0}
                className="btn-primary text-sm gap-2 disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Publier l&apos;avis
              </button>
            </div>
          </motion.form>
        )}

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-10 text-center">
            <Star className="w-10 h-10 mx-auto text-border mb-3" />
            <p className="text-sm text-muted">
              Aucun avis pour ce produit pour le moment.
            </p>
            {!canReview && (
              <p className="text-xs text-muted mt-2">
                Achetez le produit pour pouvoir le noter.{" "}
                <Link
                  href="/connexion"
                  className="text-terracotta hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-border/50 p-6"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < review.rating
                                ? "fill-gold text-gold"
                                : "fill-border text-border",
                            )}
                          />
                        ))}
                      </div>
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Achat vérifié
                        </span>
                      )}
                    </div>
                    {review.title && (
                      <h3 className="font-medium">{review.title}</h3>
                    )}
                  </div>
                  <span className="text-xs text-muted shrink-0">
                    {review.createdAt && formatDate(review.createdAt)}
                  </span>
                </div>
                {review.body && (
                  <p className="text-sm text-muted leading-relaxed">
                    {review.body}
                  </p>
                )}
                <p className="text-xs text-terracotta font-medium mt-3">
                  {review.authorName}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
