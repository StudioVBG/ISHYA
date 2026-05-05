"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";

export type GiftCardStatus =
  | "pending"
  | "paid"
  | "sent"
  | "redeemed"
  | "expired"
  | "cancelled";

const ALLOWED_STATUSES: GiftCardStatus[] = [
  "pending",
  "paid",
  "sent",
  "redeemed",
  "expired",
  "cancelled",
];

export async function updateGiftCardStatus(
  id: string,
  status: GiftCardStatus,
): Promise<{ ok: boolean; error?: string }> {
  if (!ALLOWED_STATUSES.includes(status)) {
    return { ok: false, error: "Statut invalide" };
  }
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const patch: { status: GiftCardStatus; sent_at?: string; paid_at?: string } = {
    status,
  };
  if (status === "sent") patch.sent_at = new Date().toISOString();
  if (status === "paid") patch.paid_at = new Date().toISOString();

  const { error } = await admin.from("gift_cards").update(patch).eq("id", id);

  if (error) {
    console.error("[updateGiftCardStatus]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "status_change",
    tableName: "gift_cards",
    recordId: id,
    newData: { status },
  });

  revalidatePath("/admin/cartes-cadeaux");
  return { ok: true };
}
