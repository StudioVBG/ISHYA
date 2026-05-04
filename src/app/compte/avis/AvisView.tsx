"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Star,
  CheckCircle2,
  Trash2,
  Loader2,
  Package,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { AccountReview } from "@/lib/queries/account";
import { deleteOwnReview } from "@/app/(storefront)/produit/[slug]/actions";

export function MesAvisView({ reviews }: { reviews: AccountReview[] }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (review: AccountReview) => {
    if (!window.confirm("Supprimer définitivement cet avis ?")) return;
    startTransition(async () => {
      const res = await deleteOwnReview(review.id, review.productSlug);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Avis supprimé");
    });
  };

  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between gap-4 mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">
          Mes avis
        </h1>
        <span className="text-sm text-muted">
          {reviews.length} avis publié{reviews.length > 1 ? "s" : ""}
        </span>
      </motion.div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-warning-soft flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-warning" />
          </div>
          <h2 className="font-display text-lg mb-2">
            Vous n&apos;avez pas encore laissé d&apos;avis
          </h2>
          <p className="text-sm text-muted mb-6">
            Partagez votre expérience après une commande pour aider d&apos;autres
            clientes à choisir.
          </p>
          <Link href="/compte/commandes" className="btn-primary inline-flex">
            Voir mes commandes
          </Link>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              variants={staggerItem}
              className={cn(
                "bg-white rounded-xl border p-5",
                review.isApproved ? "border-border" : "border-warning/30",
              )}
            >
              <div className="flex gap-4">
                <Link
                  href={`/produit/${review.productSlug}`}
                  className="w-16 h-16 rounded-lg bg-beige-nude-light overflow-hidden shrink-0 relative"
                >
                  {review.productImageUrl ? (
                    <Image
                      src={review.productImageUrl}
                      alt={review.productName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-light" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <Link
                        href={`/produit/${review.productSlug}`}
                        className="font-medium hover:text-terracotta transition-colors text-sm truncate block"
                      >
                        {review.productName}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3.5 h-3.5",
                                i < review.rating
                                  ? "fill-gold text-gold"
                                  : "fill-border text-border",
                              )}
                            />
                          ))}
                        </div>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            Achat vérifié
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium",
                            review.isApproved
                              ? "bg-success-soft text-success"
                              : "bg-warning-soft text-warning",
                          )}
                        >
                          {review.isApproved
                            ? "Publié"
                            : "En attente de modération"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(review)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-muted-light hover:text-destructive hover:bg-destructive-soft transition-colors disabled:opacity-50 shrink-0"
                      aria-label="Supprimer l'avis"
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {review.title && (
                    <p className="font-medium text-sm mt-2">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="text-sm text-muted mt-1 leading-relaxed">
                      {review.body}
                    </p>
                  )}
                  {review.createdAt && (
                    <p className="text-xs text-muted mt-2">
                      Publié le {formatDate(review.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
