"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";
import { hasEmailBeenSent, logEmailSent } from "@/lib/email-logs";
import {
  sendAbandonedCartEmail1,
  sendAbandonedCartEmail2,
  sendAbandonedCartEmail3,
} from "@/lib/email";

interface ItemSnapshot {
  productName?: string;
  unitPrice?: number;
}

// Code promo envoyé au palier 3. Configurable via env pour permettre des
// campagnes saisonnières sans déploiement (NOEL15, RENTREE10, etc.).
const COMEBACK_PROMO_CODE =
  process.env.ABANDONED_CART_PROMO_CODE?.trim() || "COMEBACK10";

export async function sendReminderEmail(
  id: string,
): Promise<{ ok: boolean; error?: string; step?: number }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  const { data: cart, error: fetchErr } = await admin
    .from("abandoned_carts")
    .select("id, cart_id, email, items_snapshot, reminders_count, recovered")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !cart) {
    return { ok: false, error: "Panier introuvable" };
  }
  if (!cart.email) return { ok: false, error: "Pas d'email pour ce panier" };
  if (cart.recovered)
    return { ok: false, error: "Panier déjà récupéré" };

  const currentCount = cart.reminders_count ?? 0;
  if (currentCount >= 3) {
    return { ok: false, error: "Les 3 relances ont déjà été envoyées" };
  }

  const step = (currentCount + 1) as 1 | 2 | 3;
  const dedupKey = `${cart.id}:${step}`;
  if (await hasEmailBeenSent(`abandoned_cart_${step}`, dedupKey)) {
    return { ok: false, error: "Email déjà envoyé pour ce palier" };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ishya.fr";
  const items = (cart.items_snapshot ?? []) as ItemSnapshot[];
  const products = items.map((it) => ({
    name: it.productName ?? "Produit",
    imageUrl: "",
    productUrl: `${baseUrl}/panier`,
    price: Number(it.unitPrice ?? 0),
  }));

  // Pour le palier 3, on envoie un code promo. On vérifie qu'il existe et
  // est actif dans `discount_codes` AVANT d'envoyer (sinon le client cliquera
  // sur un lien mort, mauvaise UX).
  if (step === 3) {
    const { data: promo } = await admin
      .from("discount_codes")
      .select("id, is_active")
      .eq("code", COMEBACK_PROMO_CODE)
      .maybeSingle();
    if (!promo || !promo.is_active) {
      return {
        ok: false,
        error: `Code promo « ${COMEBACK_PROMO_CODE} » introuvable ou inactif. Créez-le dans /admin/promotions ou définissez ABANDONED_CART_PROMO_CODE.`,
      };
    }
  }

  try {
    if (step === 1) {
      await sendAbandonedCartEmail1(cart.email, {
        products,
        cartUrl: `${baseUrl}/panier`,
      });
    } else if (step === 2) {
      await sendAbandonedCartEmail2(cart.email, {
        products,
        checkoutUrl: `${baseUrl}/checkout/identification`,
      });
    } else {
      await sendAbandonedCartEmail3(cart.email, {
        products,
        promoUrl: `${baseUrl}/panier?promo=${encodeURIComponent(COMEBACK_PROMO_CODE)}`,
      });
    }
  } catch (e) {
    console.error("[sendReminderEmail] email error:", e);
    return { ok: false, error: "Erreur d'envoi de l'email" };
  }

  await logEmailSent({
    email: cart.email,
    emailType: `abandoned_cart_${step}`,
    dedupKey,
    metadata: { cart_id: cart.cart_id, manual: true, sent_by: auth.userId },
  });

  await admin
    .from("abandoned_carts")
    .update({
      reminders_count: step,
      reminder_sent_at: new Date().toISOString(),
    })
    .eq("id", id);

  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "abandoned_carts",
    recordId: id,
    newData: { reminders_count: step, manual_email: true },
  });

  revalidatePath("/admin/paniers-abandonnes");
  return { ok: true, step };
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
