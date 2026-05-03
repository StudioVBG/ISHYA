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
import type { AdminPackDetail } from "@/lib/queries/admin";
import {
  addProductToPack,
  removeProductFromPack,
  reorderPackItems,
  setPackItemRequired,
} from "../actions";

interface ProductSearchResult {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  imageUrl: string | null;
}

function discountLabel(p: AdminPackDetail): string {
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

export function PackDetailView({ pack }: { pack: AdminPackDetail }) {
  const [items, setItems] = useState(pack.items);
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

  const handleAdd = (productId: string) => {
    setPendingId(productId);
    startTransition(async () => {
      const res = await addProductToPack(pack.id, productId);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Produit ajouté");
      window.location.reload();
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
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux packs
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{pack.name}</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs">/{pack.slug}</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  pack.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-600",
                )}
              >
                {pack.isActive ? "Actif" : "Inactif"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-terracotta/10 text-terracotta">
                {discountLabel(pack)}
              </span>
            </p>
          </div>
          <Link
            href="/admin/packs"
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Modifier les infos
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Composition ({items.length} produit{items.length > 1 ? "s" : ""})
            </h2>
            <p className="text-xs text-gray-400">
              Glisser pour réordonner via les flèches
            </p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                Aucun produit dans ce pack pour l&apos;instant.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Utilisez la recherche à droite pour ajouter des produits.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => {
                const isLoading = isPending && pendingId === item.id;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => move(idx, -1)}
                        disabled={idx === 0 || isPending}
                        className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => move(idx, 1)}
                        disabled={idx === items.length - 1 || isPending}
                        className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
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
                          <Package className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/produits/${item.productId}`}
                        className="font-medium text-sm text-gray-900 hover:text-terracotta transition-colors truncate block"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-gray-400 font-mono truncate">
                        /{item.productSlug}
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
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
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={isLoading}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
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
          className="bg-white rounded-xl border border-gray-200 p-5 h-fit sticky top-4"
        >
          <h3 className="font-semibold text-gray-900 mb-3">
            Ajouter un produit
          </h3>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Nom de produit..."
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Chercher"
              )}
            </button>
          </div>

          {results.length === 0 && !isSearching && (
            <p className="text-xs text-gray-400 text-center py-6">
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
                    className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0 relative">
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
                          <Package className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{p.name}</p>
                      {p.sku && (
                        <p className="text-xs text-gray-400 font-mono">
                          {p.sku}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAdd(p.id)}
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
              href={`/produit/${pack.slug}`}
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
