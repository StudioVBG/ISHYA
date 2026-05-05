import { create } from "zustand";

interface WishlistState {
  productIds: Set<string>;
  /** Synchronise le store avec l'état serveur (au mount du layout). */
  hydrate: (ids: string[]) => void;
  /** Optimistic update : ajoute/retire localement en attendant la réponse serveur. */
  toggle: (productId: string) => boolean;
  has: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: new Set<string>(),
  hydrate: (ids) => {
    set({ productIds: new Set(ids) });
  },
  toggle: (productId) => {
    const next = new Set(get().productIds);
    const wasFavorite = next.has(productId);
    if (wasFavorite) {
      next.delete(productId);
    } else {
      next.add(productId);
    }
    set({ productIds: next });
    return !wasFavorite;
  },
  has: (productId) => get().productIds.has(productId),
}));
