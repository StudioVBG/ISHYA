"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const addressSchema = z.object({
  label: z.string().trim().max(40).nullable(),
  firstName: z
    .string()
    .trim()
    .min(2, "Prénom requis (2 caractères min.)")
    .max(80),
  lastName: z
    .string()
    .trim()
    .min(2, "Nom requis (2 caractères min.)")
    .max(80),
  addressLine1: z
    .string()
    .trim()
    .min(5, "Adresse requise (5 caractères min.)")
    .max(200),
  addressLine2: z.string().trim().max(200).nullable(),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4,5}$/, "Code postal invalide"),
  city: z.string().trim().min(2, "Ville requise").max(100),
  country: z.string().trim().min(2, "Pays requis").max(80),
  phone: z.string().trim().max(30).nullable(),
  type: z.enum(["shipping", "billing"]),
  isDefault: z.boolean(),
});

export type AddressInput = z.infer<typeof addressSchema>;

function validate(input: AddressInput): string | null {
  const parsed = addressSchema.safeParse(input);
  if (parsed.success) return null;
  return parsed.error.issues[0]?.message ?? "Données invalides";
}

async function ensureAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Non authentifié" };
  return { ok: true as const, supabase, userId: user.id };
}

export async function createAddress(
  input: AddressInput,
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await ensureAuth();
  if (!auth.ok) return auth;

  // Si on définit comme défaut, on désactive les autres défauts du même type
  if (input.isDefault) {
    await auth.supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", auth.userId)
      .eq("type", input.type);
  }

  const { error } = await auth.supabase.from("addresses").insert({
    user_id: auth.userId,
    label: input.label?.trim() || null,
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    address_line1: input.addressLine1.trim(),
    address_line2: input.addressLine2?.trim() || null,
    postal_code: input.postalCode.trim(),
    city: input.city.trim(),
    country: input.country.trim(),
    phone: input.phone?.trim() || null,
    type: input.type,
    is_default: input.isDefault,
  });

  if (error) {
    console.error("[createAddress]", error);
    return { ok: false, error: "Erreur lors de la création" };
  }

  revalidatePath("/compte/adresses");
  return { ok: true };
}

export async function updateAddress(
  id: string,
  input: AddressInput,
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await ensureAuth();
  if (!auth.ok) return auth;

  if (input.isDefault) {
    await auth.supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", auth.userId)
      .eq("type", input.type)
      .neq("id", id);
  }

  const { error } = await auth.supabase
    .from("addresses")
    .update({
      label: input.label?.trim() || null,
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      address_line1: input.addressLine1.trim(),
      address_line2: input.addressLine2?.trim() || null,
      postal_code: input.postalCode.trim(),
      city: input.city.trim(),
      country: input.country.trim(),
      phone: input.phone?.trim() || null,
      type: input.type,
      is_default: input.isDefault,
    })
    .eq("id", id)
    .eq("user_id", auth.userId);

  if (error) {
    console.error("[updateAddress]", error);
    return { ok: false, error: "Erreur lors de la mise à jour" };
  }

  revalidatePath("/compte/adresses");
  return { ok: true };
}

export async function deleteAddress(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await ensureAuth();
  if (!auth.ok) return auth;

  const { error } = await auth.supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.userId);

  if (error) {
    console.error("[deleteAddress]", error);
    return { ok: false, error: "Erreur lors de la suppression" };
  }

  revalidatePath("/compte/adresses");
  return { ok: true };
}

export async function setDefaultAddress(
  id: string,
  type: "shipping" | "billing",
): Promise<{ ok: boolean; error?: string }> {
  const auth = await ensureAuth();
  if (!auth.ok) return auth;

  await auth.supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", auth.userId)
    .eq("type", type);

  const { error } = await auth.supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", auth.userId);

  if (error) {
    console.error("[setDefaultAddress]", error);
    return { ok: false, error: "Erreur" };
  }

  revalidatePath("/compte/adresses");
  return { ok: true };
}
