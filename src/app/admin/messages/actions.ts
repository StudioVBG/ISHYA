"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";

export type ContactMessageStatus =
  | "new"
  | "read"
  | "answered"
  | "spam"
  | "archived";

const ALLOWED_STATUSES: ContactMessageStatus[] = [
  "new",
  "read",
  "answered",
  "spam",
  "archived",
];

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus,
): Promise<{ ok: boolean; error?: string }> {
  if (!ALLOWED_STATUSES.includes(status)) {
    return { ok: false, error: "Statut invalide" };
  }
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("contact_messages")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("[updateContactMessageStatus]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "status_change",
    tableName: "contact_messages",
    recordId: id,
    newData: { status },
  });

  revalidatePath("/admin/messages");
  return { ok: true };
}

export async function deleteContactMessage(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteContactMessage]", error);
    return { ok: false, error: "Erreur de suppression" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "delete",
    tableName: "contact_messages",
    recordId: id,
  });

  revalidatePath("/admin/messages");
  return { ok: true };
}
