"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Edit2,
  Trash2,
  MessageSquare,
  ChevronDown,
  Send,
  X,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { demoProducts, demoProductMedia } from "@/lib/demo-data";

function getProductImage(productId: string) {
  return (
    demoProductMedia.find((m) => m.product_id === productId && m.is_primary)
      ?.url ?? "/placeholder.jpg"
  );
}

const productsToReview = [
  { productId: "prod-007", orderId: "ISH-2K6F3A-X9R2", date: "2026-03-15" },
  { productId: "prod-008", orderId: "ISH-2K5M1B-T4P7", date: "2026-03-08" },
];

const existingReviews = [
  {
    id: "my-rev-1",
    productId: "prod-001",
    rating: 5,
    title: "Magnifique collier",
    content:
      "Ce collier est absolument sublime. Les fleurs sont parfaitement conservées et le rendu est très lumineux. Je le porte tous les jours !",
    date: "2026-02-20T14:30:00Z",
  },
  {
    id: "my-rev-2",
    productId: "prod-010",
    rating: 4,
    title: "Très jolies boucles",
    content:
      "Les boucles sont légères et élégantes. Seul petit bémol : j'aurais aimé qu'elles soient un peu plus longues.",
    date: "2026-01-28T11:00:00Z",
  },
  {
    id: "my-rev-3",
    productId: "prod-004",
    rating: 5,
    title: "Coup de cœur absolu",
    content:
      "Cette bague est devenue mon bijou fétiche. La pivoine est si délicate, on dirait qu'elle vient d'être cueillie.",
    date: "2026-02-10T16:00:00Z",
  },
  {
    id: "my-rev-4",
    productId: "prod-016",
    rating: 5,
    title: "Ensemble parfait",
    content:
      "Le pack duo est une excellente idée. Les deux pièces s'accordent parfaitement.",
    date: "2026-03-01T10:00:00Z",
  },
  {
    id: "my-rev-5",
    productId: "prod-012",
    rating: 5,
    title: "Créoles uniques",
    content:
      "Des créoles uniques que je n'ai vues nulle part ailleurs. Un vrai bijou d'artisan.",
    date: "2026-03-12T17:30:00Z",
  },
];

function StarRating({
  rating,
  interactive = false,
  onChange,
  size = "w-5 h-5",
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
  size?: string;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(star)}
          className={cn(
            "transition-colors",
            interactive && "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              size,
              (hovered || rating) >= star
                ? "text-amber-400 fill-amber-400"
                : "text-gray-200"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function AvisPage() {
  const [reviewModal, setReviewModal] = useState<{
    productId: string;
    editing?: string;
  } | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [reviews, setReviews] = useState(existingReviews);

  const openReviewModal = (productId: string, editingId?: string) => {
    if (editingId) {
      const review = reviews.find((r) => r.id === editingId);
      if (review) {
        setNewRating(review.rating);
        setNewTitle(review.title);
        setNewContent(review.content);
      }
    } else {
      setNewRating(5);
      setNewTitle("");
      setNewContent("");
    }
    setReviewModal({ productId, editing: editingId });
  };

  const submitReview = () => {
    if (!reviewModal) return;
    if (reviewModal.editing) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewModal.editing
            ? { ...r, rating: newRating, title: newTitle, content: newContent }
            : r
        )
      );
    } else {
      setReviews((prev) => [
        {
          id: `my-rev-${Date.now()}`,
          productId: reviewModal.productId,
          rating: newRating,
          title: newTitle,
          content: newContent,
          date: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setReviewModal(null);
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      <motion.h1
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="font-display text-2xl sm:text-3xl font-semibold mb-8"
      >
        Mes avis
      </motion.h1>

      {/* Products to review */}
      {productsToReview.length > 0 && (
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-terracotta" />
            Avis à laisser ({productsToReview.length})
          </h2>
          <div className="space-y-3">
            {productsToReview.map(({ productId, orderId, date }) => {
              const product = demoProducts.find((p) => p.id === productId);
              if (!product) return null;
              return (
                <div
                  key={productId}
                  className="flex items-center gap-4 bg-gradient-to-r from-beige-nude-light/50 to-white rounded-xl border border-border p-4"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-beige-nude-light shrink-0">
                    <Image
                      src={getProductImage(productId)}
                      alt={product.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted">
                      Commande du {formatDate(date)}
                    </p>
                  </div>
                  <button
                    onClick={() => openReviewModal(productId)}
                    className="btn-primary text-xs py-2 px-4 shrink-0"
                  >
                    Laisser un avis
                  </button>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Existing reviews */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <h2 className="font-display text-lg font-semibold mb-4">
          Mes avis publiés ({reviews.length})
        </h2>
        <div className="space-y-4">
          {reviews.map((review) => {
            const product = demoProducts.find(
              (p) => p.id === review.productId
            );
            if (!product) return null;
            return (
              <motion.div
                key={review.id}
                variants={staggerItem}
                className="bg-white rounded-xl border border-border p-5"
              >
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-beige-nude-light shrink-0">
                    <Image
                      src={getProductImage(review.productId)}
                      alt={product.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={review.rating} size="w-4 h-4" />
                          <span className="text-xs text-muted">
                            {formatDate(review.date)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() =>
                            openReviewModal(review.productId, review.id)
                          }
                          className="p-1.5 text-muted hover:text-terracotta transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="p-1.5 text-muted hover:text-destructive transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-sm font-medium mt-2">{review.title}</h4>
                    <p className="text-sm text-muted mt-1">{review.content}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Review modal */}
      <AnimatePresence>
        {reviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setReviewModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold">
                  {reviewModal.editing ? "Modifier mon avis" : "Laisser un avis"}
                </h3>
                <button
                  onClick={() => setReviewModal(null)}
                  className="text-muted hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product info */}
              {(() => {
                const product = demoProducts.find(
                  (p) => p.id === reviewModal.productId
                );
                if (!product) return null;
                return (
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-beige-nude-light">
                      <Image
                        src={getProductImage(product.id)}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm font-medium">{product.name}</p>
                  </div>
                );
              })()}

              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Votre note
                </label>
                <StarRating
                  rating={newRating}
                  interactive
                  onChange={setNewRating}
                  size="w-7 h-7"
                />
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">
                  Titre
                </label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Résumez votre avis..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all"
                />
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1.5">
                  Votre avis
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Partagez votre expérience..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setReviewModal(null)}
                  className="btn-secondary text-sm flex-1"
                >
                  Annuler
                </button>
                <button
                  onClick={submitReview}
                  disabled={!newTitle || !newContent}
                  className="btn-primary text-sm flex-1 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {reviewModal.editing ? "Modifier" : "Publier"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
