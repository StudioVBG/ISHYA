"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn, slugify } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ImageUploader, type UploadedPhoto } from "@/components/admin/ImageUploader";
import type {
  AdminCategoryOption,
  AdminCollectionOption,
  AdminProductDetail,
} from "@/lib/queries/admin";
import {
  createProduct,
  deleteProduct,
  replaceMedia,
  replaceVariants,
  updateProduct,
  type MediaInput,
  type ProductInput,
  type VariantInput,
} from "./actions";

const inputClass =
  "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta";

const labelClass = "block text-sm font-medium text-foreground mb-1";

const helpClass = "text-xs text-muted-light mt-1";

interface VariantState {
  uiKey: string;
  persistedId?: string;
  size: string;
  stone: string;
  materialVariant: string;
  priceOverride: string;
  stockQuantity: string;
  lowStockThreshold: string;
  isActive: boolean;
}

function variantToState(v: AdminProductDetail["variants"][number]): VariantState {
  return {
    uiKey: v.id,
    persistedId: v.id,
    size: v.size ?? "",
    stone: v.stone ?? "",
    materialVariant: v.materialVariant ?? "",
    priceOverride: v.priceOverride != null ? String(v.priceOverride) : "",
    stockQuantity: String(v.stockQuantity ?? 0),
    lowStockThreshold: String(v.lowStockThreshold ?? 5),
    isActive: v.isActive,
  };
}

function emptyVariant(): VariantState {
  return {
    uiKey: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    size: "",
    stone: "",
    materialVariant: "",
    priceOverride: "",
    stockQuantity: "0",
    lowStockThreshold: "3",
    isActive: true,
  };
}

function variantStateToInput(v: VariantState): VariantInput {
  return {
    id: v.persistedId,
    sku: null,
    name: null,
    size: v.size.trim() || null,
    materialVariant: v.materialVariant.trim() || null,
    stone: v.stone.trim() || null,
    color: null,
    lengthCm: null,
    priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
    stockQuantity: Number(v.stockQuantity) || 0,
    lowStockThreshold: Number(v.lowStockThreshold) || 3,
    weightG: null,
    isActive: v.isActive,
  };
}

function photoStateToMediaInput(p: UploadedPhoto): MediaInput {
  return {
    id: p.persistedId,
    url: p.url,
    storagePath: p.storagePath,
    altText: p.altText.trim() || null,
    isPrimary: p.isPrimary,
    sortOrder: p.sortOrder,
  };
}

function mediaToUploadedPhoto(m: AdminProductDetail["media"][number]): UploadedPhoto {
  return {
    id: m.id,
    persistedId: m.id,
    url: m.url,
    storagePath: null,
    altText: m.altText ?? "",
    isPrimary: m.isPrimary,
    sortOrder: m.sortOrder,
  };
}

interface SectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  forceOpen?: boolean;
}

