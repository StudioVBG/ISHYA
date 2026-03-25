"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { ProductCard } from "@/components/product/ProductCard";
import { searchProducts } from "@/lib/demo-data";

export default function RecherchePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-terracotta" /></div>}>
      <RechercheContent />
    </Suspense>
  );
}

function RechercheContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    return searchProducts(query.trim());
  }, [query]);

  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container max-w-2xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-8"
          >
            <h1 className="font-display text-4xl md:text-5xl mb-4">
              Recherche
            </h1>
            <p className="text-muted">
              Trouvez le bijou parfait parmi nos créations artisanales.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un bijou, une matière, une collection..."
              className="w-full pl-12 pr-12 py-4 rounded-xl border border-border bg-white text-base focus:outline-none focus:border-terracotta transition-colors"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container">
          {query.trim().length >= 2 && (
            <p className="text-sm text-muted mb-8">
              <span className="font-medium text-foreground">
                {results.length}
              </span>{" "}
              résultat{results.length > 1 ? "s" : ""} pour &ldquo;
              <span className="text-foreground">{query}</span>&rdquo;
            </p>
          )}

          {results.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {results.map((product, index) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {query.trim().length >= 2 && results.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted mb-2">
                Aucun résultat pour &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm text-muted">
                Essayez avec d&apos;autres mots-clés : collier, bague, bracelet,
                or, résine...
              </p>
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="text-center py-20">
              <p className="text-muted">
                Entrez au moins 2 caractères pour lancer la recherche.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
