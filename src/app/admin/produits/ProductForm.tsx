"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  Star,
  Image as ImageIcon,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { cn, slugify } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type {
  AdminCategoryOption,
  AdminCollectionOption,
  AdminProductDetail,
} from "@/lib/queries/admin";
import {
  createProduct,
  deleteMedia,
  deleteProduct,
  deleteVariant,
  updateProduct,
  upsertMedia,
  upsertVariant,
  type MediaInput,
  type ProductInput,
  type VariantInput,
} from "./actions";

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta";

const labelClass = "block text-xs font-medium text-gray-700 mb-1";

interface BlankVariantState {
  id: string; // local-only id for keyed UI, replaced by DB id after save
  sku: string;
  name: string;
  size: string;
  materialVariant: string;
  stone: string;
  color: string;
  lengthCm: string;
  priceOverride: string;
  stockQuantity: string;
  lowStockThreshold: string;
  weightG: string;
  isActive: boolean;
  persistedId?: string;
}

interface BlankMediaState {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
  persistedId?: string;
}

function variantToState(v: AdminProductDetail["variants"][number]): BlankVariantState {
  return {
    id: v.id,
    persistedId: v.id,
    sku: v.sku ?? "",
    name: v.name ?? "",
    size: v.size ?? "",
    materialVariant: v.materialVariant ?? "",
    stone: v.stone ?? "",
    color: v.color ?? "",
    lengthCm: v.lengthCm != null ? String(v.lengthCm) : "",
    priceOverride: v.priceOverride != null ? String(v.priceOverride) : "",
    stockQuantity: String(v.stockQuantity ?? 0),
    lowStockThreshold: String(v.lowStockThreshold ?? 5),
    weightG: v.weightG != null ? String(v.weightG) : "",
    isActive: v.isActive,
  };
}

function mediaToState(m: AdminProductDetail["media"][number]): BlankMediaState {
  return {
    id: m.id,
    persistedId: m.id,
    url: m.url,
    altText: m.altText ?? "",
    isPrimary: m.isPrimary,
    sortOrder: m.sortOrder,
  };
}

function emptyVariant(): BlankVariantState {
  return {
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sku: "",
    name: "",
    size: "",
    materialVariant: "",
    stone: "",
    color: "",
    lengthCm: "",
    priceOverride: "",
    stockQuantity: "0",
    lowStockThreshold: "5",
    weightG: "",
    isActive: true,
  };
}

function emptyMedia(): BlankMediaState {
  return {
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    url: "",
    altText: "",
    isPrimary: false,
    sortOrder: 0,
  };
}

function variantStateToInput(v: BlankVariantState): VariantInput {
  return {
    id: v.persistedId,
    sku: v.sku.trim() || null,
    name: v.name.trim() || null,
    size: v.size.trim() || null,
    materialVariant: v.materialVariant.trim() || null,
    stone: v.stone.trim() || null,
    color: v.color.trim() || null,
    lengthCm: v.lengthCm ? Number(v.lengthCm) : null,
    priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
    stockQuantity: Number(v.stockQuantity) || 0,
    lowStockThreshold: Number(v.lowStockThreshold) || 5,
    weightG: v.weightG ? Number(v.weightG) : null,
    isActive: v.isActive,
  };
}

function mediaStateToInput(m: BlankMediaState): MediaInput {
  return {
    id: m.persistedId,
    url: m.url.trim(),
    altText: m.altText.trim() || null,
    isPrimary: m.isPrimary,
    sortOrder: m.sortOrder,
  };
}

