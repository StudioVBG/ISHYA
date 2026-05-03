"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";

function revalidateAll(productSlug?: string | null) {
  revalidatePath("/admin/avis");
  revalidatePath("/admin");
  revalidatePath("/");
  if (productSlug) {
    revalidatePath(`/produit/${productSlug}`);
  }
}

export async function approveReview(
  id: string,
  productSlug?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("reviews")
    .update({ is_approved: true, approved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    console.error("[approveReview]", error);
    return { ok: false, error: "Erreur" };
  }
  revalidateAll(productSlug);
  return { ok: true };
}

export async function rejectReview(
  id: string,
  productSlug?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("reviews")
    .update({ is_approved: false, approved_at: null })
    .eq("id", id);
  if (error) {
    console.error("[rejectReview]", error);
    return { ok: false, error: "Erreur" };
  }
  revalidateAll(productSlug);
  return { ok: true };
}

export async function deleteReview(
  id: string,
  productSlug?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole(["admin", "super_admin"]);
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin.from("reviews").delete().eq("id", id);
  if (error) {
    console.error("[deleteReview]", error);
    return { ok: false, error: "Erreur" };
  }
  revalidateAll(productSlug);
  return { ok: true };
}
