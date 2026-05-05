"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";

export interface PromotionInput {
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y";
  discountValue: number;
  minimumOrderAmount: number | null;
  maximumDiscount: number | null;
  perUserLimit: number | null;
  usageLimit: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

function validate(input: PromotionInput): string | null {
  if (!input.code.trim()) return "Le code est requis";
  if (!Number.isFinite(input.discountValue) || input.discountValue < 0)
    return "La valeur doit être positive";
  if (
    input.discountType === "percentage" &&
    input.discountValue > 100
  )
    return "Le pourcentage ne peut excéder 100";
  return null;
}

function revalidateAll() {
  revalidatePath("/admin/promotions");
}

export async function createPromotion(
  input: PromotionInput,
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin.from("discount_codes").insert({
    code: input.code.trim().toUpperCase(),
    description: input.description,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    minimum_order_amount: input.minimumOrderAmount,
    maximum_discount: input.maximumDiscount,
    per_user_limit: input.perUserLimit,
    usage_limit: input.usageLimit,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    is_active: input.isActive,
  });

  if (error) {
    console.error("[createPromotion]", error);
    return {
      ok: false,
      error: error.message?.includes("duplicate")
        ? "Ce code est déjà utilisé"
        : "Erreur de création",
    };
  }
  revalidateAll();
  return { ok: true };
}

export async function updatePromotion(
  id: string,
  input: PromotionInput,
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("discount_codes")
    .update({
      code: input.code.trim().toUpperCase(),
      description: input.description,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      minimum_order_amount: input.minimumOrderAmount,
      maximum_discount: input.maximumDiscount,
      per_user_limit: input.perUserLimit,
      usage_limit: input.usageLimit,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      is_active: input.isActive,
    })
    .eq("id", id);

  if (error) {
    console.error("[updatePromotion]", error);
    return {
      ok: false,
      error: error.message?.includes("duplicate")
        ? "Ce code est déjà utilisé"
        : "Erreur de mise à jour",
    };
  }
  revalidateAll();
  return { ok: true };
}

export async function deletePromotion(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin.from("discount_codes").delete().eq("id", id);
  if (error) {
    console.error("[deletePromotion]", error);
    return { ok: false, error: "Erreur de suppression" };
  }
  revalidateAll();
  return { ok: true };
}
