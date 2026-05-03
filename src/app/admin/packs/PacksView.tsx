"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Gift,
  ImageIcon,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice, slugify, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminPackRow } from "@/lib/queries/admin";
import {
  createPack,
  deletePack,
  updatePack,
  type PackDiscountType,
  type PackInput,
} from "./actions";

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta";
const labelClass = "block text-xs font-medium text-gray-700 mb-1";

const TYPE_LABELS: Record<PackDiscountType, string> = {
  percentage: "% (pourcentage)",
  fixed_amount: "€ (montant fixe)",
  free_shipping: "Livraison offerte",
  buy_x_get_y: "Achetez X, obtenez Y",
};

interface FormState {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  discountType: PackDiscountType;
  discountValue: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  discountType: "percentage",
  discountValue: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDiscount(p: AdminPackRow): string {
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

export function PacksView({ packs }: { packs: AdminPackRow[] }) {
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

  const openEdit = (p: AdminPackRow) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description ?? "",
      imageUrl: p.imageUrl ?? "",
      discountType: p.discountType,
      discountValue: String(p.discountValue),
      startsAt: toDatetimeLocal(p.startsAt),
      endsAt: toDatetimeLocal(p.endsAt),
      isActive: p.isActive,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Nom requis");
      return;
    }
    startSaveTransition(async () => {
      const payload: PackInput = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        discountType: form.discountType,
        discountValue: Number(form.discountValue) || 0,
        startsAt: form.startsAt
          ? new Date(form.startsAt).toISOString()
          : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        isActive: form.isActive,
      };
      const res = editingId
        ? await updatePack(editingId, payload)
        : await createPack(payload);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success(editingId ? "Pack mis à jour" : "Pack créé");
      setShowModal(false);
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Supprimer ce pack ?")) return;
    startDeleteTransition(async () => {
      const res = await deletePack(id);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Pack supprimé");
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
          <h2 className="text-xl font-bold text-gray-900">Packs & parures</h2>
          <p className="text-sm text-gray-500">
            {packs.length} pack{packs.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau pack
        </button>
      </motion.div>

      {packs.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400"
        >
          <Gift className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          Aucun pack pour l&apos;instant.
        </motion.div>
      ) : (
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {packs.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[16/10] bg-gray-100">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                <span
                  className={cn(
                    "absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium",
                    p.isActive
                      ? "bg-emerald-500/90 text-white"
                      : "bg-gray-500/90 text-white",
                  )}
                >
                  {p.isActive ? "Actif" : "Inactif"}
                </span>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-terracotta/90 text-white">
                  {formatDiscount(p)}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="font-medium text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  /{p.slug}
                </p>
                {p.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {p.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mt-2">
                  <span>
                    {p.itemCount} produit{p.itemCount > 1 ? "s" : ""}
                  </span>
                  {p.startsAt && (
                    <span>· du {formatDate(p.startsAt)}</span>
                  )}
                  {p.endsAt && <span>au {formatDate(p.endsAt)}</span>}
                </div>
                <div className="flex items-center justify-between gap-1 mt-3 pt-3 border-t border-gray-100">
                  <Link
                    href={`/admin/packs/${p.id}`}
                    className="inline-flex items-center gap-1 text-xs text-terracotta hover:underline"
                  >
                    <Package className="w-3.5 h-3.5" />
                    Composer
                  </Link>
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
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

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
                  {editingId ? "Modifier le pack" : "Nouveau pack"}
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
                  <label className={labelClass}>Nom *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm((f) => {
                        const next = { ...f, name: e.target.value };
                        if (
                          !editingId &&
                          (!f.slug || f.slug === slugify(f.name))
                        ) {
                          next.slug = slugify(e.target.value);
                        }
                        return next;
                      });
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    className={cn(inputClass, "resize-none")}
                  />
                </div>
                <div>
                  <label className={labelClass}>URL image</label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, imageUrl: e.target.value })
                    }
                    className={inputClass}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Type de réduction</label>
                    <select
                      value={form.discountType}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          discountType: e.target.value as PackDiscountType,
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
                    <label className={labelClass}>Valeur</label>
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
                  Pack actif
                </label>
                <p className="text-xs text-gray-400 italic">
                  Les produits inclus dans le pack se gèrent depuis la table
                  pack_items en base (UI dédiée à venir).
                </p>
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
