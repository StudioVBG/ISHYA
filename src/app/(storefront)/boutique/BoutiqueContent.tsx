"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Search as SearchIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import {
  ProductCard,
  type ProductCardProduct,
} from "@/components/product/ProductCard";
import type {
  ProductBadgeFilter,
  ProductSearchFilters,
  ProductSort,
  ProductTypeFilter,
} from "@/lib/queries/storefront";

type CategoryNav = {
  id: string;
  name: string;
  slug: string;
};

type CollectionNav = {
  id: string;
  name: string;
  slug: string;
};

interface Heading {
  eyebrow: string;
  title: string;
  description: string;
}

interface BoutiqueContentProps {
  products: ProductCardProduct[];
  categories: CategoryNav[];
  collections: CollectionNav[];
  filters: ProductSearchFilters;
  heading: Heading;
}

const BADGE_OPTIONS: { value: ProductBadgeFilter; label: string }[] = [
  { value: "nouveau", label: "Nouveautés" },
  { value: "best-seller", label: "Best-sellers" },
  { value: "promo", label: "Promotions" },
  { value: "derniere-piece", label: "Dernières pièces" },
];

const TYPE_OPTIONS: { value: ProductTypeFilter; label: string }[] = [
  { value: "produit", label: "Bijoux" },
  { value: "pack", label: "Packs & parures" },
];

const PRICE_RANGES: {
  label: string;
  min?: number;
  max?: number;
}[] = [
  { label: "Moins de 30€", max: 30 },
  { label: "30€ – 60€", min: 30, max: 60 },
  { label: "60€ – 100€", min: 60, max: 100 },
  { label: "Plus de 100€", min: 100 },
];

const MATERIAL_OPTIONS = ["Or", "Argent", "Plaqué or", "Acier", "Résine"];

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "popularite", label: "Populaires" },
  { value: "nouveaute", label: "Nouveautés" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "promo", label: "Meilleures promos" },
];

