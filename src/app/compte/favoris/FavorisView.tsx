"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Trash2, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { AccountWishlistItem } from "@/lib/queries/account";
import { removeFromWishlist } from "./actions";

export function FavorisView({ items }: { items: AccountWishlistItem[] }) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = (id: string) => {
    startTransition(async () => {
      const res = await removeFromWishlist(id);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Retiré des favoris");
    });
  };

  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between gap-4 mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">
          Mes favoris
        </h1>
        <span className="text-sm text-steel">
          {items.length} produit{items.length > 1 ? "s" : ""}
        </span>
      </motion.div>

      {items.length === 0 ? (
        <div className="bg-bone-soft rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-ember/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-ember-bright" />
          </div>
          <h2 className="font-display text-lg mb-2">
            Aucun favori pour le moment
          </h2>
          <p className="text-sm text-steel mb-6">
            Cliquez sur le cœur sur un produit pour l&apos;ajouter à vos favoris.
          </p>
          <Link href="/boutique" className="btn-primary inline-flex">
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={staggerItem}
              className="group bg-bone-soft rounded-xl border border-border overflow-hidden"
            >
              <Link
                href={`/produit/${item.productSlug}`}
                className="block relative aspect-square bg-bone-soft"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-10 h-10 text-steel-soft" />
                  </div>
                )}
                {!item.inStock && (
                  <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide font-medium bg-bone-soft/90 text-foreground px-2 py-1 rounded-full">
                    Épuisé
                  </span>
                )}
              </Link>
              <div className="p-3 sm:p-4">
                <Link
                  href={`/produit/${item.productSlug}`}
                  className="font-medium text-sm hover:text-ember transition-colors line-clamp-2"
                >
                  {item.productName}
                </Link>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">
                      {formatPrice(item.basePrice)}
                    </span>
                    {item.compareAtPrice && (
                      <span className="text-xs text-steel line-through">
                        {formatPrice(item.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={isPending}
                    className={cn(
                      "p-1.5 rounded-lg text-steel-soft hover:text-destructive hover:bg-destructive-soft transition-colors",
                      isPending && "opacity-50 cursor-not-allowed",
                    )}
                    aria-label="Retirer des favoris"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
