"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminCategoryDetail } from "@/lib/queries/admin";
import {
  addProductToCategory,
  removeProductFromCategory,
  reorderCategoryProducts,
} from "../actions";

interface ProductSearchResult {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  imageUrl: string | null;
}

export function CategoryDetailView({
  category,
}: {
  category: AdminCategoryDetail;
}) {
  const [items, setItems] = useState(category.items);
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
      const res = await addProductToCategory(category.id, product.id);
      setPendingId(null);
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
          basePrice: 0,
          isActive: true,
          sortOrder: prev.length,
        },
      ]);
      setResults((prev) => prev.filter((p) => p.id !== product.id));
    });
  };

  const handleRemove = (productId: string) => {
    if (!window.confirm("Retirer ce produit de la catégorie ?")) return;
    setPendingId(productId);
    startTransition(async () => {
      const res = await removeProductFromCategory(category.id, productId);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Produit retiré");
      setItems((prev) => prev.filter((it) => it.productId !== productId));
    });
  };

  const move = (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= items.length) return;
    const reordered = [...items];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    setItems(reordered);
    startTransition(async () => {
      await reorderCategoryProducts(
        category.id,
        reordered.map((it) => it.productId),
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
          href="/admin/categories"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux catégories
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">{category.name}</h1>
            <p className="text-sm text-muted mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs">/{category.slug}</span>
              {category.parentName && (
                <span className="text-xs text-muted-light">
                  ↳ enfant de {category.parentName}
                </span>
              )}
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  category.isActive
                    ? "bg-success-soft text-success"
                    : "bg-muted-soft text-muted",
                )}
              >
                {category.isActive ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
          <Link
            href="/admin/categories"
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
              Produits ({items.length})
            </h2>
            <p className="text-xs text-muted-light">Réordonnez via les flèches</p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 mx-auto text-muted-light mb-3" />
              <p className="text-sm text-muted">
                Aucun produit dans cette catégorie.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => {
                const isLoading = isPending && pendingId === item.productId;
                return (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border"
                  >
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
                    {item.basePrice > 0 && (
                      <span className="text-xs text-muted tabular-nums">
                        {formatPrice(item.basePrice)}
                      </span>
                    )}
                    {!item.isActive && (
                      <span className="text-[10px] uppercase tracking-wide text-muted-light">
                        Inactif
                      </span>
                    )}
                    <button
                      onClick={() => handleRemove(item.productId)}
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
                      aria-label="Ajouter à la catégorie"
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

          <Link
            href={`/boutique/${category.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-terracotta hover:underline mt-4"
          >
            Voir la page publique
            <ExternalLink className="w-3 h-3" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
