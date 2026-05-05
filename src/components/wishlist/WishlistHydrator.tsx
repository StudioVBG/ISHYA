"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/stores/wishlist-store";

/**
 * Hydrate le store de favoris avec les IDs récupérés côté serveur.
 * Monté une seule fois dans le layout storefront.
 */
export function WishlistHydrator({ productIds }: { productIds: string[] }) {
  const hydrate = useWishlistStore((s) => s.hydrate);
  useEffect(() => {
    hydrate(productIds);
  }, [hydrate, productIds]);
  return null;
}
