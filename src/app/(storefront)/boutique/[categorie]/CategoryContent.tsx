"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCardProduct } from "@/components/product/ProductCard";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

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

export default function CategoryContent({
  category,
  products,
}: {
  category: Category;
  products: ProductCardProduct[];
}) {
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popular");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedPriceRange !== null) {
      const range = PRICE_RANGES[selectedPriceRange];
      result = result.filter(
        (p) => p.base_price >= range.min && p.base_price < range.max
      );
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.base_price - b.base_price);
        break;
      case "price-desc":
        result.sort((a, b) => b.base_price - a.base_price);
        break;
      case "newest":
        result.reverse();
        break;
    }

    return result;
  }, [products, selectedPriceRange, sortBy]);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="bg-beige-nude-light/30 border-b border-border px-4">
        <div className="container py-3 flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="hover:text-terracotta transition-colors">
            Accueil
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href="/boutique"
            className="hover:text-terracotta transition-colors"
          >
            Boutique
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{category.name}</span>
        </div>
      </nav>

      {/* Category Banner */}
      <section className="relative py-20 px-4 overflow-hidden bg-beige-nude-light/50">
        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl mb-4"
            >
              {category.name}
            </motion.h1>
            {category.description && (
              <motion.p variants={fadeInUp} className="text-muted leading-relaxed">
                {category.description}
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 px-4">
        <div className="container">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted">
              <span className="font-medium text-foreground">
                {filteredProducts.length}
              </span>{" "}
              bijou{filteredProducts.length > 1 ? "x" : ""}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden flex items-center gap-2 text-sm border border-border rounded-lg px-4 py-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
              </button>

              {/* Price filter desktop */}
              <div className="hidden md:flex items-center gap-2">
                {PRICE_RANGES.map((range, idx) => (
                  <button
                    key={range.label}
                    onClick={() =>
                      setSelectedPriceRange(
                        selectedPriceRange === idx ? null : idx
                      )
                    }
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full border transition-colors",
                      selectedPriceRange === idx
                        ? "border-terracotta bg-terracotta text-white"
                        : "border-border hover:border-terracotta"
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none text-sm border border-border rounded-lg px-4 py-2 pr-8 bg-transparent focus:outline-none focus:border-terracotta cursor-pointer"
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
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
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
                onClick={() => setSelectedPriceRange(null)}
                className="btn-secondary text-sm"
              >
                Effacer les filtres
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Filter Sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">Filtres</h2>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-medium text-sm uppercase tracking-wider mb-4">
              Prix
            </h3>
            <div className="space-y-2 mb-6">
              {PRICE_RANGES.map((range, idx) => (
                <label
                  key={range.label}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      selectedPriceRange === idx
                        ? "border-terracotta"
                        : "border-border"
                    )}
                    onClick={() =>
                      setSelectedPriceRange(
                        selectedPriceRange === idx ? null : idx
                      )
                    }
                  >
                    {selectedPriceRange === idx && (
                      <div className="w-2 h-2 rounded-full bg-terracotta" />
                    )}
                  </div>
                  <span className="text-sm text-muted">{range.label}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="btn-primary w-full"
            >
              Voir les résultats ({filteredProducts.length})
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
