"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ChevronLeft,
  Plus,
  Loader2,
  Package,
  Search,
  ExternalLink,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  SortableProductRow,
  type SortableProductItem,
} from "@/components/admin/SortableProductRow";
import type { AdminCollectionDetail } from "@/lib/queries/admin";
import {
  addProductToCollection,
  removeProductFromCollection,
  reorderCollectionProducts,
} from "../actions";

interface ProductSearchResult {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  imageUrl: string | null;
  basePrice: number;
  isActive: boolean;
}

const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

export function CollectionDetailView({
  collection,
}: {
  collection: AdminCollectionDetail;
}) {
  const [items, setItems] = useState<SortableProductItem[]>(collection.items);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    setItems(collection.items);
  }, [collection.items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const markPending = (id: string, on: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed.length < MIN_SEARCH_LENGTH) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const url = new URL(
          "/api/admin/products/search",
          window.location.origin,
        );
        url.searchParams.set("q", trimmed);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (Array.isArray(json.products)) {
          const existingIds = new Set(
            itemsRef.current.map((it) => it.productId),
          );
          setResults(
            (json.products as ProductSearchResult[]).filter(
              (p) => !existingIds.has(p.id),
            ),
          );
        } else {
          setResults([]);
        }
      } catch {
        toast.error("Erreur de recherche");
        setResults([]);
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = (product: ProductSearchResult) => {
    markPending(product.id, true);
    startTransition(async () => {
      const res = await addProductToCollection(collection.id, product.id);
      markPending(product.id, false);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Produit ajouté");
      setItems((prev) => [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productImageUrl: product.imageUrl,
          productSku: product.sku,
          basePrice: product.basePrice,
          isActive: product.isActive,
        },
      ]);
      setResults((prev) => prev.filter((p) => p.id !== product.id));
    });
  };

  const handleConfirmRemove = () => {
    if (!removingId) return;
    const id = removingId;
    markPending(id, true);
    startTransition(async () => {
      const res = await removeProductFromCollection(collection.id, id);
      markPending(id, false);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        setRemovingId(null);
        return;
      }
      toast.success("Produit retiré");
      setItems((prev) => prev.filter((it) => it.productId !== id));
      setRemovingId(null);
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.productId === active.id);
    const newIndex = items.findIndex((i) => i.productId === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    startTransition(async () => {
      const res = await reorderCollectionProducts(
        collection.id,
        reordered.map((it) => it.productId),
      );
      if (!res.ok) {
        toast.error(res.error ?? "Réordonnancement échoué");
        setItems(items);
      }
    });
  };

  const removingItem = items.find((it) => it.productId === removingId);

  const periodLabel = (() => {
    const parts: string[] = [];
    if (collection.startsAt) parts.push(`du ${formatDate(collection.startsAt)}`);
    if (collection.endsAt) parts.push(`au ${formatDate(collection.endsAt)}`);
    return parts.join(" ");
  })();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <Link
          href="/admin/collections"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux collections
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="relative w-24 h-24 rounded-xl bg-muted-soft overflow-hidden shrink-0 border border-border">
              {collection.imageUrl ? (
                <Image
                  src={collection.imageUrl}
                  alt={collection.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Layers className="w-8 h-8 text-muted-light" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-foreground truncate">
                {collection.name}
              </h1>
              <div className="text-sm text-muted mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs">/{collection.slug}</span>
                {periodLabel && (
                  <span className="text-xs text-muted-light">
                    {periodLabel}
                  </span>
                )}
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    collection.isActive
                      ? "bg-success-soft text-success"
                      : "bg-muted-soft text-muted",
                  )}
                >
                  {collection.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {collection.description && (
                <p className="text-sm text-muted mt-2 line-clamp-3">
                  {collection.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/collections/${collection.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted-soft transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Voir la page
            </Link>
            <Link
              href={`/admin/collections?edit=${collection.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-foreground text-white rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Modifier les infos
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">
              Produits ({items.length})
            </h2>
            <p className="text-xs text-muted-light hidden sm:block">
              Glisser-déposer pour réordonner
            </p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 mx-auto text-muted-light mb-3" />
              <p className="text-sm text-muted">
                Aucun produit dans cette collection.
              </p>
              <p className="text-xs text-muted-light mt-1">
                Recherchez un produit dans le panneau de droite pour
                commencer.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((it) => it.productId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {items.map((item) => (
                    <SortableProductRow
                      key={item.productId}
                      item={item}
                      isPending={pendingIds.has(item.productId)}
                      onRemove={(id) => setRemovingId(id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-5 h-fit xl:sticky xl:top-4"
        >
          <h3 className="font-semibold text-foreground mb-3">
            Ajouter un produit
          </h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom de produit..."
              className="w-full pl-10 pr-9 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              aria-label="Rechercher un produit"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-light" />
            )}
          </div>

          {search.trim().length < MIN_SEARCH_LENGTH ? (
            <p className="text-xs text-muted-light text-center py-6">
              Tapez au moins {MIN_SEARCH_LENGTH} caractères pour rechercher.
            </p>
          ) : !isSearching && hasSearched && results.length === 0 ? (
            <p className="text-xs text-muted-light text-center py-6">
              Aucun résultat pour <span className="font-mono">{search}</span>.
            </p>
          ) : results.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((p) => {
                const isLoading = pendingIds.has(p.id);
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2 rounded-lg border border-border/50 hover:bg-muted-soft transition-colors"
                  >
                    <div className="relative w-14 h-14 rounded-lg bg-muted-soft overflow-hidden shrink-0">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-light" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {!p.isActive && (
                          <span className="px-1.5 py-0.5 rounded bg-muted-soft text-[9px] uppercase tracking-wide font-medium text-muted">
                            Inactif
                          </span>
                        )}
                        {p.sku && (
                          <span className="text-[10px] text-muted-light font-mono truncate">
                            {p.sku}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdd(p)}
                      disabled={isLoading}
                      className="shrink-0 p-2 rounded-lg bg-terracotta/10 text-terracotta hover:bg-terracotta/20 transition-colors disabled:opacity-50"
                      aria-label={`Ajouter ${p.name} à la collection`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}
        </motion.div>
      </div>

      <ConfirmDialog
        open={removingId !== null}
        onOpenChange={(open) => {
          if (!open) setRemovingId(null);
        }}
        title="Retirer ce produit ?"
        description={
          removingItem
            ? `« ${removingItem.productName} » sera retiré de cette collection. Le produit lui-même n'est pas supprimé.`
            : undefined
        }
        confirmLabel="Retirer"
        tone="destructive"
        pending={removingId ? pendingIds.has(removingId) : false}
        onConfirm={handleConfirmRemove}
      />
    </motion.div>
  );
}
