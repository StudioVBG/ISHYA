"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ReviewSubmission {
  productId: string;
  productSlug: string;
  rating: number;
  title: string | null;
  body: string | null;
}

function validate(input: ReviewSubmission): string | null {
  if (
    !Number.isInteger(input.rating) ||
    input.rating < 1 ||
    input.rating > 5
  ) {
    return "La note doit être comprise entre 1 et 5";
  }
  if (input.body && input.body.trim().length > 2000) {
    return "Avis trop long (2000 caractères max)";
  }
  if (input.title && input.title.trim().length > 120) {
    return "Titre trop long (120 caractères max)";
  }
  return null;
}

export async function submitReview(
  input: ReviewSubmission,
): Promise<{ ok: boolean; error?: string; pending?: boolean }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Connexion requise" };

  // Vérifier que l'utilisateur a bien acheté le produit
  const { data: purchases } = await supabase
    .from("orders")
    .select("id, order_items!inner ( product_id )")
    .eq("user_id", user.id)
    .in("status", ["confirmed", "processing", "shipped", "delivered"])
    .eq("order_items.product_id", input.productId)
    .limit(1);

  const isVerifiedPurchase = (purchases?.length ?? 0) > 0;
  if (!isVerifiedPurchase) {
    return {
      ok: false,
      error: "Vous devez avoir acheté ce produit pour le noter",
    };
  }

  // Empêcher le double-avis
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", input.productId)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: "Vous avez déjà laissé un avis sur ce produit" };
  }

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    product_id: input.productId,
    rating: input.rating,
    title: input.title?.trim() || null,
    body: input.body?.trim() || null,
    is_verified_purchase: isVerifiedPurchase,
    is_approved: false, // modération avant publication
  });

  if (error) {
    console.error("[submitReview]", error);
    return { ok: false, error: "Erreur lors de la soumission" };
  }

  revalidatePath(`/produit/${input.productSlug}`);
  revalidatePath("/admin/avis");
  return {
    ok: true,
    pending: true,
  };
}

export async function deleteOwnReview(
  reviewId: string,
  productSlug?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[deleteOwnReview]", error);
    return { ok: false, error: "Erreur" };
  }

  revalidatePath("/compte/avis");
  if (productSlug) revalidatePath(`/produit/${productSlug}`);
  return { ok: true };
}
