"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";
import {
  RETURN_STATUSES,
  validateReturnTransition,
  type ReturnStatus,
} from "@/lib/workflows/return-status";

export type { ReturnStatus };

export async function updateReturnStatus(
  id: string,
  status: string,
  refundAmount?: number | null,
): Promise<{ ok: boolean; error?: string }> {
  if (!RETURN_STATUSES.includes(status as ReturnStatus)) {
    return { ok: false, error: "Statut invalide" };
  }

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  // Lecture du statut courant pour valider la transition + audit log
  const { data: current } = await admin
    .from("returns")
    .select("status, refund_amount")
    .eq("id", id)
    .maybeSingle();
  if (!current) return { ok: false, error: "Retour introuvable" };

  const previousStatus = current.status as string;
  const validation = validateReturnTransition(previousStatus, status);
  if (!validation.ok) return validation;

  const patch: Record<string, string | number | null> = { status };
  const now = new Date().toISOString();

  if (status === "approved") patch.approved_at = now;
  if (status === "received") patch.received_at = now;
  if (status === "refunded") {
    patch.refunded_at = now;
    if (refundAmount != null) patch.refund_amount = refundAmount;
  }

  const { error } = await admin
    .from("returns")
    .update(patch)
    .eq("id", id);

  if (error) {
    console.error("[updateReturnStatus]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "returns",
    recordId: id,
    oldData: {
      status: previousStatus,
      refund_amount: current.refund_amount ?? null,
    },
    newData: {
      status,
      refund_amount: refundAmount ?? null,
    },
  });

  revalidatePath("/admin/retours");
  revalidatePath("/admin");
  return { ok: true };
}
