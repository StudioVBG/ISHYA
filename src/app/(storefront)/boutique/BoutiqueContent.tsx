"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { ProductCard, type ProductCardProduct } from "@/components/product/ProductCard";
import Link from "next/link";

type CategoryNav = { id: string; name: string; slug: string };

interface BoutiqueContentProps {
  products: ProductCardProduct[];
  categories: CategoryNav[];
}

const MATERIALS = ["Or", "Argent", "Plaqué or", "Acier", "Résine"];
const PRICE_RANGES = [
  { label: "Moins de 30€", min: 0, max: 30 },
  { label: "30€ – 60€", min: 30, max: 60 },
  { label: "60€ – 100€", min: 60, max: 100 },
  { label: "Plus de 100€", min: 100, max: Infinity },
];
const SORT_OPTIONS = [
  { value: "popular", label: "Populaires" },
  { value: "newest", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
];

export default function BoutiqueContent({ products, categories }: BoutiqueContentProps) {
  const allProducts = products;
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popular");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (selectedMaterials.length > 0) {
      products = products.filter((p) => {
        const categoryName = p.category?.name ?? "";
        return selectedMaterials.some((mat) =>
          categoryName.toLowerCase().includes(mat.toLowerCase())
        );
      });
    }

    if (selectedPriceRange !== null) {
      const range = PRICE_RANGES[selectedPriceRange];
      products = products.filter(
        (p) => p.base_price >= range.min && p.base_price < range.max
      );
    }

    switch (sortBy) {
      case "price-asc":
        products.sort((a, b) => a.base_price - b.base_price);
        break;
      case "price-desc":
        products.sort((a, b) => b.base_price - a.base_price);
        break;
      case "newest":
        products.reverse();
        break;
    }

    return products;
  }, [allProducts, selectedMaterials, selectedPriceRange, sortBy]);

  const hasFilters = selectedMaterials.length > 0 || selectedPriceRange !== null;

  const clearFilters = () => {
    setSelectedMaterials([]);
    setSelectedPriceRange(null);
  };

  const filterContent = (
    <div className="space-y-8">
      {/* Catégories */}
      <div>
        <h3 className="font-medium text-sm uppercase tracking-wider mb-4">
          Catégories
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/boutique/${cat.slug}`}
              className="block text-sm text-muted hover:text-terracotta transition-colors py-1"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Matière */}
      <div>
        <h3 className="font-medium text-sm uppercase tracking-wider mb-4">
          Matière
        </h3>
        <div className="space-y-2">
          {MATERIALS.map((mat) => (
            <label
              key={mat}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={cn(
                  "w-4 h-4 rounded border-2 transition-colors flex items-center justify-center",
                  selectedMaterials.includes(mat)
                    ? "bg-terracotta border-terracotta"
                    : "border-border group-hover:border-terracotta-light"
                )}
              >
                {selectedMaterials.includes(mat) && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12">
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
              <span className="text-sm text-muted group-hover:text-foreground transition-colors">
                {mat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Prix */}
      <div>
        <h3 className="font-medium text-sm uppercase tracking-wider mb-4">
          Prix
        </h3>
        <div className="space-y-2">
          {PRICE_RANGES.map((range, idx) => (
            <label
              key={range.label}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center",
                  selectedPriceRange === idx
                    ? "border-terracotta"
                    : "border-border group-hover:border-terracotta-light"
                )}
              >
                {selectedPriceRange === idx && (
                  <div className="w-2 h-2 rounded-full bg-terracotta" />
                )}
              </div>
              <span className="text-sm text-muted group-hover:text-foreground transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-sm text-terracotta hover:underline"
        >
          Effacer les filtres
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Hero Banner */}
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.p
              variants={fadeInUp}
              className="text-terracotta uppercase tracking-widest text-xs mb-3"
            >
              Explorez nos créations
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl mb-4"
            >
              La Boutique
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-muted max-w-lg mx-auto"
            >
              Découvrez notre collection complète de bijoux floraux artisanaux,
              fabriqués à la main avec amour.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container">
          <div className="flex gap-12">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-60 shrink-0">
              {filterContent}
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm text-muted">
                  <span className="font-medium text-foreground">
                    {filteredProducts.length}
                  </span>{" "}
                  bijou{filteredProducts.length > 1 ? "x" : ""}
                </p>

                <div className="flex items-center gap-3">
                  {/* Mobile filter button */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-2 text-sm border border-border rounded-lg px-4 py-2 hover:border-terracotta transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filtres
                  </button>

                  {/* Sort dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none text-sm border border-border rounded-lg px-4 py-2 pr-8 bg-transparent hover:border-terracotta transition-colors cursor-pointer focus:outline-none focus:border-terracotta"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div key={product.id} variants={staggerItem}>
                    <ProductCard product={product} index={index} />
                  </motion.div>
                ))}
              </motion.div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted mb-4">
                    Aucun bijou ne correspond à vos critères.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn-secondary text-sm"
                  >
                    Effacer les filtres
                  </button>
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
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl max-h-[80vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">Filtres</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="btn-primary w-full mt-8"
            >
              Voir les résultats ({filteredProducts.length})
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
