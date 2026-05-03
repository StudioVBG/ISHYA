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
  const auth = await requireAdminRole(["admin", "super_admin"]);
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
