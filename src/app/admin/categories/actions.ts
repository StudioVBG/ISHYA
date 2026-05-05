"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { slugify } from "@/lib/utils";

export interface CategoryInput {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
}

function validate(input: CategoryInput): string | null {
  if (!input.name.trim()) return "Le nom est requis";
  if (!input.slug.trim()) return "Le slug est requis";
  return null;
}

function revalidateAll() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/boutique");
}

export async function createCategory(
  input: CategoryInput,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("categories")
    .insert({
      name: input.name.trim(),
      slug: input.slug.trim() || slugify(input.name),
      description: input.description,
      image_url: input.imageUrl,
      parent_id: input.parentId,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createCategory]", error);
    return {
      ok: false,
      error:
        error?.message?.includes("duplicate")
          ? "Ce slug est déjà utilisé"
          : "Erreur de création",
    };
  }
  revalidateAll();
  return { ok: true, id: data.id };
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("categories")
    .update({
      name: input.name.trim(),
      slug: input.slug.trim(),
      description: input.description,
      image_url: input.imageUrl,
      parent_id: input.parentId,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateCategory]", error);
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

export async function deleteCategory(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) {
    console.error("[deleteCategory]", error);
    return {
      ok: false,
      error:
        "Impossible de supprimer (utilisée par des produits ?)",
    };
  }
  revalidateAll();
  return { ok: true };
}

export async function addProductToCategory(
  categoryId: string,
  productId: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  const { data: max } = await admin
    .from("product_categories")
    .select("sort_order")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await admin.from("product_categories").insert({
    category_id: categoryId,
    product_id: productId,
    sort_order: (max?.sort_order ?? -1) + 1,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ce produit est déjà dans la catégorie" };
    }
    console.error("[addProductToCategory]", error);
    return { ok: false, error: "Erreur lors de l'ajout" };
  }

  await admin
    .from("products")
    .update({ category_id: categoryId })
    .eq("id", productId)
    .is("category_id", null);

  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/produits/${productId}`);
  return { ok: true };
}

export async function removeProductFromCategory(
  categoryId: string,
  productId: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("product_categories")
    .delete()
    .eq("category_id", categoryId)
    .eq("product_id", productId);

  if (error) {
    console.error("[removeProductFromCategory]", error);
    return { ok: false, error: "Erreur" };
  }

  await admin
    .from("products")
    .update({ category_id: null })
    .eq("id", productId)
    .eq("category_id", categoryId);

  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/produits/${productId}`);
  return { ok: true };
}

export async function reorderCategoryProducts(
  categoryId: string,
  orderedProductIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  for (let i = 0; i < orderedProductIds.length; i++) {
    await admin
      .from("product_categories")
      .update({ sort_order: i })
      .eq("category_id", categoryId)
      .eq("product_id", orderedProductIds[i]);
  }
  revalidatePath(`/admin/categories/${categoryId}`);
  return { ok: true };
}
