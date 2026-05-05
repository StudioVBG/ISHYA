"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";

export async function markReminderSent(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  const { data: previous } = await admin
    .from("abandoned_carts")
    .select("reminders_count")
    .eq("id", id)
    .maybeSingle();

  const nextCount = (previous?.reminders_count ?? 0) + 1;

  const { error } = await admin
    .from("abandoned_carts")
    .update({
      reminder_sent_at: new Date().toISOString(),
      reminders_count: nextCount,
    })
    .eq("id", id);

  if (error) {
    console.error("[markReminderSent]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "abandoned_carts",
    recordId: id,
    newData: { reminders_count: nextCount },
  });

  revalidatePath("/admin/paniers-abandonnes");
  return { ok: true };
}

export async function deleteAbandonedCart(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("abandoned_carts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteAbandonedCart]", error);
    return { ok: false, error: "Erreur de suppression" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "delete",
    tableName: "abandoned_carts",
    recordId: id,
  });

  revalidatePath("/admin/paniers-abandonnes");
  return { ok: true };
}
