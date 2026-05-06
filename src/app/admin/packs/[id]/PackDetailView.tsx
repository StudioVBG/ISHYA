"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Loader2,
  Package,
  Search,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type {
  AdminPackDetail,
  AdminPackVariantOption,
} from "@/lib/queries/admin";
import {
  addProductToPack,
  removeProductFromPack,
  reorderPackItems,
  setPackItemRequired,
  setPackItemVariantOptions,
} from "../actions";

interface ProductSearchResult {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  imageUrl: string | null;
}

function discountLabel(p: AdminPackDetail): string | null {
  switch (p.discountType) {
    case "percentage":
      return p.discountValue > 0 ? `-${p.discountValue}%` : null;
    case "fixed_amount":
      return p.discountValue > 0 ? `-${formatPrice(p.discountValue)}` : null;
    case "free_shipping":
      return "Livraison offerte";
    case "buy_x_get_y":
      return "Offre X+Y";
  }
}

export function PackDetailView({ pack }: { pack: AdminPackDetail }) {
  const router = useRouter();
  const [items, setItems] = useState(pack.items);
  const [openVariantsItemId, setOpenVariantsItemId] = useState<string | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const url = new URL(
        "/api/admin/products/search",
        window.location.origin,
      );
      url.searchParams.set("q", search);
      const res = await fetch(url.toString());
      const json = await res.json();
      if (Array.isArray(json.products)) {
        // Filtrer les produits déjà dans le pack
        const existingIds = new Set(items.map((it) => it.productId));
        setResults(
          json.products.filter(
            (p: ProductSearchResult) => !existingIds.has(p.id),
          ),
        );
      }
    } catch {
      toast.error("Erreur de recherche");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = (product: ProductSearchResult) => {
    setPendingId(product.id);
    startTransition(async () => {
      const res = await addProductToPack(pack.id, product.id);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Produit ajouté");
      // Mise à jour optimiste locale puis refresh server pour récupérer
      // les variantes disponibles du produit (chargées côté serveur).
      setItems((prev) => [
        ...prev,
        {
          id: `temp-${product.id}`,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productImageUrl: product.imageUrl,
          sortOrder: prev.length,
          isRequired: true,
          availableVariants: [],
          variantOptions: [],
        },
      ]);
      setResults((prev) => prev.filter((p) => p.id !== product.id));
      router.refresh();
    });
  };

  const handleRemove = (packItemId: string) => {
    if (!window.confirm("Retirer ce produit du pack ?")) return;
    setPendingId(packItemId);
    startTransition(async () => {
      const res = await removeProductFromPack(pack.id, packItemId);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Produit retiré");
      setItems((prev) => prev.filter((it) => it.id !== packItemId));
    });
  };

  const handleToggleRequired = (packItemId: string, current: boolean) => {
    setPendingId(packItemId);
    startTransition(async () => {
      const res = await setPackItemRequired(pack.id, packItemId, !current);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      setItems((prev) =>
        prev.map((it) =>
          it.id === packItemId ? { ...it, isRequired: !current } : it,
        ),
      );
    });
  };

  const move = (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= items.length) return;
    const reordered = [...items];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    setItems(reordered);
    startTransition(async () => {
      await reorderPackItems(
        pack.id,
        reordered.map((it) => it.id),
      );
    });
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
          href="/admin/packs"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux packs
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">{pack.name}</h1>
            <p className="text-sm text-muted mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs">/{pack.slug}</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  pack.isActive
                    ? "bg-success-soft text-success"
                    : "bg-muted-soft text-muted",
                )}
              >
                {pack.isActive ? "Actif" : "Inactif"}
              </span>
              {discountLabel(pack) && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-terracotta/10 text-terracotta">
                  {discountLabel(pack)}
                </span>
              )}
            </p>
          </div>
          <Link
            href="/admin/packs"
            className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted-soft transition-colors"
          >
            Modifier les infos
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">
              Composition ({items.length} produit{items.length > 1 ? "s" : ""})
            </h2>
            <p className="text-xs text-muted-light">
              Glisser pour réordonner via les flèches
            </p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 mx-auto text-muted-light mb-3" />
              <p className="text-sm text-muted">
                Aucun produit dans ce pack pour l&apos;instant.
              </p>
              <p className="text-xs text-muted-light mt-1">
                Utilisez la recherche à droite pour ajouter des produits.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => {
                const isLoading = isPending && pendingId === item.id;
                const variantsOpen = openVariantsItemId === item.id;
                const hasVariants = item.availableVariants.length > 0;
                const optionCount = item.variantOptions.length;
                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => move(idx, -1)}
                          disabled={idx === 0 || isPending}
                          className="p-0.5 rounded hover:bg-muted-soft disabled:opacity-30"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => move(idx, 1)}
                          disabled={idx === items.length - 1 || isPending}
                          className="p-0.5 rounded hover:bg-muted-soft disabled:opacity-30"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-muted-soft overflow-hidden shrink-0 relative">
                        {item.productImageUrl ? (
                          <Image
                            src={item.productImageUrl}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-light" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/produits/${item.productId}`}
                          className="font-medium text-sm text-foreground hover:text-terracotta transition-colors truncate block"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs text-muted-light font-mono truncate">
                          /{item.productSlug}
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isRequired}
                          onChange={() =>
                            handleToggleRequired(item.id, item.isRequired)
                          }
                          disabled={isLoading}
                          className="rounded accent-terracotta"
                        />
                        Obligatoire
                      </label>
                      {hasVariants && (
                        <button
                          onClick={() =>
                            setOpenVariantsItemId(
                              variantsOpen ? null : item.id,
                            )
                          }
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors",
                            variantsOpen
                              ? "bg-terracotta/10 text-terracotta"
                              : "hover:bg-muted-soft text-muted",
                          )}
                          title="Configurer les variantes proposées"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                          {optionCount === 0
                            ? "Toutes"
                            : `${optionCount}/${item.availableVariants.length}`}
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={isLoading}
                        className="p-1.5 rounded-lg hover:bg-destructive-soft text-muted-light hover:text-destructive transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {hasVariants && variantsOpen && (
                      <VariantOptionsPanel
                        packId={pack.id}
                        packItemId={item.id}
                        availableVariants={item.availableVariants}
                        initialOptions={item.variantOptions}
                        onSaved={(options) => {
                          setItems((prev) =>
                            prev.map((it) =>
                              it.id === item.id
                                ? { ...it, variantOptions: options }
                                : it,
                            ),
                          );
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-5 h-fit sticky top-4"
        >
          <h3 className="font-semibold text-foreground mb-3">
            Ajouter un produit
          </h3>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Nom de produit..."
                className="w-full pl-10 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-3 py-2 bg-foreground text-white rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Chercher"
              )}
            </button>
          </div>

          {results.length === 0 && !isSearching && (
            <p className="text-xs text-muted-light text-center py-6">
              Tapez le nom d&apos;un produit puis cliquez sur Chercher.
            </p>
          )}
          {results.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((p) => {
                const isLoading = isPending && pendingId === p.id;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2 rounded-lg border border-border/50 hover:bg-muted-soft transition-colors"
                  >
                    <div className="w-10 h-10 rounded bg-muted-soft overflow-hidden shrink-0 relative">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-muted-light" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{p.name}</p>
                      {p.sku && (
                        <p className="text-xs text-muted-light font-mono">
                          {p.sku}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAdd(p)}
                      disabled={isLoading}
                      className="p-1.5 rounded-lg bg-terracotta/10 text-terracotta hover:bg-terracotta/20 transition-colors disabled:opacity-50"
                      aria-label="Ajouter au pack"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {pack.slug && (
            <Link
              href={`/pack/${pack.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-terracotta hover:underline mt-4"
            >
              Voir la page publique du pack
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

interface VariantOptionsPanelProps {
  packId: string;
  packItemId: string;
  availableVariants: AdminPackDetail["items"][number]["availableVariants"];
  initialOptions: AdminPackVariantOption[];
  onSaved: (options: AdminPackVariantOption[]) => void;
}

function VariantOptionsPanel({
  packId,
  packItemId,
  availableVariants,
  initialOptions,
  onSaved,
}: VariantOptionsPanelProps) {
  const [draft, setDraft] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const o of initialOptions) map.set(o.variantId, o.priceAdjustment);
    return map;
  });
  const [isSaving, startTransition] = useTransition();

  const toggle = (variantId: string) => {
    setDraft((prev) => {
      const next = new Map(prev);
      if (next.has(variantId)) next.delete(variantId);
      else next.set(variantId, 0);
      return next;
    });
  };

  const setAdjustment = (variantId: string, value: number) => {
    setDraft((prev) => {
      const next = new Map(prev);
      next.set(variantId, value);
      return next;
    });
  };

  const handleSave = () => {
    const options = Array.from(draft.entries()).map(
      ([variantId, priceAdjustment]) => ({ variantId, priceAdjustment }),
    );
    startTransition(async () => {
      const res = await setPackItemVariantOptions(
        packId,
        packItemId,
        options,
      );
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success(
        options.length === 0
          ? "Toutes les variantes seront proposées"
          : `${options.length} variante${options.length > 1 ? "s" : ""} configurée${options.length > 1 ? "s" : ""}`,
      );
      onSaved(options);
    });
  };

  const handleClear = () => {
    setDraft(new Map());
  };

  return (
    <div className="border-t border-border bg-muted-soft/40 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-foreground">
            Variantes proposées en boutique
          </p>
          <p className="text-xs text-muted-light mt-0.5">
            Aucune coche = toutes les variantes du produit sont proposées. Le
            réajustement (€) s&apos;ajoute au prix de base du pack pour cette
            variante uniquement.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={isSaving || draft.size === 0}
          className="text-xs text-muted hover:text-terracotta disabled:opacity-40 shrink-0"
        >
          Tout décocher
        </button>
      </div>
      <div className="space-y-1.5">
        {availableVariants.map((v) => {
          const checked = draft.has(v.id);
          const adjustment = draft.get(v.id) ?? 0;
          return (
            <div
              key={v.id}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(v.id)}
                disabled={isSaving}
                className="rounded accent-terracotta"
              />
              <div className="flex-1 min-w-0">
                <span className="text-foreground">
                  {v.name ?? v.sku ?? v.id.slice(0, 8)}
                </span>
                {v.sku && v.name && (
                  <span className="text-xs text-muted-light font-mono ml-2">
                    {v.sku}
                  </span>
                )}
                {!v.isActive && (
                  <span className="ml-2 text-xs text-muted-light italic">
                    (inactive)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-light">±</span>
                <input
                  type="number"
                  step="0.01"
                  value={adjustment}
                  onChange={(e) =>
                    setAdjustment(v.id, Number(e.target.value) || 0)
                  }
                  disabled={!checked || isSaving}
                  className="w-20 px-2 py-1 border border-border rounded text-xs text-right disabled:opacity-40 disabled:bg-muted-soft"
                />
                <span className="text-xs text-muted-light">€</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-terracotta text-white rounded-lg text-xs font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-50"
        >
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Enregistrer les variantes
        </button>
      </div>
    </div>
  );
}
