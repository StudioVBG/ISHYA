import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCronAuth } from "@/lib/auth/require-cron";
import { hasEmailBeenSent, logEmailSent } from "@/lib/email-logs";
import {
  sendAbandonedCartEmail1,
  sendAbandonedCartEmail2,
  sendAbandonedCartEmail3,
} from "@/lib/email";

export const dynamic = "force-dynamic";

const HOUR_MS = 60 * 60 * 1000;

interface ItemSnapshot {
  productId?: string;
  variantId?: string | null;
  productName?: string;
  unitPrice?: number;
  quantity?: number;
}

/**
 * Cron horaire :
 * - Pour chaque abandoned_cart non récupéré, envoie l'email correspondant
 *   selon le délai écoulé depuis abandoned_at :
 *   - >= 1h et reminders_count == 0 → AbandonedCart1
 *   - >= 24h et reminders_count == 1 → AbandonedCart2
 *   - >= 48h et reminders_count == 2 → AbandonedCart3
 * - Marque la commande comme récupérée si l'email correspond à une commande
 *   confirmée postérieure à abandoned_at.
 */
export async function GET(request: NextRequest) {
  const auth = requireCronAuth(request);
  if (!auth.ok) {
    return Response.json({ error: auth.message }, { status: auth.status });
  }

  const admin = createAdminClient();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ishya.fr";

  const { data: rows, error } = await admin
    .from("abandoned_carts")
    .select("id, email, cart_id, items_snapshot, abandoned_at, reminders_count")
    .eq("recovered", false)
    .not("email", "is", null)
    .order("abandoned_at", { ascending: true })
    .limit(200);

  if (error) {
    console.error("[cron/abandoned-carts]", error);
    return Response.json({ error: "DB error" }, { status: 500 });
  }

  const now = Date.now();
  let sent1 = 0;
  let sent2 = 0;
  let sent3 = 0;
  let recovered = 0;

  for (const row of rows ?? []) {
    if (!row.email || !row.abandoned_at) continue;
    const abandonedAt = new Date(row.abandoned_at).getTime();
    const ageMs = now - abandonedAt;

    // Vérifier si une commande a été passée depuis (récupération)
    const { data: laterOrder } = await admin
      .from("orders")
      .select("id")
      .eq("email", row.email)
      .gte("created_at", row.abandoned_at)
      .in("status", ["confirmed", "processing", "shipped", "delivered"])
      .limit(1)
      .maybeSingle();

    if (laterOrder) {
      await admin
        .from("abandoned_carts")
        .update({ recovered: true, recovered_order_id: laterOrder.id })
        .eq("id", row.id);
      recovered++;
      continue;
    }

    const items = (row.items_snapshot ?? []) as ItemSnapshot[];
    const products = items.map((it) => ({
      name: it.productName ?? "Produit",
      imageUrl: "",
      productUrl: `${baseUrl}/panier`,
      price: Number(it.unitPrice ?? 0),
    }));

    const remindersCount = row.reminders_count ?? 0;

    const tryStep = async (
      step: 1 | 2 | 3,
      send: () => Promise<unknown>,
    ): Promise<boolean> => {
      const dedupKey = `${row.id}:${step}`;
      if (await hasEmailBeenSent(`abandoned_cart_${step}`, dedupKey)) {
        return false;
      }
      await send();
      await logEmailSent({
        email: row.email!,
        emailType: `abandoned_cart_${step}`,
        dedupKey,
        metadata: { cart_id: row.cart_id },
      });
      await admin
        .from("abandoned_carts")
        .update({
          reminders_count: step,
          reminder_sent_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      return true;
    };

    try {
      if (remindersCount === 0 && ageMs >= 1 * HOUR_MS) {
        if (
          await tryStep(1, () =>
            sendAbandonedCartEmail1(row.email!, {
              products,
              cartUrl: `${baseUrl}/panier`,
            }),
          )
        )
          sent1++;
      } else if (remindersCount === 1 && ageMs >= 24 * HOUR_MS) {
        if (
          await tryStep(2, () =>
            sendAbandonedCartEmail2(row.email!, {
              products,
              checkoutUrl: `${baseUrl}/checkout/identification`,
            }),
          )
        )
          sent2++;
      } else if (remindersCount === 2 && ageMs >= 48 * HOUR_MS) {
        if (
          await tryStep(3, () =>
            sendAbandonedCartEmail3(row.email!, {
              products,
              promoUrl: `${baseUrl}/panier?promo=COMEBACK10`,
            }),
          )
        )
          sent3++;
      }
    } catch (e) {
      console.error("[cron/abandoned-carts] email error:", e);
    }
  }

  return Response.json({
    ok: true,
    processed: rows?.length ?? 0,
    recovered,
    sent: { reminder1: sent1, reminder2: sent2, reminder3: sent3 },
  });
}
