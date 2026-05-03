"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AddressInput {
  label: string | null;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string;
  city: string;
  country: string;
  phone: string | null;
  type: "shipping" | "billing";
  isDefault: boolean;
}

function validate(input: AddressInput): string | null {
  if (!input.firstName.trim() || input.firstName.trim().length < 2)
    return "Prénom requis";
  if (!input.lastName.trim() || input.lastName.trim().length < 2)
    return "Nom requis";
  if (input.addressLine1.trim().length < 5) return "Adresse requise";
  if (!/^\d{4,5}$/.test(input.postalCode.trim())) return "Code postal invalide";
  if (input.city.trim().length < 2) return "Ville requise";
  if (input.country.trim().length < 2) return "Pays requis";
  return null;
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
