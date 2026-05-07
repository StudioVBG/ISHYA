import { useWishlistStore } from "@/stores/wishlist-store";

/**
 * À appeler côté client juste après une connexion / inscription réussie,
 * avant la redirection finale.
 *
 * Lit la wishlist persistée en localStorage, l'envoie à /api/wishlist/merge
 * pour qu'elle soit insérée dans la table `wishlists` du nouvel utilisateur,
 * puis vide le store local. Le layout storefront re-fetch alors les IDs
 * depuis la base au prochain rendu et les hydrate via WishlistHydrator.
 *
 * Non-bloquant : toute erreur réseau est loggée et avalée.
 */
export async function mergeWishlistOnLogin(): Promise<void> {
  const ids = useWishlistStore.getState().getIds();
  if (ids.length === 0) return;

  try {
    const res = await fetch("/api/wishlist/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: ids }),
    });
    if (res.ok) {
      // L'API a fait foi — on vide le store local. Les IDs reviendront
      // depuis la base via WishlistHydrator au prochain rendu.
      useWishlistStore.getState().clear();
    }
  } catch (err) {
    console.warn("[mergeWishlistOnLogin] failed:", err);
  }
}
