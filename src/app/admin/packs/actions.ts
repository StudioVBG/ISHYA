"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { cleanupManagedUrlsServer } from "@/lib/admin/image-upload";
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
  if (input.startsAt && input.endsAt) {
    const start = Date.parse(input.startsAt);
    const end = Date.parse(input.endsAt);
    if (Number.isFinite(start) && Number.isFinite(end) && end <= start) {
      return "La date de fin doit être postérieure à la date de début";
    }
  }
  return null;
}

function revalidateAll() {
  revalidatePath("/admin/packs");
  revalidatePath("/boutique");
  revalidatePath("/pack/[slug]", "page");
}

async function revalidatePackBySlug(packId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("packs")
    .select("slug")
    .eq("id", packId)
    .maybeSingle();
  if (data?.slug) revalidatePath(`/pack/${data.slug}`);
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
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  // Récupère l'URL d'image avant le delete pour cleanup Storage post-DELETE.
  const { data: existing } = await admin
    .from("packs")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();
  const { error } = await admin.from("packs").delete().eq("id", id);
  if (error) {
    console.error("[deletePack]", error);
    return { ok: false, error: "Erreur de suppression" };
  }
  await cleanupManagedUrlsServer(admin.storage, [existing?.image_url]);
  revalidateAll();
  return { ok: true };
}

export async function addProductToPack(
  packId: string,
  productId: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  const { data: max } = await admin
    .from("pack_items")
    .select("sort_order")
    .eq("pack_id", packId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await admin.from("pack_items").insert({
    pack_id: packId,
    product_id: productId,
    sort_order: (max?.sort_order ?? -1) + 1,
    is_required: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ce produit est déjà dans le pack" };
    }
    console.error("[addProductToPack]", error);
    return { ok: false, error: "Erreur lors de l'ajout" };
  }

  revalidatePath(`/admin/packs/${packId}`);
  revalidatePath("/admin/packs");
  await revalidatePackBySlug(packId);
  return { ok: true };
}

export async function removeProductFromPack(
  packId: string,
  packItemId: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("pack_items")
    .delete()
    .eq("id", packItemId)
    .eq("pack_id", packId);

  if (error) {
    console.error("[removeProductFromPack]", error);
    return { ok: false, error: "Erreur" };
  }

  revalidatePath(`/admin/packs/${packId}`);
  revalidatePath("/admin/packs");
  await revalidatePackBySlug(packId);
  return { ok: true };
}

export async function setPackItemRequired(
  packId: string,
  packItemId: string,
  isRequired: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("pack_items")
    .update({ is_required: isRequired })
    .eq("id", packItemId)
    .eq("pack_id", packId);

  if (error) {
    console.error("[setPackItemRequired]", error);
    return { ok: false, error: "Erreur" };
  }

  revalidatePath(`/admin/packs/${packId}`);
  await revalidatePackBySlug(packId);
  return { ok: true };
}

export interface PackItemVariantOptionInput {
  variantId: string;
  priceAdjustment: number;
}

export async function setPackItemVariantOptions(
  packId: string,
  packItemId: string,
  options: PackItemVariantOptionInput[],
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  // Vérifie l'appartenance pack_item ↔ pack pour éviter qu'un appel forge
  // un packItemId qui n'est pas dans ce pack.
  const { data: ownership } = await admin
    .from("pack_items")
    .select("id")
    .eq("id", packItemId)
    .eq("pack_id", packId)
    .maybeSingle();
  if (!ownership) {
    return { ok: false, error: "Élément introuvable dans ce pack" };
  }

  // Stratégie : remplacement complet (delete-then-insert). Le volume est
  // au plus quelques dizaines d'options par item, donc pas un risque.
  const { error: delError } = await admin
    .from("pack_variant_options")
    .delete()
    .eq("pack_item_id", packItemId);
  if (delError) {
    console.error("[setPackItemVariantOptions] delete:", delError);
    return { ok: false, error: "Erreur" };
  }

  if (options.length > 0) {
    const rows = options.map((o) => ({
      pack_item_id: packItemId,
      variant_id: o.variantId,
      price_adjustment: Number.isFinite(o.priceAdjustment)
        ? o.priceAdjustment
        : 0,
    }));
    const { error: insError } = await admin
      .from("pack_variant_options")
      .insert(rows);
    if (insError) {
      console.error("[setPackItemVariantOptions] insert:", insError);
      return { ok: false, error: "Erreur d'enregistrement" };
    }
  }

  revalidatePath(`/admin/packs/${packId}`);
  await revalidatePackBySlug(packId);
  return { ok: true };
}

export async function reorderPackItems(
  packId: string,
  orderedIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  const results = await Promise.all(
    orderedIds.map((id, i) =>
      admin
        .from("pack_items")
        .update({ sort_order: i })
        .eq("id", id)
        .eq("pack_id", packId),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    console.error("[reorderPackItems]", failed.error);
    return { ok: false, error: "Erreur de réordonnancement" };
  }

  revalidatePath(`/admin/packs/${packId}`);
  await revalidatePackBySlug(packId);
  return { ok: true };
}
