"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/stores/wishlist-store";

/**
 * Hydrate le store de favoris avec les IDs récupérés côté serveur.
 * Monté une seule fois dans le layout storefront.
 *
 * - Authentifié : la base fait foi → on écrase le store local avec les
 *   IDs serveur (le merge localStorage→DB a déjà été fait au moment du
 *   login, voir /api/wishlist/merge).
 * - Anonyme : on laisse zustand-persist réhydrater depuis localStorage,
 *   on ne touche surtout pas au store côté layout.
 */
export function WishlistHydrator({
  productIds,
  isAuthenticated,
}: {
  productIds: string[];
  isAuthenticated: boolean;
}) {
  const hydrate = useWishlistStore((s) => s.hydrate);
  useEffect(() => {
    if (!isAuthenticated) return;
    hydrate(productIds);
  }, [hydrate, productIds, isAuthenticated]);
  return null;
}
