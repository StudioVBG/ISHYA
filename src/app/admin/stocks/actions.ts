"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";

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
  const { data: previous } = await admin
    .from("product_variants")
    .select("stock_quantity")
    .eq("id", variantId)
    .maybeSingle();

  const { error: variantError } = await admin
    .from("product_variants")
    .update({ stock_quantity: newQuantity })
    .eq("id", variantId);

  if (variantError) {
    console.error("[updateVariantStock] variants update:", variantError);
    return { ok: false, error: "Erreur de mise à jour" };
  }

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

  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "product_variants",
    recordId: variantId,
    oldData: { stock_quantity: previous?.stock_quantity ?? null },
    newData: { stock_quantity: newQuantity },
  });

  revalidatePath("/admin/stocks");
  revalidatePath("/admin");
  return { ok: true };
}
