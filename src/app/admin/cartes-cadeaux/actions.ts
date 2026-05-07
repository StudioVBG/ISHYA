"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";
import { sendGiftCardEmail } from "@/lib/email";

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

/**
 * Renvoie l'email de la carte cadeau au destinataire (utile si le 1er
 * envoi via webhook Stripe est tombé en erreur, ou si le destinataire a
 * perdu l'email). Idempotent côté serveur : on rafraîchit `sent_at` et
 * `status` à `sent` en cas de succès.
 */
export async function resendGiftCardEmail(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data: card } = await admin
    .from("gift_cards")
    .select(
      "id, code, initial_amount, recipient_email, recipient_name, sender_name, message, status",
    )
    .eq("id", id)
    .maybeSingle();

  if (!card) return { ok: false, error: "Carte introuvable" };
  if (card.status === "cancelled") {
    return { ok: false, error: "Carte annulée — impossible de renvoyer" };
  }
  if (card.status === "redeemed") {
    return { ok: false, error: "Carte déjà utilisée" };
  }
  if (card.status === "expired") {
    return { ok: false, error: "Carte expirée" };
  }
  if (!card.recipient_email) {
    return { ok: false, error: "Pas d'email destinataire" };
  }
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: "Service email non configuré" };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ishya.fr";

  try {
    await sendGiftCardEmail(card.recipient_email, {
      recipientName: card.recipient_name,
      senderName: card.sender_name,
      amount: Number(card.initial_amount),
      code: card.code,
      message: card.message,
      shopUrl: `${baseUrl}/boutique`,
    });
  } catch (err) {
    console.error("[resendGiftCardEmail]", err);
    return { ok: false, error: "Erreur d'envoi de l'email" };
  }

  await admin
    .from("gift_cards")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .eq("id", id);

  await logAuditEvent({
    userId: auth.userId,
    action: "resend_email",
    tableName: "gift_cards",
    recordId: id,
    newData: { recipient_email: card.recipient_email },
  });

  revalidatePath("/admin/cartes-cadeaux");
  return { ok: true };
}
