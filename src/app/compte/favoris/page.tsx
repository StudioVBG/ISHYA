"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Bell, BellOff, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import {
  demoProducts,
  demoProductMedia,
} from "@/lib/demo-data";

const favoritedProductIds = [
  "prod-001",
  "prod-004",
  "prod-007",
  "prod-010",
  "prod-012",
  "prod-016",
  "prod-019",
  "prod-020",
];

function getProductImage(productId: string) {
  const media = demoProductMedia.find(
    (m) => m.product_id === productId && m.is_primary
  );
  return media?.url ?? "/placeholder.jpg";
}

export default function FavorisPage() {
  const [favorites, setFavorites] = useState(
    favoritedProductIds
      .map((id) => demoProducts.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({ ...p!, notifyRestock: false }))
  );

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleNotify = (id: string) => {
    setFavorites((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, notifyRestock: !f.notifyRestock } : f
      )
    );
  };

  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold">
            Mes favoris
          </h1>
          <p className="text-sm text-muted mt-1">
            {favorites.length} article{favorites.length > 1 ? "s" : ""}
          </p>
        </div>
      </motion.div>

      {favorites.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-center py-16"
        >
          <Heart className="w-16 h-16 text-muted-light mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-muted mb-2">
            Votre liste de favoris est vide
          </h2>
          <p className="text-sm text-muted-light mb-6">
            Parcourez notre boutique et ajoutez vos bijoux préférés
          </p>
          <Link href="/boutique" className="btn-primary text-sm">
            Découvrir la boutique
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {favorites.map((product) => (
              <motion.div
                key={product.id}
                variants={staggerItem}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white rounded-xl border border-border overflow-hidden"
              >
                {/* Image */}
                <Link
                  href={`/produit/${product.slug}`}
                  className="block relative aspect-[3/4] bg-beige-nude-light"
                >
                  <Image
                    src={getProductImage(product.id)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm text-terracotta hover:bg-white transition-colors z-10"
                    title="Retirer des favoris"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>

                  {product.compare_at_price &&
                    product.compare_at_price > product.base_price && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium bg-destructive text-white rounded-sm">
                        -
                        {Math.round(
                          ((product.compare_at_price - product.base_price) /
                            product.compare_at_price) *
                            100
                        )}
                        %
                      </span>
                    )}
                </Link>

                {/* Info */}
                <div className="p-3">
                  <Link href={`/produit/${product.slug}`}>
                    <h3 className="text-sm font-medium leading-snug group-hover:text-terracotta transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        product.compare_at_price && "text-terracotta"
                      )}
                    >
                      {formatPrice(product.base_price)}
                    </span>
                    {product.compare_at_price &&
                      product.compare_at_price > product.base_price && (
                        <span className="text-xs text-muted line-through">
                          {formatPrice(product.compare_at_price)}
                        </span>
                      )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Ajouter au panier
                    </button>
                    <button
                      onClick={() => toggleNotify(product.id)}
                      className={cn(
                        "p-2 rounded-lg border transition-colors",
                        product.notifyRestock
                          ? "border-terracotta text-terracotta bg-terracotta/5"
                          : "border-border text-muted hover:text-terracotta hover:border-terracotta/30"
                      )}
                      title={
                        product.notifyRestock
                          ? "Désactiver les alertes"
                          : "Me prévenir si en stock"
                      }
                    >
                      {product.notifyRestock ? (
                        <Bell className="w-3.5 h-3.5" />
                      ) : (
                        <BellOff className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
