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
