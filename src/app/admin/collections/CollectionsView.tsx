"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Layers,
  Package,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { AdminCollectionRow } from "@/lib/queries/admin";
import {
  createCollection,
  deleteCollection,
  updateCollection,
  type CollectionInput,
} from "./actions";

const inputClass =
  "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta";
const labelClass = "block text-xs font-medium text-foreground mb-1";

interface FormState {
  name: string;
  description: string;
  imageUrl: string;
  startsAt: string;
  endsAt: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  imageUrl: "",
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

type SortKey =
  | "order-asc"
  | "order-desc"
  | "name-asc"
  | "name-desc"
  | "products-desc"
  | "products-asc"
  | "starts-desc"
  | "starts-asc";

const SORT_LABELS: Record<SortKey, string> = {
  "order-asc": "Ordre (1 → 9)",
  "order-desc": "Ordre (9 → 1)",
  "name-asc": "Nom (A → Z)",
  "name-desc": "Nom (Z → A)",
  "products-desc": "Produits (plus → moins)",
  "products-asc": "Produits (moins → plus)",
  "starts-desc": "Début (récent → ancien)",
  "starts-asc": "Début (ancien → récent)",
};

export function CollectionsView({
  collections,
}: {
  collections: AdminCollectionRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">(
    "",
  );
  const [sortKey, setSortKey] = useState<SortKey>("order-asc");

  const visibleCollections = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = collections.filter((c) => {
      if (q) {
        const haystack = `${c.name} ${c.slug} ${c.description ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (statusFilter === "active" && !c.isActive) return false;
      if (statusFilter === "inactive" && c.isActive) return false;
      return true;
    });
    const startsAtMs = (c: AdminCollectionRow) =>
      c.startsAt ? new Date(c.startsAt).getTime() : 0;
    const sorted = [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "order-asc":
          return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fr");
        case "order-desc":
          return b.sortOrder - a.sortOrder || a.name.localeCompare(b.name, "fr");
        case "name-asc":
          return a.name.localeCompare(b.name, "fr");
        case "name-desc":
          return b.name.localeCompare(a.name, "fr");
        case "products-desc":
          return b.productCount - a.productCount;
        case "products-asc":
          return a.productCount - b.productCount;
        case "starts-desc":
          return startsAtMs(b) - startsAtMs(a);
        case "starts-asc":
          return startsAtMs(a) - startsAtMs(b);
      }
    });
    return sorted;
  }, [collections, search, statusFilter, sortKey]);

  const deletingCollection = collections.find((c) => c.id === deletingId);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (c: AdminCollectionRow) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      description: c.description ?? "",
      imageUrl: c.imageUrl ?? "",
      startsAt: toDatetimeLocal(c.startsAt),
      endsAt: toDatetimeLocal(c.endsAt),
      sortOrder: String(c.sortOrder),
      isActive: c.isActive,
    });
    setShowModal(true);
  };

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId) return;
    const target = collections.find((c) => c.id === editId);
    if (target) {
      openEdit(target);
      router.replace("/admin/collections", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, collections]);

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Nom requis");
      return;
    }
    startSaveTransition(async () => {
      const payload: CollectionInput = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        startsAt: form.startsAt
          ? new Date(form.startsAt).toISOString()
          : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };
      const res = editingId
        ? await updateCollection(editingId, payload)
        : await createCollection(payload);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success(editingId ? "Collection mise à jour" : "Collection créée");
      setShowModal(false);
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    const id = deletingId;
    startDeleteTransition(async () => {
      const res = await deleteCollection(id);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        setDeletingId(null);
        return;
      }
      toast.success("Collection supprimée");
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
          <h2 className="text-xl font-bold text-foreground">Collections</h2>
          <p className="text-sm text-muted">
            {collections.length} collection{collections.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle collection
        </button>
      </motion.div>

      {collections.length > 0 && (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
              <input
                type="text"
                placeholder="Rechercher une collection..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
              />
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
              aria-label="Trier les collections"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "" | "active" | "inactive")
              }
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
              aria-label="Filtrer par statut"
            >
              <option value="">Tous statuts</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {visibleCollections.length !== collections.length && (
            <p className="mt-3 pt-3 border-t border-border/50 text-xs text-muted">
              {visibleCollections.length} collection
              {visibleCollections.length > 1 ? "s" : ""} affichée
              {visibleCollections.length > 1 ? "s" : ""} sur {collections.length}
            </p>
          )}
        </motion.div>
      )}

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted-soft/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                  Période
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">
                  Produits
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {collections.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-light"
                  >
                    <Layers className="w-8 h-8 mx-auto mb-2 text-muted-light" />
                    Aucune collection. Créez-en une pour commencer.
                  </td>
                </tr>
              ) : visibleCollections.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-light"
                  >
                    <Layers className="w-8 h-8 mx-auto mb-2 text-muted-light" />
                    Aucune collection ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                visibleCollections.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/40 last:border-0 hover:bg-muted-soft/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {c.slug}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {c.startsAt && (
                        <span>du {formatDate(c.startsAt)}</span>
                      )}
                      {c.endsAt && (
                        <span> au {formatDate(c.endsAt)}</span>
                      )}
                      {!c.startsAt && !c.endsAt && "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-muted">
                      <Link
                        href={`/admin/collections/${c.id}`}
                        className="inline-flex items-center gap-1 hover:text-terracotta hover:underline"
                      >
                        <Package className="w-3.5 h-3.5" />
                        {c.productCount}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          c.isActive
                            ? "bg-success-soft text-success"
                            : "bg-muted-soft text-muted",
                        )}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/collections/${c.id}`}
                          className="p-1.5 rounded-lg hover:bg-muted-soft text-muted hover:text-terracotta transition-colors"
                          title="Gérer les produits"
                        >
                          <Package className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg hover:bg-muted-soft text-muted hover:text-terracotta transition-colors"
                          title="Éditer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(c.id)}
                          disabled={isDeletePending}
                          className="p-1.5 rounded-lg hover:bg-muted-soft text-muted hover:text-destructive transition-colors disabled:opacity-50"
                          title="Supprimer"
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
                  {editingId ? "Modifier la collection" : "Nouvelle collection"}
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
                  <label className={labelClass}>Nom *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
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
                  <label className={labelClass}>Image de la collection</label>
                  <SingleImageUploader
                    value={form.imageUrl || null}
                    onChange={(url) =>
                      setForm({ ...form, imageUrl: url ?? "" })
                    }
                    folder="collections"
                    aspect="16/10"
                    disabled={isSavePending}
                  />
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
                <div>
                  <label className={labelClass}>Ordre d&apos;affichage</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm({ ...form, sortOrder: e.target.value })
                    }
                    className={inputClass}
                  />
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
                  Collection active
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

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Supprimer cette collection ?"
        description={
          deletingCollection
            ? `« ${deletingCollection.name} » sera supprimée. Cette action est définitive.`
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
