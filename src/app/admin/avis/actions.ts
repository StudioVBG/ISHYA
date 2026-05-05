"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";

function revalidateAll(productSlug?: string | null) {
  revalidatePath("/admin/avis");
  revalidatePath("/admin");
  revalidatePath("/");
  if (productSlug) {
    revalidatePath(`/produit/${productSlug}`);
  }
}

export async function upsertReviewResponse(
  reviewId: string,
  body: string,
  productSlug?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  if (!body.trim()) return { ok: false, error: "Le message est requis" };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("review_responses")
    .select("id")
    .eq("review_id", reviewId)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("review_responses")
      .update({ body: body.trim(), user_id: auth.userId })
      .eq("id", existing.id);
    if (error) {
      console.error("[upsertReviewResponse] update", error);
      return { ok: false, error: "Erreur de mise à jour" };
    }
    await logAuditEvent({
      userId: auth.userId,
      action: "update",
      tableName: "review_responses",
      recordId: existing.id,
      newData: { review_id: reviewId },
    });
  } else {
    const { data: created, error } = await admin
      .from("review_responses")
      .insert({ review_id: reviewId, user_id: auth.userId, body: body.trim() })
      .select("id")
      .single();
    if (error) {
      console.error("[upsertReviewResponse] insert", error);
      return { ok: false, error: "Erreur de création" };
    }
    await logAuditEvent({
      userId: auth.userId,
      action: "insert",
      tableName: "review_responses",
      recordId: created?.id ?? null,
      newData: { review_id: reviewId },
    });
  }

  revalidateAll(productSlug);
  return { ok: true };
}

export async function deleteReviewResponse(
  responseId: string,
  productSlug?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("review_responses")
    .delete()
    .eq("id", responseId);

  if (error) {
    console.error("[deleteReviewResponse]", error);
    return { ok: false, error: "Erreur de suppression" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "delete",
    tableName: "review_responses",
    recordId: responseId,
  });

  revalidateAll(productSlug);
  return { ok: true };
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
  const auth = await requireAdminRole();
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
