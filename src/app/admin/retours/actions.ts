"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";

export type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "shipped_back"
  | "received"
  | "inspected"
  | "refunded"
  | "exchanged"
  | "closed";

const ALLOWED_STATUSES: ReturnStatus[] = [
  "requested",
  "approved",
  "rejected",
  "shipped_back",
  "received",
  "inspected",
  "refunded",
  "exchanged",
  "closed",
];

export async function updateReturnStatus(
  id: string,
  status: string,
  refundAmount?: number | null,
): Promise<{ ok: boolean; error?: string }> {
  if (!ALLOWED_STATUSES.includes(status as ReturnStatus)) {
    return { ok: false, error: "Statut invalide" };
  }

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
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

  revalidatePath("/admin/retours");
  revalidatePath("/admin");
  return { ok: true };
}
