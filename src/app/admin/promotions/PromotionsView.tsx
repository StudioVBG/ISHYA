"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Percent as PercentIcon,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminPromotionRow } from "@/lib/queries/admin";
import {
  createPromotion,
  deletePromotion,
  updatePromotion,
  type PromotionInput,
} from "./actions";

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta";
const labelClass = "block text-xs font-medium text-gray-700 mb-1";

interface FormState {
  code: string;
  description: string;
  discountType: PromotionInput["discountType"];
  discountValue: string;
  minimumOrderAmount: string;
  maximumDiscount: string;
  perUserLimit: string;
  usageLimit: string;
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
}: {
  promotions: AdminPromotionRow[];
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

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

  const handleDelete = (id: string) => {
    if (!window.confirm("Supprimer ce code promo ?")) return;
    startDeleteTransition(async () => {
      const res = await deletePromotion(id);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Code supprimé");
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
          <h2 className="text-xl font-bold text-gray-900">Codes promo</h2>
          <p className="text-sm text-gray-500">
            {promotions.length} code{promotions.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau code
        </button>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Réduction
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Période
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Utilisations
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    <Tag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    Aucun code promo. Créez-en un pour commencer.
                  </td>
                </tr>
              ) : (
                promotions.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono font-semibold text-gray-900">
                        {p.code}
                      </p>
                      {p.description && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {p.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-terracotta">
                      {formatDiscount(p)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {p.startsAt && <span>du {formatDate(p.startsAt)}</span>}
                      {p.endsAt && <span> au {formatDate(p.endsAt)}</span>}
                      {!p.startsAt && !p.endsAt && "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {p.usageCount}
                      {p.usageLimit != null && (
                        <span className="text-gray-400">
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
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600",
                        )}
                      >
                        {p.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-terracotta transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={isDeletePending}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
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
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">
                  {editingId ? "Modifier le code" : "Nouveau code promo"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isSavePending}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50"
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
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="rounded accent-terracotta"
                  />
                  Code actif
                </label>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isSavePending}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSavePending}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-50"
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
    </motion.div>
  );
}
