"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { slugify } from "@/lib/utils";

export interface CollectionInput {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  isActive: boolean;
}

function validate(input: CollectionInput): string | null {
  if (!input.name.trim()) return "Le nom est requis";
  if (!input.slug.trim()) return "Le slug est requis";
  return null;
}

function revalidateAll() {
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
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
  const { data, error } = await admin
    .from("collections")
    .insert({
      name: input.name.trim(),
      slug: input.slug.trim() || slugify(input.name),
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
    return {
      ok: false,
      error: error?.message?.includes("duplicate")
        ? "Ce slug est déjà utilisé"
        : "Erreur de création",
    };
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
  const { error } = await admin
    .from("collections")
    .update({
      name: input.name.trim(),
      slug: input.slug.trim(),
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

export async function deleteCollection(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole(["admin", "super_admin"]);
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin.from("collections").delete().eq("id", id);
  if (error) {
    console.error("[deleteCollection]", error);
    return {
      ok: false,
      error: "Impossible de supprimer (utilisée par des produits ?)",
    };
  }
  revalidateAll();
  return { ok: true };
}