function buildQueryString(
  filters: ProductSearchFilters,
  overrides: Partial<ProductSearchFilters> = {},
): string {
  const merged: ProductSearchFilters = { ...filters, ...overrides };
  const params = new URLSearchParams();
  if (merged.q) params.set("q", merged.q);
  if (merged.categories?.length)
    params.set("categorie", merged.categories.join(","));
  if (merged.collections?.length)
    params.set("collection", merged.collections.join(","));
  if (merged.badges?.length) params.set("badge", merged.badges.join(","));
  if (merged.types?.length) params.set("type", merged.types.join(","));
  if (typeof merged.min === "number") params.set("min", String(merged.min));
  if (typeof merged.max === "number") params.set("max", String(merged.max));
  if (merged.materiaux?.length)
    params.set("materiau", merged.materiaux.join(","));
  if (merged.tri) params.set("tri", merged.tri);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function priceRangeMatches(
  filters: ProductSearchFilters,
  range: { min?: number; max?: number },
): boolean {
  return filters.min === range.min && filters.max === range.max;
}

export default function BoutiqueContent({
  products,
  categories,
  collections,
  filters,
  heading,
}: BoutiqueContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.q ?? "");

  const PAGE_SIZE = 24;
  const searchParamsKey = searchParams.toString();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lastFiltersKey, setLastFiltersKey] = useState(searchParamsKey);
  // Reset pagination quand les filtres changent (pattern canonique React 19,
  // évite le useEffect-then-setState anti-pattern).
  if (lastFiltersKey !== searchParamsKey) {
    setLastFiltersKey(searchParamsKey);
    setVisibleCount(PAGE_SIZE);
  }
  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount],
  );
  const hasMore = visibleCount < products.length;

  const updateFilters = useCallback(
    (overrides: Partial<ProductSearchFilters>) => {
      const qs = buildQueryString(filters, overrides);
      startTransition(() => {
        router.push(`/boutique${qs}`, { scroll: false });
      });
    },
    [filters, router],
  );

  const toggleArrayValue = useCallback(
    <T extends string>(key: keyof ProductSearchFilters, value: T) => {
      const current = (filters[key] as T[] | undefined) ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      updateFilters({ [key]: next } as Partial<ProductSearchFilters>);
    },
    [filters, updateFilters],
  );

  const clearAll = useCallback(() => {
    setSearchInput("");
    startTransition(() => {
      router.push("/boutique", { scroll: false });
    });
  }, [router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    updateFilters({ q: trimmed || undefined });
  };

  const setPriceRange = (range: { min?: number; max?: number } | null) => {
    updateFilters({
      min: range?.min,
      max: range?.max,
    });
  };

  const setSort = (tri: ProductSort) => {
    updateFilters({ tri });
  };

  const activeChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (filters.q)
      chips.push({
        label: `« ${filters.q} »`,
        onRemove: () => {
          setSearchInput("");
          updateFilters({ q: undefined });
        },
      });
    filters.categories?.forEach((slug) => {
      const cat = categories.find((c) => c.slug === slug);
      chips.push({
        label: cat?.name ?? slug,
        onRemove: () =>
          updateFilters({
            categories: filters.categories?.filter((s) => s !== slug),
          }),
      });
    });
    filters.collections?.forEach((slug) => {
      const col = collections.find((c) => c.slug === slug);
      chips.push({
        label: col?.name ?? slug,
        onRemove: () =>
          updateFilters({
            collections: filters.collections?.filter((s) => s !== slug),
          }),
      });
    });
    filters.badges?.forEach((b) => {
      const opt = BADGE_OPTIONS.find((o) => o.value === b);
      chips.push({
        label: opt?.label ?? b,
        onRemove: () =>
          updateFilters({
            badges: filters.badges?.filter((v) => v !== b),
          }),
      });
    });
    filters.types?.forEach((t) => {
      const opt = TYPE_OPTIONS.find((o) => o.value === t);
      chips.push({
        label: opt?.label ?? t,
        onRemove: () =>
          updateFilters({
            types: filters.types?.filter((v) => v !== t),
          }),
      });
    });
    filters.materiaux?.forEach((m) => {
      chips.push({
        label: m,
        onRemove: () =>
          updateFilters({
            materiaux: filters.materiaux?.filter((v) => v !== m),
          }),
      });
    });
    if (typeof filters.min === "number" || typeof filters.max === "number") {
      const lbl =
        typeof filters.min === "number" && typeof filters.max === "number"
          ? `${filters.min}€ – ${filters.max}€`
          : typeof filters.max === "number"
            ? `≤ ${filters.max}€`
            : `≥ ${filters.min}€`;
      chips.push({
        label: lbl,
        onRemove: () => updateFilters({ min: undefined, max: undefined }),
      });
    }
    return chips;
  }, [filters, categories, collections, updateFilters]);

  const filterContent = (
    <div className="space-y-7">
      {/* Type */}
      <div>
        <h3 className="font-mono text-[10px] tracking-[0.24em] uppercase text-ink mb-4">
          Type
        </h3>
        <div className="space-y-2">
          {TYPE_OPTIONS.map((opt) => (
            <Checkbox
              key={opt.value}
              checked={filters.types?.includes(opt.value) ?? false}
              onChange={() => toggleArrayValue("types", opt.value)}
              label={opt.label}
            />
          ))}
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="font-mono text-[10px] tracking-[0.24em] uppercase text-ink mb-4">
          Mises en avant
        </h3>
        <div className="space-y-2">
          {BADGE_OPTIONS.map((opt) => (
            <Checkbox
              key={opt.value}
              checked={filters.badges?.includes(opt.value) ?? false}
              onChange={() => toggleArrayValue("badges", opt.value)}
              label={opt.label}
            />
          ))}
        </div>
      </div>

      {/* Catégories */}
      <div>
        <h3 className="font-mono text-[10px] tracking-[0.24em] uppercase text-ink mb-4">
          Catégories
        </h3>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
          {categories.map((cat) => (
            <Checkbox
              key={cat.id}
              checked={filters.categories?.includes(cat.slug) ?? false}
              onChange={() => toggleArrayValue("categories", cat.slug)}
              label={cat.name}
            />
          ))}
        </div>
      </div>

      {/* Collections */}
      {collections.length > 0 && (
        <div>
          <h3 className="font-mono text-[10px] tracking-[0.24em] uppercase text-ink mb-4">
            Collections
          </h3>
          <div className="space-y-2">
            {collections.map((col) => (
              <Checkbox
                key={col.id}
                checked={filters.collections?.includes(col.slug) ?? false}
                onChange={() => toggleArrayValue("collections", col.slug)}
                label={col.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Prix */}
      <div>
        <h3 className="font-mono text-[10px] tracking-[0.24em] uppercase text-ink mb-4">
          Prix
        </h3>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => {
            const active = priceRangeMatches(filters, range);
            return (
              <button
                key={range.label}
                type="button"
                onClick={() => setPriceRange(active ? null : range)}
                className="flex items-center gap-3 cursor-pointer group w-full text-left"
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border transition-colors flex items-center justify-center",
                    active
                      ? "border-ink"
                      : "border-border-strong group-hover:border-ink",
                  )}
                >
                  {active && (
                    <div className="w-2 h-2 rounded-full bg-ember" />
                  )}
                </div>
                <span className="text-sm text-steel group-hover:text-ink transition-colors">
                  {range.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Matière */}
      <div>
        <h3 className="font-mono text-[10px] tracking-[0.24em] uppercase text-ink mb-4">
          Matière
        </h3>
        <div className="space-y-2">
          {MATERIAL_OPTIONS.map((mat) => (
            <Checkbox
              key={mat}
              checked={filters.materiaux?.includes(mat) ?? false}
              onChange={() => toggleArrayValue("materiaux", mat)}
              label={mat}
            />
          ))}
        </div>
      </div>

      {activeChips.length > 0 && (
        <button
          onClick={clearAll}
          className="font-mono text-[11px] tracking-[0.16em] uppercase text-ember hover:text-ember-bright underline-offset-4 hover:underline"
        >
          Effacer tous les filtres
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Hero Banner — éditorial Atelier Noir */}
      <section className="bg-bone border-b border-border px-4 py-16 md:py-24">
        <div className="container">
          <motion.div
            key={searchParams.toString()}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-3 mb-6"
            >
              <span className="h-px w-10 bg-ember" aria-hidden />
              <span className="eyebrow">{heading.eyebrow}</span>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-ink mb-6"
              style={{
                fontSize: "var(--text-h1)",
                fontVariationSettings: "'opsz' 144, 'SOFT' 50, 'WONK' 0",
                fontWeight: 400,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              {heading.title}
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-steel max-w-xl leading-relaxed text-base md:text-lg"
            >
              {heading.description}
            </motion.p>

            {/* Search bar — underline minimaliste */}
            <motion.form
              variants={fadeInUp}
              onSubmit={handleSearchSubmit}
              className="relative mt-10 max-w-md"
            >
              <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-steel" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Rechercher un bijou…"
                className="w-full pl-7 pr-4 py-3 bg-transparent border-0 border-b border-ink/30 text-ink text-sm placeholder:text-steel focus:outline-none focus:border-ember transition-colors"
              />
            </motion.form>
          </motion.div>
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="container">
          <div className="flex gap-10">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-60 shrink-0">
              {filterContent}
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Active chips */}
              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-8">
                  {activeChips.map((chip, idx) => (
                    <button
                      key={`${chip.label}-${idx}`}
                      onClick={chip.onRemove}
                      className="inline-flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase text-ink border border-ink/15 hover:border-ember hover:text-ember transition-colors"
                    >
                      {chip.label}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  <button
                    onClick={clearAll}
                    className="font-mono text-[11px] tracking-[0.16em] uppercase text-steel hover:text-ember underline underline-offset-4 ml-2"
                  >
                    Tout effacer
                  </button>
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-steel flex items-center gap-2">
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    <span className="text-ink tabular-nums">
                      {String(products.length).padStart(2, "0")}
                    </span>{" "}
                    résultat{products.length > 1 ? "s" : ""}
                  </span>
                </p>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Mobile filter button */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase border border-ink/20 px-3 sm:px-4 py-2 hover:border-ember hover:text-ember transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden xs:inline">Filtres</span>
                    {activeChips.length > 0 && (
                      <span className="text-ember tabular-nums">
                        ({activeChips.length})
                      </span>
                    )}
                  </button>

                  {/* Sort dropdown */}
                  <div className="relative">
                    <select
                      value={filters.tri ?? "popularite"}
                      onChange={(e) => setSort(e.target.value as ProductSort)}
                      className="appearance-none font-mono text-[11px] tracking-[0.14em] uppercase border border-ink/20 px-3 sm:px-4 py-2 pr-8 bg-transparent hover:border-ember transition-colors cursor-pointer focus:outline-none focus:border-ember"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-steel pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Product Grid — bento dense Mytheresa style (gap-x serré, gap-y aéré) */}
              <motion.div
                key={searchParams.toString()}
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid grid-cols-2 lg:grid-cols-3 gap-x-2 sm:gap-x-3 gap-y-12 md:gap-y-16"
              >
                {visibleProducts.map((product, index) => (
                  <motion.div key={product.id} variants={staggerItem}>
                    <ProductCard product={product} index={index} />
                  </motion.div>
                ))}
              </motion.div>

              {products.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-steel mb-6">
                    Aucun bijou ne correspond à vos critères.
                  </p>
                  <button onClick={clearAll} className="btn-secondary">
                    Effacer les filtres
                  </button>
                </div>
              )}

              {products.length > 0 && (
                <div className="mt-16 flex flex-col items-center gap-4">
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-steel tabular-nums">
                    {visibleProducts.length} / {products.length}
                  </p>
                  {hasMore && (
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((c) =>
                          Math.min(c + PAGE_SIZE, products.length),
                        )
                      }
                      className="btn-secondary"
                    >
                      Charger plus
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-bone max-h-[85vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-bone pb-3 -mt-2 pt-2">
              <h2
                className="font-display text-3xl text-ink"
                style={{
                  fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'WONK' 1",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                }}
              >
                Filtres
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:text-ember transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="btn-primary w-full mt-10"
            >
              Voir les résultats ({products.length})
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className="flex items-center gap-3 cursor-pointer group w-full text-left"
    >
      <div
        className={cn(
          "w-[18px] h-[18px] border transition-colors flex items-center justify-center shrink-0",
          checked
            ? "bg-ink border-ink"
            : "border-border-strong group-hover:border-ink",
        )}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-bone" viewBox="0 0 12 12">
            <path
              d="M10 3L4.5 8.5 2 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="text-sm text-steel group-hover:text-ink transition-colors">
        {label}
      </span>
    </button>
  );
}
