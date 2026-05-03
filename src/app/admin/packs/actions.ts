"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { slugify } from "@/lib/utils";

export type PackDiscountType =
  | "percentage"
  | "fixed_amount"
  | "free_shipping"
  | "buy_x_get_y";

export interface PackInput {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  discountType: PackDiscountType;
  discountValue: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

function validate(input: PackInput): string | null {
  if (!input.name.trim()) return "Le nom est requis";
  if (!input.slug.trim()) return "Le slug est requis";
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
  revalidatePath("/admin/packs");
  revalidatePath("/boutique");
}

export async function createPack(
  input: PackInput,
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin.from("packs").insert({
    name: input.name.trim(),
    slug: input.slug.trim() || slugify(input.name),
    description: input.description,
    image_url: input.imageUrl,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    is_active: input.isActive,
  });

  if (error) {
    console.error("[createPack]", error);
    return {
      ok: false,
      error: error.message?.includes("duplicate")
        ? "Ce slug est déjà utilisé"
        : "Erreur de création",
    };
  }
  revalidateAll();
  return { ok: true };
}

export async function updatePack(
  id: string,
  input: PackInput,
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("packs")
    .update({
      name: input.name.trim(),
      slug: input.slug.trim(),
      description: input.description,
      image_url: input.imageUrl,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      is_active: input.isActive,
    })
    .eq("id", id);

  if (error) {
    console.error("[updatePack]", error);
    return {
      ok: false,
      error: error.message?.includes("duplicate")
        ? "Ce slug est déjà utilisé"
        : "Erreur de mise à jour",
    };
  }
  revalidateAll();
  return { ok: true };
}

export async function deletePack(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole(["admin", "super_admin"]);
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin.from("packs").delete().eq("id", id);
  if (error) {
    console.error("[deletePack]", error);
    return { ok: false, error: "Erreur de suppression" };
  }
  revalidateAll();
  return { ok: true };
}
