"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateVariantStock(
  variantId: string,
  newQuantity: number,
): Promise<{ ok: boolean; error?: string }> {
  if (!Number.isFinite(newQuantity) || newQuantity < 0) {
    return { ok: false, error: "Quantité invalide" };
  }

  // Vérifier que l'utilisateur est admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role;
  if (!role || !["admin", "super_admin", "editor"].includes(role)) {
    return { ok: false, error: "Permissions insuffisantes" };
  }

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
