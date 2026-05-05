"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function removeFromWishlist(
  wishlistId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("id", wishlistId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[removeFromWishlist]", error);
    return { ok: false, error: "Erreur lors de la suppression" };
  }

  revalidatePath("/compte/favoris");
  revalidatePath("/compte");
  return { ok: true };
}

/**
 * Toggle d'un favori depuis n'importe quelle ProductCard du site.
 * Renvoie isFavorite=true si le produit vient d'être ajouté, false s'il a été retiré.
 * Si l'utilisateur n'est pas connecté, renvoie needsAuth pour que le client redirige vers /connexion.
 */
export async function toggleWishlist(
  productId: string,
): Promise<
  | { ok: true; isFavorite: boolean }
  | { ok: false; needsAuth?: boolean; error?: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, needsAuth: true };

  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .is("variant_id", null)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", existing.id)
      .eq("user_id", user.id);
    if (error) {
      console.error("[toggleWishlist:remove]", error);
      return { ok: false, error: "Erreur" };
    }
    revalidatePath("/compte/favoris");
    return { ok: true, isFavorite: false };
  }

  const { error } = await supabase.from("wishlists").insert({
    user_id: user.id,
    product_id: productId,
  });
  if (error) {
    console.error("[toggleWishlist:add]", error);
    return { ok: false, error: "Erreur" };
  }
  revalidatePath("/compte/favoris");
  return { ok: true, isFavorite: true };
}
