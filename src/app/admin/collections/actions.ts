"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { cleanupManagedUrlsServer } from "@/lib/admin/image-upload";
import { uniqueSlug } from "@/lib/admin/slug";

export interface CollectionInput {
  name: string;
  description: string | null;
  imageUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  isActive: boolean;
}

function validate(input: CollectionInput): string | null {
  if (!input.name.trim()) return "Le nom est requis";
  return null;
}

function revalidateAll() {
  revalidatePath("/admin/collections");
  revalidatePath("/boutique");
  revalidatePath("/");
}

export async function createCollection(
  input: CollectionInput,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const slug = await uniqueSlug(admin, "collections", input.name, "collection");
  const { data, error } = await admin
    .from("collections")
    .insert({
      name: input.name.trim(),
      slug,
      description: input.description,
      image_url: input.imageUrl,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createCollection]", error);
    return { ok: false, error: "Erreur de création" };
  }
  revalidateAll();
  return { ok: true, id: data.id };
}

export async function updateCollection(
  id: string,
  input: CollectionInput,
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  // Slug figé à l'édition pour préserver les URLs déjà partagées.
  const { error } = await admin
    .from("collections")
    .update({
      name: input.name.trim(),
      description: input.description,
      image_url: input.imageUrl,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateCollection]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }
  revalidateAll();
  return { ok: true };
}

export async function deleteCollection(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("collections")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();
  const { error } = await admin.from("collections").delete().eq("id", id);
  if (error) {
    console.error("[deleteCollection]", error);
    return {
      ok: false,
      error: "Impossible de supprimer (utilisée par des produits ?)",
    };
  }
  await cleanupManagedUrlsServer(admin.storage, [existing?.image_url]);
  revalidateAll();
  return { ok: true };
}

export async function addProductToCollection(
  collectionId: string,
  productId: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  const { data: max } = await admin
    .from("product_collections")
    .select("sort_order")
    .eq("collection_id", collectionId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await admin.from("product_collections").insert({
    collection_id: collectionId,
    product_id: productId,
    sort_order: (max?.sort_order ?? -1) + 1,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ce produit est déjà dans la collection" };
    }
    console.error("[addProductToCollection]", error);
    return { ok: false, error: "Erreur lors de l'ajout" };
  }

  // Si le produit n'a pas encore de collection_id "principale", on lui assigne celle-ci
  await admin
    .from("products")
    .update({ collection_id: collectionId })
    .eq("id", productId)
    .is("collection_id", null);

  revalidatePath(`/admin/collections/${collectionId}`);
  revalidatePath("/admin/collections");
  revalidatePath(`/admin/produits/${productId}`);
  revalidatePath("/boutique");
  revalidatePath("/");
  return { ok: true };
}

export async function removeProductFromCollection(
  collectionId: string,
  productId: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("product_collections")
    .delete()
    .eq("collection_id", collectionId)
    .eq("product_id", productId);

  if (error) {
    console.error("[removeProductFromCollection]", error);
    return { ok: false, error: "Erreur" };
  }

  // Si la collection retirée était la "principale" du produit, on la dépose
  await admin
    .from("products")
    .update({ collection_id: null })
    .eq("id", productId)
    .eq("collection_id", collectionId);

  revalidatePath(`/admin/collections/${collectionId}`);
  revalidatePath("/admin/collections");
  revalidatePath(`/admin/produits/${productId}`);
  revalidatePath("/boutique");
  revalidatePath("/");
  return { ok: true };
}

export async function reorderCollectionProducts(
  collectionId: string,
  orderedProductIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  if (orderedProductIds.length === 0) return { ok: true };

  const admin = createAdminClient();
  const rows = orderedProductIds.map((productId, index) => ({
    collection_id: collectionId,
    product_id: productId,
    sort_order: index,
  }));

  const { error } = await admin
    .from("product_collections")
    .upsert(rows, { onConflict: "collection_id,product_id" });

  if (error) {
    console.error("[reorderCollectionProducts]", error);
    return { ok: false, error: "Erreur lors du réordonnancement" };
  }

  revalidatePath(`/admin/collections/${collectionId}`);
  revalidatePath("/boutique");
  return { ok: true };
}
