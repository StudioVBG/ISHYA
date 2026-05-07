import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistState {
  productIds: Set<string>;
  /** Synchronise le store avec l'état serveur (au mount, pour les users connectés). */
  hydrate: (ids: string[]) => void;
  /** Optimistic update : ajoute/retire localement. Renvoie l'état après toggle. */
  toggle: (productId: string) => boolean;
  has: (productId: string) => boolean;
  /** Vide complètement la wishlist locale (utilisé après merge en base au login). */
  clear: () => void;
  /** Snapshot des IDs courants (pour POST de merge au serveur). */
  getIds: () => string[];
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: new Set<string>(),
      hydrate: (ids) => {
        set({ productIds: new Set(ids) });
      },
      toggle: (productId) => {
        const next = new Set(get().productIds);
        const wasFavorite = next.has(productId);
        if (wasFavorite) next.delete(productId);
        else next.add(productId);
        set({ productIds: next });
        return !wasFavorite;
      },
      has: (productId) => get().productIds.has(productId),
      clear: () => set({ productIds: new Set() }),
      getIds: () => Array.from(get().productIds),
    }),
    {
      name: "ishya_wishlist",
      storage: createJSONStorage(() => localStorage),
      // Set n'est pas sérialisable en JSON : on stocke en array et on
      // reconstruit le Set à la réhydratation.
      partialize: (state) => ({
        productIds: Array.from(state.productIds) as unknown as Set<string>,
      }),
      merge: (persisted, current) => {
        const persistedIds = (persisted as { productIds?: string[] } | null)
          ?.productIds;
        return {
          ...current,
          productIds: new Set(Array.isArray(persistedIds) ? persistedIds : []),
        };
      },
    },
  ),
);