export function ProductForm({
  product,
  categories,
  collections,
}: {
  product: AdminProductDetail | null;
  categories: AdminCategoryOption[];
  collections: AdminCollectionOption[];
}) {
  const router = useRouter();
  const isEditing = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(
    product?.shortDescription ?? "",
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [basePrice, setBasePrice] = useState(
    product?.basePrice != null ? String(product.basePrice) : "",
  );
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice != null ? String(product.compareAtPrice) : "",
  );
  const [sku, setSku] = useState(product?.sku ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [collectionId, setCollectionId] = useState(product?.collectionId ?? "");
  const [material, setMaterial] = useState(product?.material ?? "");
  const [weightG, setWeightG] = useState(
    product?.weightG != null ? String(product.weightG) : "",
  );
  const [dimensions, setDimensions] = useState(product?.dimensions ?? "");
  const [careInstructions, setCareInstructions] = useState(
    product?.careInstructions ?? "",
  );
  const [isNickelFree, setIsNickelFree] = useState(product?.isNickelFree ?? true);
  const [isActive, setIsActive] = useState(product?.isActive ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    product?.seoDescription ?? "",
  );

  const [variants, setVariants] = useState<BlankVariantState[]>(
    product ? product.variants.map(variantToState) : [emptyVariant()],
  );
  const [media, setMedia] = useState<BlankMediaState[]>(
    product ? product.media.map(mediaToState) : [],
  );

  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isVariantPending, startVariantTransition] = useTransition();
  const [isMediaPending, startMediaTransition] = useTransition();

  const buildPayload = (): ProductInput => ({
    name: name.trim(),
    slug: slug.trim() || slugify(name),
    shortDescription: shortDescription.trim(),
    description: description.trim(),
    basePrice: Number(basePrice) || 0,
    compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
    sku: sku.trim() || null,
    categoryId: categoryId || null,
    collectionId: collectionId || null,
    material: material.trim() || null,
    weightG: weightG ? Number(weightG) : null,
    dimensions: dimensions.trim() || null,
    careInstructions: careInstructions.trim() || null,
    isNickelFree,
    isActive,
    isFeatured,
    isNew,
    seoTitle: seoTitle.trim() || null,
    seoDescription: seoDescription.trim() || null,
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Le nom du produit est requis");
      return;
    }
    if (!basePrice || Number(basePrice) < 0) {
      toast.error("Le prix doit être un nombre positif");
      return;
    }

    startSaveTransition(async () => {
      const payload = buildPayload();
      if (isEditing && product) {
        const res = await updateProduct(product.id, payload);
        if (!res.ok) {
          toast.error(res.error ?? "Erreur");
          return;
        }
        toast.success("Produit mis à jour");
        router.refresh();
      } else {
        // Pour la création, on envoie aussi les variantes et médias
        const variantsPayload = variants.map(variantStateToInput);
        const mediaPayload = media
          .filter((m) => m.url.trim())
          .map(mediaStateToInput);
        const res = await createProduct(payload, variantsPayload, mediaPayload);
        if (res && !res.ok) {
          toast.error(res.error ?? "Erreur");
        }
        // En cas de succès, createProduct redirect()
      }
    });
  };

  const handleDelete = () => {
    if (!product) return;
    if (
      !window.confirm(
        "Supprimer définitivement ce produit ? Cette action est irréversible.",
      )
    )
      return;
    startDeleteTransition(async () => {
      const res = await deleteProduct(product.id);
      if (res && !res.ok) {
        toast.error(res.error ?? "Erreur");
      }
    });
  };

  const handleSaveVariant = (idx: number) => {
    if (!product) return;
    const variant = variants[idx];
    startVariantTransition(async () => {
      const res = await upsertVariant(
        product.id,
        variantStateToInput(variant),
      );
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Variante enregistrée");
      router.refresh();
    });
  };

  const handleDeleteVariant = (idx: number) => {
    const variant = variants[idx];
    if (!variant.persistedId || !product) {
      // Variante non persistée → suppression locale
      setVariants((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    if (!window.confirm("Supprimer cette variante ?")) return;
    startVariantTransition(async () => {
      const res = await deleteVariant(product.id, variant.persistedId!);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Variante supprimée");
      setVariants((prev) => prev.filter((_, i) => i !== idx));
    });
  };

  const handleSaveMedia = (idx: number) => {
    if (!product) return;
    const m = media[idx];
    if (!m.url.trim()) {
      toast.error("URL requise");
      return;
    }
    startMediaTransition(async () => {
      const res = await upsertMedia(product.id, mediaStateToInput(m));
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Média enregistré");
      router.refresh();
    });
  };

  const handleDeleteMedia = (idx: number) => {
    const m = media[idx];
    if (!m.persistedId || !product) {
      setMedia((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    if (!window.confirm("Supprimer cette image ?")) return;
    startMediaTransition(async () => {
      const res = await deleteMedia(product.id, m.persistedId!);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Média supprimé");
      setMedia((prev) => prev.filter((_, i) => i !== idx));
    });
  };

  const updateVariantField = <K extends keyof BlankVariantState>(
    idx: number,
    key: K,
    value: BlankVariantState[K],
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [key]: value } : v)),
    );
  };

  const updateMediaField = <K extends keyof BlankMediaState>(
    idx: number,
    key: K,
    value: BlankMediaState[K],
  ) => {
    setMedia((prev) =>
      prev.map((m, i) => {
        if (i !== idx) {
          // Si on définit une autre image comme primary, on désactive celle-ci
          if (key === "isPrimary" && value === true) {
            return { ...m, isPrimary: false };
          }
          return m;
        }
        return { ...m, [key]: value };
      }),
    );
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <Link
          href="/admin/produits"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux produits
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">
            {isEditing ? `Éditer : ${product?.name}` : "Nouveau produit"}
          </h1>
          <div className="flex gap-2">
            {isEditing && (
              <button
                onClick={handleDelete}
                disabled={isDeletePending}
                className="inline-flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {isDeletePending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Supprimer
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSavePending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-50"
            >
              {isSavePending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? "Enregistrer" : "Créer le produit"}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Informations */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
          >
            <h2 className="text-base font-semibold text-gray-900">
              Informations
            </h2>
            <div>
              <label className={labelClass}>Nom *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!isEditing && (!slug || slug === slugify(name))) {
                    setSlug(slugify(e.target.value));
                  }
                }}
                className={inputClass}
                placeholder="Collier Fleur d'Oranger"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={inputClass}
                  placeholder="collier-fleur-d-oranger"
                />
              </div>
              <div>
                <label className={labelClass}>SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className={inputClass}
                  placeholder="COL-FO-001"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description courte</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className={inputClass}
                placeholder="Affichée sur les cartes produits"
              />
            </div>
            <div>
              <label className={labelClass}>Description complète</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={cn(inputClass, "resize-none")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Catégorie</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Aucune —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Collection</label>
                <select
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Aucune —</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Prix */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
          >
            <h2 className="text-base font-semibold text-gray-900">Prix</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Prix de base (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Prix barré (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  className={inputClass}
                  placeholder="Pour afficher une promotion"
                />
              </div>
            </div>
          </motion.div>

          {/* Variantes */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Variantes
              </h2>
              <button
                onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
                className="inline-flex items-center gap-1.5 text-sm text-terracotta hover:underline"
              >
                <Plus className="w-4 h-4" />
                Ajouter une variante
              </button>
            </div>
            {variants.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Au moins une variante est requise pour activer la vente.
              </p>
            ) : (
              <div className="space-y-3">
                {variants.map((variant, idx) => (
                  <div
                    key={variant.id}
                    className="border border-gray-200 rounded-lg p-3 space-y-3"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className={labelClass}>SKU</label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) =>
                            updateVariantField(idx, "sku", e.target.value)
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Taille</label>
                        <input
                          type="text"
                          value={variant.size}
                          onChange={(e) =>
                            updateVariantField(idx, "size", e.target.value)
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Matière</label>
                        <input
                          type="text"
                          value={variant.materialVariant}
                          onChange={(e) =>
                            updateVariantField(
                              idx,
                              "materialVariant",
                              e.target.value,
                            )
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Pierre</label>
                        <input
                          type="text"
                          value={variant.stone}
                          onChange={(e) =>
                            updateVariantField(idx, "stone", e.target.value)
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className={labelClass}>Stock</label>
                        <input
                          type="number"
                          min="0"
                          value={variant.stockQuantity}
                          onChange={(e) =>
                            updateVariantField(
                              idx,
                              "stockQuantity",
                              e.target.value,
                            )
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Seuil bas</label>
                        <input
                          type="number"
                          min="0"
                          value={variant.lowStockThreshold}
                          onChange={(e) =>
                            updateVariantField(
                              idx,
                              "lowStockThreshold",
                              e.target.value,
                            )
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Prix surchargé (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.priceOverride}
                          onChange={(e) =>
                            updateVariantField(
                              idx,
                              "priceOverride",
                              e.target.value,
                            )
                          }
                          className={inputClass}
                          placeholder="(défaut)"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Poids (g)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.weightG}
                          onChange={(e) =>
                            updateVariantField(idx, "weightG", e.target.value)
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={variant.isActive}
                          onChange={(e) =>
                            updateVariantField(
                              idx,
                              "isActive",
                              e.target.checked,
                            )
                          }
                          className="rounded accent-terracotta"
                        />
                        Active
                      </label>
                      <div className="flex gap-2">
                        {isEditing && (
                          <button
                            onClick={() => handleSaveVariant(idx)}
                            disabled={isVariantPending}
                            className="text-xs text-terracotta hover:underline disabled:opacity-50"
                          >
                            {variant.persistedId
                              ? "Mettre à jour"
                              : "Enregistrer"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteVariant(idx)}
                          disabled={isVariantPending}
                          className="text-xs text-red-600 hover:underline disabled:opacity-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Médias */}
          {isEditing && (
            <motion.div
              variants={staggerItem}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                  Médias
                </h2>
                <button
                  onClick={() => setMedia((prev) => [...prev, emptyMedia()])}
                  className="inline-flex items-center gap-1.5 text-sm text-terracotta hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un média
                </button>
              </div>
              {media.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  Aucun média. Ajoutez des images pour habiller la fiche
                  produit.
                </p>
              ) : (
                <div className="space-y-3">
                  {media.map((m, idx) => (
                    <div
                      key={m.id}
                      className="flex gap-3 items-start border border-gray-200 rounded-lg p-3"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                        {m.url ? (
                          <Image
                            src={m.url}
                            alt={m.altText || ""}
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="url"
                          value={m.url}
                          onChange={(e) =>
                            updateMediaField(idx, "url", e.target.value)
                          }
                          placeholder="https://..."
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={m.altText}
                          onChange={(e) =>
                            updateMediaField(idx, "altText", e.target.value)
                          }
                          placeholder="Texte alternatif (SEO/accessibilité)"
                          className={inputClass}
                        />
                        <div className="flex items-center justify-between">
                          <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                            <input
                              type="checkbox"
                              checked={m.isPrimary}
                              onChange={(e) =>
                                updateMediaField(
                                  idx,
                                  "isPrimary",
                                  e.target.checked,
                                )
                              }
                              className="rounded accent-terracotta"
                            />
                            <Star className="w-3.5 h-3.5" />
                            Image principale
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveMedia(idx)}
                              disabled={isMediaPending}
                              className="text-xs text-terracotta hover:underline disabled:opacity-50"
                            >
                              {m.persistedId ? "Mettre à jour" : "Enregistrer"}
                            </button>
                            <button
                              onClick={() => handleDeleteMedia(idx)}
                              disabled={isMediaPending}
                              className="text-xs text-red-600 hover:underline disabled:opacity-50"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Caractéristiques */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
          >
            <h2 className="text-base font-semibold text-gray-900">
              Caractéristiques
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Matière</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className={inputClass}
                  placeholder="Acier inoxydable"
                />
              </div>
              <div>
                <label className={labelClass}>Poids (g)</label>
                <input
                  type="number"
                  step="0.01"
                  value={weightG}
                  onChange={(e) => setWeightG(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Dimensions</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className={inputClass}
                placeholder='40 cm + 5 cm d&apos;extension'
              />
            </div>
            <div>
              <label className={labelClass}>
                Instructions d&apos;entretien
              </label>
              <textarea
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                rows={2}
                className={cn(inputClass, "resize-none")}
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isNickelFree}
                onChange={(e) => setIsNickelFree(e.target.checked)}
                className="rounded accent-terracotta"
              />
              Sans nickel
            </label>
          </motion.div>

          {/* SEO */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
          >
            <h2 className="text-base font-semibold text-gray-900">SEO</h2>
            <div>
              <label className={labelClass}>Titre SEO</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className={inputClass}
                maxLength={60}
              />
              <p className="text-xs text-gray-400 mt-1">
                {seoTitle.length}/60 caractères
              </p>
            </div>
            <div>
              <label className={labelClass}>Description SEO</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                maxLength={160}
                className={cn(inputClass, "resize-none")}
              />
              <p className="text-xs text-gray-400 mt-1">
                {seoDescription.length}/160 caractères
              </p>
            </div>
          </motion.div>
        </div>

        {/* Sidebar - publication */}
        <div className="space-y-4">
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Publication</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Actif (visible)</span>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded accent-terracotta"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Best-seller</span>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded accent-terracotta"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Nouveauté</span>
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="rounded accent-terracotta"
                />
              </label>
            </div>
          </motion.div>

          {isEditing && product && (
            <motion.div
              variants={staggerItem}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <h3 className="font-semibold text-gray-900 mb-3">Aperçu</h3>
              <Link
                href={`/produit/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-terracotta hover:underline"
              >
                <Package className="w-4 h-4" />
                Voir la page publique
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
