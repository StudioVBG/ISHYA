"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Trash2,
  Loader2,
  Star,
  CheckCircle2,
  Search,
  MessageSquare,
  Reply,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { AdminReviewRow } from "@/lib/queries/admin";
import {
  approveReview,
  deleteReview,
  deleteReviewResponse,
  rejectReview,
  upsertReviewResponse,
} from "./actions";

type FilterStatus = "all" | "pending" | "approved";

export function AvisView({ reviews }: { reviews: AdminReviewRow[] }) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [deletingReview, setDeletingReview] = useState<AdminReviewRow | null>(
    null,
  );
  const [deletingReplyFor, setDeletingReplyFor] =
    useState<AdminReviewRow | null>(null);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (statusFilter === "pending" && r.isApproved) return false;
      if (statusFilter === "approved" && !r.isApproved) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.productName.toLowerCase().includes(q) &&
          !(r.title ?? "").toLowerCase().includes(q) &&
          !(r.body ?? "").toLowerCase().includes(q) &&
          !(r.authorName ?? "").toLowerCase().includes(q) &&
          !(r.authorEmail ?? "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [reviews, statusFilter, search]);

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  const handleApprove = (r: AdminReviewRow) => {
    setPendingId(r.id);
    startTransition(async () => {
      const res = await approveReview(r.id, r.productSlug);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Avis approuvé");
    });
  };

  const handleReject = (r: AdminReviewRow) => {
    setPendingId(r.id);
    startTransition(async () => {
      const res = await rejectReview(r.id, r.productSlug);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Avis désapprouvé");
    });
  };

  const handleConfirmDeleteReview = () => {
    if (!deletingReview) return;
    const r = deletingReview;
    setPendingId(r.id);
    startTransition(async () => {
      const res = await deleteReview(r.id, r.productSlug);
      setPendingId(null);
      setDeletingReview(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Avis supprimé");
    });
  };

  const openReply = (r: AdminReviewRow) => {
    setReplyOpenId(r.id);
    setReplyBody(r.response?.body ?? "");
  };

  const closeReply = () => {
    setReplyOpenId(null);
    setReplyBody("");
  };

  const handleReplySave = (r: AdminReviewRow) => {
    setPendingId(r.id);
    startTransition(async () => {
      const res = await upsertReviewResponse(r.id, replyBody, r.productSlug);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success(r.response ? "Réponse mise à jour" : "Réponse publiée");
      closeReply();
    });
  };

  const handleConfirmDeleteReply = () => {
    if (!deletingReplyFor || !deletingReplyFor.response) return;
    const r = deletingReplyFor;
    const responseId = r.response!.id;
    setPendingId(r.id);
    startTransition(async () => {
      const res = await deleteReviewResponse(responseId, r.productSlug);
      setPendingId(null);
      setDeletingReplyFor(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Réponse supprimée");
      closeReply();
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-bold text-foreground">Avis clients</h2>
          <p className="text-sm text-muted">
            {reviews.length} avis ·
            <span className="text-warning ml-1">
              {pendingCount} en attente de modération
            </span>
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
            <input
              type="text"
              placeholder="Rechercher (produit, auteur, contenu)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          <div className="flex gap-2">
            {(
              [
                ["all", "Tous"],
                ["pending", "En attente"],
                ["approved", "Approuvés"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  statusFilter === key
                    ? "bg-foreground text-white"
                    : "bg-white border border-border text-muted hover:bg-muted-soft",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-12 text-center text-muted-light"
        >
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-light" />
          {reviews.length === 0
            ? "Aucun avis n'a encore été déposé."
            : "Aucun avis ne correspond à votre recherche."}
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={cn(
                "bg-white rounded-xl border p-5 transition-colors",
                r.isApproved
                  ? "border-border"
                  : "border-warning/30 bg-warning-soft/30",
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={cn(
                            "w-4 h-4",
                            n <= r.rating
                              ? "fill-gold text-gold"
                              : "text-muted-light",
                          )}
                        />
                      ))}
                    </div>
                    {r.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Achat vérifié
                      </span>
                    )}
                    <span
                      className={cn(
                        "ml-auto sm:ml-2 px-2 py-0.5 rounded-full text-xs font-medium",
                        r.isApproved
                          ? "bg-success-soft text-success"
                          : "bg-warning-soft text-warning",
                      )}
                    >
                      {r.isApproved ? "Approuvé" : "En attente"}
                    </span>
                  </div>
                  {r.title && (
                    <p className="font-semibold text-foreground">{r.title}</p>
                  )}
                  {r.body && (
                    <p className="text-sm text-muted mt-1">{r.body}</p>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-light mt-2">
                    <span>
                      Sur{" "}
                      <Link
                        href={`/produit/${r.productSlug}`}
                        target="_blank"
                        className="text-terracotta hover:underline"
                      >
                        {r.productName}
                      </Link>
                    </span>
                    {r.authorName && <span>Par {r.authorName}</span>}
                    {r.authorEmail && (
                      <span className="text-muted">{r.authorEmail}</span>
                    )}
                    {r.createdAt && (
                      <span>· {formatDate(r.createdAt)}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {r.isApproved ? (
                    <button
                      onClick={() => handleReject(r)}
                      disabled={isPending && pendingId === r.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warning-soft text-warning rounded-lg text-sm font-medium hover:bg-warning-soft transition-colors disabled:opacity-50"
                    >
                      {isPending && pendingId === r.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      Désapprouver
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(r)}
                      disabled={isPending && pendingId === r.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-soft text-success rounded-lg text-sm font-medium hover:bg-success-soft transition-colors disabled:opacity-50"
                    >
                      {isPending && pendingId === r.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Approuver
                    </button>
                  )}
                  <button
                    onClick={() => setDeletingReview(r)}
                    disabled={isPending && pendingId === r.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive-soft text-destructive rounded-lg text-sm font-medium hover:bg-destructive/15 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {r.response && replyOpenId !== r.id ? (
                <div className="mt-3 ml-2 pl-3 border-l-2 border-terracotta/40 bg-muted-soft/50 rounded-r-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-terracotta uppercase tracking-wide">
                      Réponse ISHYA
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openReply(r)}
                        className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground"
                      >
                        <Pencil className="w-3 h-3" />
                        Modifier
                      </button>
                      <button
                        onClick={() => setDeletingReplyFor(r)}
                        disabled={isPending && pendingId === r.id}
                        className="inline-flex items-center gap-1 text-xs text-destructive hover:underline disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {r.response.body}
                  </p>
                  {r.response.updatedAt ? (
                    <p className="text-xs text-muted-light mt-1">
                      {formatDate(r.response.updatedAt)}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {replyOpenId === r.id ? (
                <div className="mt-3 ml-2 pl-3 border-l-2 border-terracotta/40">
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={3}
                    placeholder="Votre réponse publique…"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta resize-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={closeReply}
                      disabled={isPending && pendingId === r.id}
                      className="px-3 py-1.5 text-sm text-muted hover:text-foreground disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleReplySave(r)}
                      disabled={
                        (isPending && pendingId === r.id) || !replyBody.trim()
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-50"
                    >
                      {isPending && pendingId === r.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Reply className="w-3.5 h-3.5" />
                      )}
                      {r.response ? "Mettre à jour" : "Publier la réponse"}
                    </button>
                  </div>
                </div>
              ) : !r.response ? (
                <button
                  onClick={() => openReply(r)}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-terracotta hover:underline"
                >
                  <Reply className="w-3.5 h-3.5" />
                  Répondre
                </button>
              ) : null}
            </div>
          ))}
        </motion.div>
      )}

      <ConfirmDialog
        open={deletingReview !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingReview(null);
        }}
        title="Supprimer définitivement cet avis ?"
        description={
          deletingReview
            ? `L'avis « ${deletingReview.title ?? "(sans titre)"} » sur ${deletingReview.productName} sera supprimé. Cette action est définitive.`
            : undefined
        }
        confirmLabel="Supprimer"
        tone="destructive"
        pending={isPending && pendingId === deletingReview?.id}
        onConfirm={handleConfirmDeleteReview}
      />

      <ConfirmDialog
        open={deletingReplyFor !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingReplyFor(null);
        }}
        title="Supprimer cette réponse ?"
        description="La réponse de la boutique à cet avis sera retirée publiquement."
        confirmLabel="Supprimer"
        tone="destructive"
        pending={isPending && pendingId === deletingReplyFor?.id}
        onConfirm={handleConfirmDeleteReply}
      />
    </motion.div>
  );
}
