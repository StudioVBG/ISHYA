"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";

export async function updateVariantStock(
  variantId: string,
  newQuantity: number,
): Promise<{ ok: boolean; error?: string }> {
  if (!Number.isFinite(newQuantity) || newQuantity < 0) {
    return { ok: false, error: "Quantité invalide" };
  }

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error: variantError } = await admin
    .from("product_variants")
    .update({ stock_quantity: newQuantity })
    .eq("id", variantId);

  if (variantError) {
    console.error("[updateVariantStock] variants update:", variantError);
    return { ok: false, error: "Erreur de mise à jour" };
  }

  // Synchroniser inventory si présent
  const { data: inv } = await admin
    .from("inventory")
    .select("id")
    .eq("variant_id", variantId)
    .maybeSingle();

  if (inv) {
    await admin
      .from("inventory")
      .update({ quantity: newQuantity })
      .eq("id", inv.id);
  }

  revalidatePath("/admin/stocks");
  revalidatePath("/admin");
  return { ok: true };
}
