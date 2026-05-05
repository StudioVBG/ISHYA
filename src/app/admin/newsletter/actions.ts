"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";

export async function unsubscribeNewsletter(
  id: string,
  reason: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("newsletter_subscribers")
    .update({
      unsubscribed_at: new Date().toISOString(),
      unsubscribe_reason: reason,
    })
    .eq("id", id);

  if (error) {
    console.error("[unsubscribeNewsletter]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "newsletter_subscribers",
    recordId: id,
    newData: { unsubscribed: true, reason },
  });

  revalidatePath("/admin/newsletter");
  return { ok: true };
}

export async function resubscribeNewsletter(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("newsletter_subscribers")
    .update({ unsubscribed_at: null, unsubscribe_reason: null })
    .eq("id", id);

  if (error) {
    console.error("[resubscribeNewsletter]", error);
    return { ok: false, error: "Erreur" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "newsletter_subscribers",
    recordId: id,
    newData: { unsubscribed: false },
  });

  revalidatePath("/admin/newsletter");
  return { ok: true };
}

export async function deleteNewsletterSubscriber(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("newsletter_subscribers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteNewsletterSubscriber]", error);
    return { ok: false, error: "Erreur de suppression" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "delete",
    tableName: "newsletter_subscribers",
    recordId: id,
  });

  revalidatePath("/admin/newsletter");
  return { ok: true };
}
