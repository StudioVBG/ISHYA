"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  ImageIcon,
  Image as Banner,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import type { AdminBannerRow } from "@/lib/queries/admin";
import {
  createBanner,
  deleteBanner,
  updateBanner,
  type BannerInput,
  type BannerPlacement,
} from "./actions";

const inputClass =
  "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta";
const labelClass = "block text-xs font-medium text-foreground mb-1";

const PLACEMENT_LABELS: Record<BannerPlacement, string> = {
  hero: "Hero (haut de page)",
  category: "Catégorie",
  sidebar: "Barre latérale",
  popup: "Pop-up",
  footer: "Pied de page",
  announcement_bar: "Bandeau d'annonce",
};

interface FormState {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  placement: BannerPlacement;
  startsAt: string;
  endsAt: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "",
  placement: "hero",
  startsAt: "",
  endsAt: "",
  sortOrder: "0",
  isActive: true,
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BannieresView({ banners }: { banners: AdminBannerRow[] }) {
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

  const openEdit = (b: AdminBannerRow) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      imageUrl: b.imageUrl ?? "",
      linkUrl: b.linkUrl ?? "",
      placement: b.placement as BannerPlacement,
      startsAt: toDatetimeLocal(b.startsAt),
      endsAt: toDatetimeLocal(b.endsAt),
      sortOrder: String(b.sortOrder),
      isActive: b.isActive,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Titre requis");
      return;
    }
    startSaveTransition(async () => {
      const payload: BannerInput = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        linkUrl: form.linkUrl.trim() || null,
        placement: form.placement,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };
      const res = editingId
        ? await updateBanner(editingId, payload)
        : await createBanner(payload);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success(editingId ? "Bannière mise à jour" : "Bannière créée");
      setShowModal(false);
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Supprimer cette bannière ?")) return;
    startDeleteTransition(async () => {
      const res = await deleteBanner(id);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Bannière supprimée");
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
          <h2 className="text-xl font-bold text-foreground">Bannières</h2>
          <p className="text-sm text-muted">
            {banners.length} bannière{banners.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle bannière
        </button>
      </motion.div>

      {banners.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-12 text-center text-muted-light"
        >
          <Banner className="w-8 h-8 mx-auto mb-2 text-muted-light" aria-hidden />
          Aucune bannière. Créez-en une pour commencer.
        </motion.div>
      ) : (
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-border overflow-hidden"
            >
              <div className="relative aspect-[2/1] bg-muted-soft">
                {b.imageUrl ? (
                  <Image
                    src={b.imageUrl}
                    alt={b.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-muted-light" />
                  </div>
                )}
                <span
                  className={cn(
                    "absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium",
                    b.isActive
                      ? "bg-success/90 text-white"
                      : "bg-muted/90 text-white",
                  )}
                >
                  {b.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-light uppercase tracking-wide mb-1">
                  {PLACEMENT_LABELS[b.placement as BannerPlacement] ??
                    b.placement}
                </p>
                <p className="font-medium text-foreground truncate">{b.title}</p>
                {b.subtitle && (
                  <p className="text-xs text-muted truncate mt-0.5">
                    {b.subtitle}
                  </p>
                )}
                {(b.startsAt || b.endsAt) && (
                  <p className="text-xs text-muted-light mt-2">
                    {b.startsAt && `du ${formatDate(b.startsAt)}`}
                    {b.endsAt && ` au ${formatDate(b.endsAt)}`}
                  </p>
                )}
                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-border/50">
                  <button
                    onClick={() => openEdit(b)}
                    className="p-1.5 rounded-lg hover:bg-muted-soft text-muted hover:text-terracotta transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    disabled={isDeletePending}
                    className="p-1.5 rounded-lg hover:bg-muted-soft text-muted hover:text-destructive transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-base font-semibold text-foreground">
                  {editingId ? "Modifier la bannière" : "Nouvelle bannière"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isSavePending}
                  className="p-1.5 rounded-lg hover:bg-muted-soft text-muted disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={labelClass}>Titre *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Sous-titre</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) =>
                      setForm({ ...form, subtitle: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Image de la bannière</label>
                  <SingleImageUploader
                    value={form.imageUrl || null}
                    onChange={(url) =>
                      setForm({ ...form, imageUrl: url ?? "" })
                    }
                    folder="banners"
                    aspect="2/1"
                    disabled={isSavePending}
                  />
                </div>
                <div>
                  <label className={labelClass}>URL de redirection</label>
                  <input
                    type="text"
                    value={form.linkUrl}
                    onChange={(e) =>
                      setForm({ ...form, linkUrl: e.target.value })
                    }
                    className={inputClass}
                    placeholder="/boutique?categorie=colliers"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Emplacement</label>
                    <select
                      value={form.placement}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          placement: e.target.value as BannerPlacement,
                        })
                      }
                      className={inputClass}
                    >
                      {Object.entries(PLACEMENT_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Ordre</label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) =>
                        setForm({ ...form, sortOrder: e.target.value })
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
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="rounded accent-terracotta"
                  />
                  Bannière active
                </label>
              </div>
              <div className="flex gap-3 p-6 border-t border-border">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isSavePending}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted-soft transition-colors disabled:opacity-50"
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
