"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type {
  AdminCategoryOption,
  AdminProductOption,
  AdminPromotionRow,
} from "@/lib/queries/admin";
import {
  createPromotion,
  deletePromotion,
  updatePromotion,
  type PromotionInput,
} from "./actions";

const inputClass =
  "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember";
const labelClass = "block text-xs font-medium text-foreground mb-1";

interface FormState {
  code: string;
  description: string;
  discountType: PromotionInput["discountType"];
  discountValue: string;
  minimumOrderAmount: string;
  maximumDiscount: string;
  perUserLimit: string;
  usageLimit: string;
  applicableProductIds: string[];
  applicableCategoryIds: string[];
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minimumOrderAmount: "",
  maximumDiscount: "",
  perUserLimit: "",
  usageLimit: "",
  applicableProductIds: [],
  applicableCategoryIds: [],
  startsAt: "",
  endsAt: "",
  isActive: true,
};

const TYPE_LABELS: Record<PromotionInput["discountType"], string> = {
  percentage: "% (pourcentage)",
  fixed_amount: "€ (montant fixe)",
  free_shipping: "Livraison offerte",
  buy_x_get_y: "Achetez X, obtenez Y",
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDiscount(p: AdminPromotionRow): string {
  switch (p.discountType) {
    case "percentage":
      return `-${p.discountValue}%`;
    case "fixed_amount":
      return `-${formatPrice(p.discountValue)}`;
    case "free_shipping":
      return "Livraison offerte";
    case "buy_x_get_y":
      return "Offre X+Y";
  }
}

export function PromotionsView({
  promotions,
  products,
  categories,
}: {
  promotions: AdminPromotionRow[];
  products: AdminProductOption[];
  categories: AdminCategoryOption[];
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const deletingPromo = promotions.find((p) => p.id === deletingId);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: AdminPromotionRow) => {
    setEditingId(p.id);
    setForm({
      code: p.code,
      description: p.description ?? "",
      discountType: p.discountType,
      discountValue: String(p.discountValue),
      minimumOrderAmount:
        p.minimumOrderAmount != null ? String(p.minimumOrderAmount) : "",
      maximumDiscount:
        p.maximumDiscount != null ? String(p.maximumDiscount) : "",
      perUserLimit: p.perUserLimit != null ? String(p.perUserLimit) : "",
      usageLimit: p.usageLimit != null ? String(p.usageLimit) : "",
      applicableProductIds: p.applicableProductIds,
      applicableCategoryIds: p.applicableCategoryIds,
      startsAt: toDatetimeLocal(p.startsAt),
      endsAt: toDatetimeLocal(p.endsAt),
      isActive: p.isActive,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.code.trim()) {
      toast.error("Code requis");
      return;
    }
    startSaveTransition(async () => {
      const payload: PromotionInput = {
        code: form.code.trim(),
        description: form.description.trim() || null,
        discountType: form.discountType,
        discountValue: Number(form.discountValue) || 0,
        minimumOrderAmount: form.minimumOrderAmount
          ? Number(form.minimumOrderAmount)
          : null,
        maximumDiscount: form.maximumDiscount
          ? Number(form.maximumDiscount)
          : null,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        applicableProductIds: form.applicableProductIds,
        applicableCategoryIds: form.applicableCategoryIds,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        isActive: form.isActive,
      };
      const res = editingId
        ? await updatePromotion(editingId, payload)
        : await createPromotion(payload);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success(editingId ? "Code mis à jour" : "Code créé");
      setShowModal(false);
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    const id = deletingId;
    startDeleteTransition(async () => {
      const res = await deletePromotion(id);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        setDeletingId(null);
        return;
      }
      toast.success("Code supprimé");
      setDeletingId(null);
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
          <h2 className="text-xl font-bold text-foreground">Codes promo</h2>
          <p className="text-sm text-steel">
            {promotions.length} code{promotions.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ember text-white rounded-lg font-medium text-sm hover:bg-ember-deep transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau code
        </button>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bone-soft/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                  Réduction
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                  Période
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-steel uppercase tracking-wider">
                  Utilisations
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-steel uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-steel-soft"
                  >
                    <Tag className="w-8 h-8 mx-auto mb-2 text-steel-soft" />
                    Aucun code promo. Créez-en un pour commencer.
                  </td>
                </tr>
              ) : (
                promotions.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/40 last:border-0 hover:bg-bone-soft/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono font-semibold text-foreground">
                        {p.code}
                      </p>
                      {p.description && (
                        <p className="text-xs text-steel-soft mt-0.5">
                          {p.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-ember">
                      {formatDiscount(p)}
                    </td>
                    <td className="px-4 py-3 text-xs text-steel">
                      {p.startsAt && <span>du {formatDate(p.startsAt)}</span>}
                      {p.endsAt && <span> au {formatDate(p.endsAt)}</span>}
                      {!p.startsAt && !p.endsAt && "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-steel">
                      {p.usageCount}
                      {p.usageLimit != null && (
                        <span className="text-steel-soft">
                          {" "}
                          / {p.usageLimit}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          p.isActive
                            ? "bg-success-soft text-success"
                            : "bg-bone-soft text-steel",
                        )}
                      >
                        {p.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-bone-soft text-steel hover:text-ember transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(p.id)}
                          disabled={isDeletePending}
                          className="p-1.5 rounded-lg hover:bg-bone-soft text-steel hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !isSavePending && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-base font-semibold text-foreground">
                  {editingId ? "Modifier le code" : "Nouveau code promo"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isSavePending}
                  className="p-1.5 rounded-lg hover:bg-bone-soft text-steel disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={labelClass}>Code *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className={cn(inputClass, "font-mono uppercase")}
                    placeholder="BIENVENUE10"
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Type *</label>
                    <select
                      value={form.discountType}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          discountType: e.target
                            .value as PromotionInput["discountType"],
                        })
                      }
                      className={inputClass}
                    >
                      {Object.entries(TYPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Valeur *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm({ ...form, discountValue: e.target.value })
                      }
                      className={inputClass}
                      disabled={form.discountType === "free_shipping"}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Min. commande (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.minimumOrderAmount}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          minimumOrderAmount: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Réduction max (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.maximumDiscount}
                      onChange={(e) =>
                        setForm({ ...form, maximumDiscount: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Limite par utilisateur</label>
                    <input
                      type="number"
                      min="0"
                      value={form.perUserLimit}
                      onChange={(e) =>
                        setForm({ ...form, perUserLimit: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Limite totale</label>
                    <input
                      type="number"
                      min="0"
                      value={form.usageLimit}
                      onChange={(e) =>
                        setForm({ ...form, usageLimit: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Début</label>
                    <input
                      type="datetime-local"
                      value={form.startsAt}
                      onChange={(e) =>
                        setForm({ ...form, startsAt: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Fin</label>
                    <input
                      type="datetime-local"
                      value={form.endsAt}
                      onChange={(e) =>
                        setForm({ ...form, endsAt: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-steel mb-3">
                    Ciblage (laisser vide pour tout le catalogue)
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>
                        Catégories applicables
                      </label>
                      <div className="border border-border rounded-lg max-h-32 overflow-y-auto p-2 space-y-1">
                        {categories.length === 0 ? (
                          <p className="text-xs text-steel px-2 py-1">
                            Aucune catégorie
                          </p>
                        ) : (
                          categories.map((c) => {
                            const checked = form.applicableCategoryIds.includes(
                              c.id,
                            );
                            return (
                              <label
                                key={c.id}
                                className="flex items-center gap-2 text-sm text-foreground hover:bg-bone-soft px-2 py-1 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    setForm({
                                      ...form,
                                      applicableCategoryIds: e.target.checked
                                        ? [...form.applicableCategoryIds, c.id]
                                        : form.applicableCategoryIds.filter(
                                            (id) => id !== c.id,
                                          ),
                                    });
                                  }}
                                  className="rounded accent-ember"
                                />
                                {c.name}
                              </label>
                            );
                          })
                        )}
                      </div>
                      {form.applicableCategoryIds.length > 0 ? (
                        <p className="text-xs text-steel mt-1">
                          {form.applicableCategoryIds.length} sélectionnée(s)
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className={labelClass}>
                        Produits applicables
                      </label>
                      <div className="border border-border rounded-lg max-h-32 overflow-y-auto p-2 space-y-1">
                        {products.length === 0 ? (
                          <p className="text-xs text-steel px-2 py-1">
                            Aucun produit
                          </p>
                        ) : (
                          products.map((p) => {
                            const checked = form.applicableProductIds.includes(
                              p.id,
                            );
                            return (
                              <label
                                key={p.id}
                                className="flex items-center gap-2 text-sm text-foreground hover:bg-bone-soft px-2 py-1 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    setForm({
                                      ...form,
                                      applicableProductIds: e.target.checked
                                        ? [...form.applicableProductIds, p.id]
                                        : form.applicableProductIds.filter(
                                            (id) => id !== p.id,
                                          ),
                                    });
                                  }}
                                  className="rounded accent-ember"
                                />
                                {p.name}
                              </label>
                            );
                          })
                        )}
                      </div>
                      {form.applicableProductIds.length > 0 ? (
                        <p className="text-xs text-steel mt-1">
                          {form.applicableProductIds.length} sélectionné(s)
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="rounded accent-ember"
                  />
                  Code actif
                </label>
              </div>
              <div className="flex gap-3 p-6 border-t border-border">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isSavePending}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-bone-soft transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSavePending}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-ember text-white rounded-lg text-sm font-medium hover:bg-ember-deep transition-colors disabled:opacity-50"
                >
                  {isSavePending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Supprimer ce code promo ?"
        description={
          deletingPromo
            ? `Le code « ${deletingPromo.code} » sera supprimé. Si des commandes l'ont déjà utilisé, elles ne seront pas affectées.`
            : undefined
        }
        confirmLabel="Supprimer"
        tone="destructive"
        pending={isDeletePending}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
}