function CollapsibleSection({ title, subtitle, defaultOpen, children, forceOpen }: SectionProps) {
  const [open, setOpen] = useState(!!defaultOpen);
  const isOpen = forceOpen || open;
  return (
    <motion.div
      variants={staggerItem}
      className="bg-white rounded-xl border border-border overflow-hidden"
    >
      <button
        type="button"
        onClick={() => !forceOpen && setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between p-5 text-left",
          forceOpen && "cursor-default",
        )}
      >
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-light mt-0.5">{subtitle}</p>
          )}
        </div>
        {!forceOpen && (
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted transition-transform",
              isOpen && "rotate-180",
            )}
          />
        )}
      </button>
      {isOpen && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </motion.div>
  );
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
  const [basePrice, setBasePrice] = useState(
    product?.basePrice != null ? String(product.basePrice) : "",
  );
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice != null ? String(product.compareAtPrice) : "",
  );

  const [primaryCategoryId, setPrimaryCategoryId] = useState<string | null>(
    product?.categoryIds?.[0] ?? product?.categoryId ?? null,
  );
  const [extraCategoryIds, setExtraCategoryIds] = useState<string[]>(
    (product?.categoryIds ?? []).slice(1),
  );
  const [collectionIds, setCollectionIds] = useState<string[]>(
    product?.collectionIds ?? (product?.collectionId ? [product.collectionId] : []),
  );

  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [description, setDescription] = useState(product?.description ?? "");

  const [photos, setPhotos] = useState<UploadedPhoto[]>(
    product ? product.media.map(mediaToUploadedPhoto) : [],
  );

  const initialVariants = product?.variants.map(variantToState) ?? [];
  const [variants, setVariants] = useState<VariantState[]>(
    initialVariants.length > 0 ? initialVariants : [emptyVariant()],
  );
  const hasMultipleVariants = variants.length > 1;
  const [showVariants, setShowVariants] = useState(hasMultipleVariants);

  const [material, setMaterial] = useState(product?.material ?? "");
  const [weightG, setWeightG] = useState(
    product?.weightG != null ? String(product.weightG) : "",
  );
  const [dimensions, setDimensions] = useState(product?.dimensions ?? "");
  const [careInstructions, setCareInstructions] = useState(product?.careInstructions ?? "");
  const [isNickelFree, setIsNickelFree] = useState(product?.isNickelFree ?? true);

  const [seoTitle, setSeoTitle] = useState(product?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(product?.seoDescription ?? "");

  const [isActive, setIsActive] = useState(product?.isActive ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);

  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const allCategoryIds = useMemo(() => {
    const ids = primaryCategoryId
      ? [primaryCategoryId, ...extraCategoryIds.filter((id) => id !== primaryCategoryId)]
      : [];
    return Array.from(new Set(ids));
  }, [primaryCategoryId, extraCategoryIds]);

  const buildPayload = (active: boolean): ProductInput => ({
    name: name.trim(),
    slug: product?.slug ?? slugify(name),
    shortDescription: shortDescription.trim(),
    description: description.trim(),
    basePrice: Number(basePrice) || 0,
    compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
    sku: null,
    categoryId: primaryCategoryId,
    collectionId: collectionIds[0] ?? null,
    categoryIds: allCategoryIds,
    collectionIds,
    material: material.trim() || null,
    weightG: weightG ? Number(weightG) : null,
    dimensions: dimensions.trim() || null,
    careInstructions: careInstructions.trim() || null,
    isNickelFree,
    isActive: active,
    isFeatured,
    isNew,
    seoTitle: seoTitle.trim() || null,
    seoDescription: seoDescription.trim() || null,
  });

  const validate = (): string | null => {
    if (!name.trim()) return "Donne un nom au produit";
    if (!basePrice || Number(basePrice) <= 0)
      return "Le prix doit être supérieur à 0 €";
    if (
      compareAtPrice &&
      Number(compareAtPrice) > 0 &&
      Number(compareAtPrice) <= Number(basePrice)
    )
      return "L'ancien prix doit être plus élevé que le prix actuel";
    if (!primaryCategoryId)
      return "Choisis une catégorie principale (collier, bague, etc.)";
    return null;
  };

  const handleSave = (publish: boolean) => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    startSaveTransition(async () => {
      const payload = buildPayload(publish);
      const variantsPayload = variants.map(variantStateToInput);
      const mediaPayload = photos.map(photoStateToMediaInput);

      if (isEditing && product) {
        const r1 = await updateProduct(product.id, payload);
        if (!r1.ok) {
          toast.error(r1.error ?? "Erreur");
          return;
        }
        const r2 = await replaceMedia(product.id, mediaPayload);
        if (!r2.ok) {
          toast.error(r2.error ?? "Erreur lors de la sauvegarde des photos");
          return;
        }
        const r3 = await replaceVariants(product.id, variantsPayload);
        if (!r3.ok) {
          toast.error(r3.error ?? "Erreur lors de la sauvegarde des déclinaisons");
          return;
        }
        toast.success(publish ? "Produit en ligne ✓" : "Brouillon enregistré");
        setIsActive(publish);
        router.refresh();
      } else {
        const res = await createProduct(payload, variantsPayload, mediaPayload);
        if (res && !res.ok) {
          toast.error(res.error ?? "Erreur");
        }
      }
    });
  };

  const handleDelete = () => {
    if (!product) return;
    if (
      !window.confirm(
        `Supprimer définitivement « ${product.name} » ? Les photos seront aussi effacées.`,
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

  const updateVariant = <K extends keyof VariantState>(
    idx: number,
    key: K,
    value: VariantState[K],
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [key]: value } : v)),
    );
  };

  const totalStock = useMemo(
    () => variants.reduce((acc, v) => acc + (Number(v.stockQuantity) || 0), 0),
    [variants],
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <motion.div variants={staggerItem}>
        <Link
          href="/admin/produits"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux produits
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isEditing ? product?.name : "Nouveau produit"}
            </h1>
            {isEditing && (
              <p className="text-xs text-muted-light mt-0.5">
                {isActive ? "✓ En ligne" : "Brouillon (non visible)"}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isEditing && product && (
              <Link
                href={`/produit/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-border bg-white text-foreground rounded-lg text-sm hover:bg-muted-soft transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Voir la page
              </Link>
            )}
            {isEditing && (
              <button
                onClick={handleDelete}
                disabled={isDeletePending || isSavePending}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-destructive/30 text-destructive bg-destructive-soft rounded-lg text-sm font-medium hover:bg-destructive/15 transition-colors disabled:opacity-50"
              >
                {isDeletePending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Supprimer
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        <div className="space-y-4">
          {/* SECTION 1 — L'essentiel */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-5 space-y-4"
          >
            <h2 className="text-base font-semibold text-foreground">
              L&apos;essentiel
            </h2>

            <div>
              <label className={labelClass}>Nom *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Ex : Collier Fleur d'Oranger"
              />
              {name.trim() && !isEditing && (
                <p className={helpClass}>
                  Adresse de la page : /produit/<span className="font-mono">{slugify(name)}</span>
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Phrase d&apos;accroche</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className={inputClass}
                placeholder="Une phrase courte affichée sur les vignettes"
                maxLength={140}
              />
              <p className={helpClass}>{shortDescription.length}/140 caractères</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Prix de vente (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className={inputClass}
                  placeholder="89,00"
                />
              </div>
              <div>
                <label className={labelClass}>Ancien prix (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  className={inputClass}
                  placeholder="Pour afficher une promo"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Catégorie principale *</label>
              {categories.length === 0 ? (
                <p className="text-xs text-muted-light p-2 border border-dashed border-border rounded-lg">
                  Aucune catégorie. Crée-en une depuis{" "}
                  <Link href="/admin/categories" className="text-terracotta underline">
                    /admin/categories
                  </Link>
                  .
                </p>
              ) : (
                <select
                  value={primaryCategoryId ?? ""}
                  onChange={(e) => setPrimaryCategoryId(e.target.value || null)}
                  className={inputClass}
                >
                  <option value="">— Choisir —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
              <p className={helpClass}>
                C&apos;est dans cette catégorie que le produit apparaîtra en priorité (URL, fil d&apos;Ariane).
              </p>
            </div>

            {!showVariants && (
              <div>
                <label className={labelClass}>Quantité disponible</label>
                <input
                  type="number"
                  min="0"
                  value={variants[0]?.stockQuantity ?? "0"}
                  onChange={(e) => updateVariant(0, "stockQuantity", e.target.value)}
                  className={inputClass}
                />
                <p className={helpClass}>
                  Combien d&apos;exemplaires sont en stock ?
                </p>
              </div>
            )}
          </motion.div>

          {/* SECTION 2 — Photos */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-5 space-y-3"
          >
            <div>
              <h2 className="text-base font-semibold text-foreground">Photos</h2>
              <p className="text-xs text-muted-light mt-0.5">
                Ajoute plusieurs angles. La première photo sera mise en avant
                sur les vignettes.
              </p>
            </div>
            <ImageUploader
              productId={product?.id ?? null}
              value={photos}
              onChange={setPhotos}
              disabled={isSavePending}
            />
          </motion.div>

          {/* SECTION 3 — Tailles & déclinaisons */}
          <CollapsibleSection
            title="Tailles & déclinaisons"
            subtitle={
              showVariants
                ? `${variants.length} déclinaison${variants.length > 1 ? "s" : ""} · stock total ${totalStock}`
                : "Active si ce produit existe en plusieurs tailles, pierres, longueurs…"
            }
            defaultOpen={showVariants}
          >
            {!showVariants ? (
              <div className="text-center py-4">
                <Tag className="w-8 h-8 mx-auto text-muted mb-2" />
                <p className="text-sm text-muted mb-3">
                  Ce produit a une seule version. Active les déclinaisons pour
                  proposer plusieurs tailles ou pierres au choix.
                </p>
                <button
                  type="button"
                  onClick={() => setShowVariants(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-terracotta text-terracotta rounded-lg text-sm font-medium hover:bg-terracotta/5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Activer les déclinaisons
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((variant, idx) => (
                  <div
                    key={variant.uiKey}
                    className="border border-border rounded-lg p-3 space-y-3 bg-muted-soft/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted">
                        Déclinaison {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setVariants((prev) =>
                            prev.length > 1
                              ? prev.filter((_, i) => i !== idx)
                              : prev,
                          )
                        }
                        disabled={variants.length <= 1}
                        className="text-xs text-destructive hover:underline disabled:opacity-30"
                      >
                        Retirer
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-muted mb-1">
                          Taille
                        </label>
                        <input
                          type="text"
                          value={variant.size}
                          onChange={(e) =>
                            updateVariant(idx, "size", e.target.value)
                          }
                          className={inputClass}
                          placeholder="Ex : 52, M, 45 cm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1">
                          Pierre
                        </label>
                        <input
                          type="text"
                          value={variant.stone}
                          onChange={(e) =>
                            updateVariant(idx, "stone", e.target.value)
                          }
                          className={inputClass}
                          placeholder="Ex : Améthyste"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1">
                          Matière
                        </label>
                        <input
                          type="text"
                          value={variant.materialVariant}
                          onChange={(e) =>
                            updateVariant(idx, "materialVariant", e.target.value)
                          }
                          className={inputClass}
                          placeholder="Ex : Or jaune 18 carats"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-muted mb-1">
                          Quantité disponible
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.stockQuantity}
                          onChange={(e) =>
                            updateVariant(idx, "stockQuantity", e.target.value)
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1">
                          Alerte stock bas
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.lowStockThreshold}
                          onChange={(e) =>
                            updateVariant(
                              idx,
                              "lowStockThreshold",
                              e.target.value,
                            )
                          }
                          className={inputClass}
                          placeholder="3"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1">
                          Prix spécifique (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.priceOverride}
                          onChange={(e) =>
                            updateVariant(idx, "priceOverride", e.target.value)
                          }
                          className={inputClass}
                          placeholder="(prix de base par défaut)"
                        />
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={variant.isActive}
                        onChange={(e) =>
                          updateVariant(idx, "isActive", e.target.checked)
                        }
                        className="rounded accent-terracotta"
                      />
                      Disponible à la vente
                    </label>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setVariants((prev) => [...prev, emptyVariant()])
                    }
                    className="inline-flex items-center gap-1.5 text-sm text-terracotta hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une déclinaison
                  </button>
                  {variants.length === 1 && (
                    <button
                      type="button"
                      onClick={() => setShowVariants(false)}
                      className="ml-auto text-xs text-muted hover:underline"
                    >
                      Désactiver les déclinaisons
                    </button>
                  )}
                </div>
              </div>
            )}
          </CollapsibleSection>

          {/* SECTION 4 — Détails complémentaires */}
          <CollapsibleSection
            title="Description et caractéristiques"
            subtitle="Description longue, matière, dimensions, entretien — facultatif"
          >
            <div>
              <label className={labelClass}>Description complète</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className={cn(inputClass, "resize-none")}
                placeholder="Raconte l'histoire du bijou, les détails, l'inspiration…"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Matière principale</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className={inputClass}
                  placeholder="Acier inoxydable doré"
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
                  placeholder="3,2"
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
                placeholder="Ex : 40 cm + 5 cm d'extension"
              />
            </div>
            <div>
              <label className={labelClass}>Conseils d&apos;entretien</label>
              <textarea
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                rows={2}
                className={cn(inputClass, "resize-none")}
                placeholder="Éviter le contact avec l'eau, ranger dans la pochette fournie…"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={isNickelFree}
                onChange={(e) => setIsNickelFree(e.target.checked)}
                className="rounded accent-terracotta"
              />
              Sans nickel (hypoallergénique)
            </label>
          </CollapsibleSection>

          {/* SECTION 5 — Référencement Google */}
          <CollapsibleSection
            title="Référencement Google"
            subtitle="Ce qui s'affiche dans les résultats de recherche — facultatif"
          >
            <div>
              <label className={labelClass}>Titre dans Google</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className={inputClass}
                maxLength={60}
                placeholder={name ? `${name} | ISHYA` : "Laisse vide pour utiliser le nom du produit"}
              />
              <p className={helpClass}>{seoTitle.length}/60 caractères recommandés</p>
            </div>
            <div>
              <label className={labelClass}>Description dans Google</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                maxLength={160}
                className={cn(inputClass, "resize-none")}
                placeholder="Phrase qui donne envie de cliquer depuis Google"
              />
              <p className={helpClass}>{seoDescription.length}/160 caractères recommandés</p>
            </div>
          </CollapsibleSection>

          {/* SECTION 6 — Catégories supplémentaires & collections */}
          <CollapsibleSection
            title="Classement avancé"
            subtitle="Ajouter à plusieurs catégories ou collections — facultatif"
          >
            {categories.length > 0 && (
              <div>
                <label className={labelClass}>
                  Aussi dans ces catégories
                </label>
                <div className="border border-border rounded-lg p-2 max-h-40 overflow-y-auto space-y-1">
                  {categories
                    .filter((c) => c.id !== primaryCategoryId)
                    .map((c) => {
                      const checked = extraCategoryIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-muted-soft cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExtraCategoryIds((prev) => [...prev, c.id]);
                              } else {
                                setExtraCategoryIds((prev) =>
                                  prev.filter((id) => id !== c.id),
                                );
                              }
                            }}
                            className="rounded accent-terracotta"
                          />
                          <span className="flex-1 truncate">{c.name}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            )}
            {collections.length > 0 && (
              <div>
                <label className={labelClass}>Collections</label>
                <div className="border border-border rounded-lg p-2 max-h-40 overflow-y-auto space-y-1">
                  {collections.map((c) => {
                    const checked = collectionIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-muted-soft cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCollectionIds((prev) => [...prev, c.id]);
                            } else {
                              setCollectionIds((prev) =>
                                prev.filter((id) => id !== c.id),
                              );
                            }
                          }}
                          className="rounded accent-terracotta"
                        />
                        <span className="flex-1 truncate">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
                <p className={helpClass}>
                  Ex : « Saint-Valentin », « Fête des mères »…
                </p>
              </div>
            )}
          </CollapsibleSection>
        </div>

        {/* SIDEBAR — Mise en ligne */}
        <div className="space-y-4">
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-5 sticky top-4 space-y-4"
          >
            <div>
              <h3 className="font-semibold text-foreground mb-1">Mise en ligne</h3>
              <p className="text-xs text-muted-light">
                Les brouillons ne sont pas visibles par les clients.
              </p>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-muted-soft">
                <span className="text-sm font-medium text-foreground inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-terracotta" />
                  Mettre en avant
                </span>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded accent-terracotta"
                />
              </label>
              <p className="text-[11px] text-muted-light px-2 -mt-2">
                Apparaît dans la sélection « Best-sellers » de la page d&apos;accueil.
              </p>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-muted-soft">
                <span className="text-sm font-medium text-foreground">
                  Badge « Nouveauté »
                </span>
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="rounded accent-terracotta"
                />
              </label>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <button
                onClick={() => handleSave(true)}
                disabled={isSavePending || isDeletePending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg text-sm font-semibold hover:bg-terracotta-dark transition-colors disabled:opacity-50"
              >
                {isSavePending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isEditing
                  ? isActive
                    ? "Enregistrer"
                    : "Mettre en ligne"
                  : "Créer et mettre en ligne"}
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={isSavePending || isDeletePending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-border bg-white text-foreground rounded-lg text-sm font-medium hover:bg-muted-soft transition-colors disabled:opacity-50"
              >
                Garder en brouillon
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
