import { NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmation } from "@/lib/email";
import { formatDate } from "@/lib/utils";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Stripe attend le body brut pour vérifier la signature
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    return Response.json({ error: "Stripe non configuré" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature invalide";
    console.error("[stripe webhook] Erreur vérification:", message);
    return Response.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        // Évènements non gérés ignorés silencieusement
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("[stripe webhook] Erreur traitement:", error);
    return Response.json({ error: "Erreur traitement webhook" }, { status: 500 });
  }
}

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent) {
  const admin = createAdminClient();

  // 1. Trouver la commande via metadata ou via le payment_intent_id
  const orderId = pi.metadata?.order_id;
  if (!orderId) {
    console.error("[stripe webhook] payment_intent sans order_id metadata:", pi.id);
    return;
  }

  // 2. Vérifier idempotence : ne rien faire si déjà payée
  const { data: existing } = await admin
    .from("orders")
    .select("id, status, email, order_number, grand_total, subtotal, shipping_total, discount_total, gift_wrap, gift_message, shipping_address_snapshot, created_at")
    .eq("id", orderId)
    .single();

  if (!existing) {
    console.error("[stripe webhook] Commande introuvable:", orderId);
    return;
  }

  if (
    existing.status === "confirmed" ||
    existing.status === "processing" ||
    existing.status === "shipped" ||
    existing.status === "delivered"
  ) {
    return; // déjà traitée
  }

  // 3. Marquer la commande comme confirmée (paiement validé)
  const { error: orderUpdateErr } = await admin
    .from("orders")
    .update({ status: "confirmed" })
    .eq("id", orderId);

  if (orderUpdateErr) {
    console.error("[stripe webhook] Erreur update order:", orderUpdateErr);
    return;
  }

  // 4. Mettre à jour la ligne de paiement
  const charge =
    typeof pi.latest_charge === "string" ? null : pi.latest_charge ?? null;

  await admin
    .from("payments")
    .update({
      status: "succeeded",
      paid_at: new Date().toISOString(),
      stripe_charge_id: charge?.id ?? null,
      stripe_receipt_url: charge?.receipt_url ?? null,
      stripe_customer_id:
        typeof pi.customer === "string" ? pi.customer : pi.customer?.id ?? null,
    })
    .eq("stripe_payment_intent_id", pi.id);

  // 5. Décrémenter le stock pour chaque variant
  const { data: items } = await admin
    .from("order_items")
    .select("variant_id, quantity, product_name_snapshot, unit_price")
    .eq("order_id", orderId);

  if (items && items.length > 0) {
    for (const item of items) {
      if (!item.variant_id) continue;

      // Décrément atomique : on lit puis on update.
      // (À long terme : remplacer par un RPC/Postgres function pour atomicité.)
      const { data: inv } = await admin
        .from("inventory")
        .select("id, quantity")
        .eq("variant_id", item.variant_id)
        .maybeSingle();

      if (inv) {
        await admin
          .from("inventory")
          .update({ quantity: Math.max(0, inv.quantity - item.quantity) })
          .eq("id", inv.id);
      }

      // Mettre à jour aussi product_variants.stock_quantity (compteur dénormalisé)
      const { data: variant } = await admin
        .from("product_variants")
        .select("id, stock_quantity")
        .eq("id", item.variant_id)
        .maybeSingle();

      if (variant) {
        await admin
          .from("product_variants")
          .update({
            stock_quantity: Math.max(0, variant.stock_quantity - item.quantity),
          })
          .eq("id", variant.id);
      }
    }
  }

  // 6. Envoyer l'email de confirmation
  if (existing.email) {
    try {
      const addr = (existing.shipping_address_snapshot ?? {}) as Record<
        string,
        string | undefined
      >;
      const addressLines = [
        [addr.firstName, addr.lastName].filter(Boolean).join(" "),
        addr.line1,
        addr.line2,
        [addr.postalCode, addr.city].filter(Boolean).join(" "),
        addr.country,
      ].filter((line): line is string => !!line && line.trim().length > 0);

      const eta = new Date();
      eta.setDate(eta.getDate() + 5);

      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
        "https://ishya.fr";

      await sendOrderConfirmation(existing.email, {
        orderNumber: existing.order_number,
        orderDate: formatDate(existing.created_at ?? new Date().toISOString()),
        items: (items ?? []).map((it) => ({
          name: it.product_name_snapshot,
          quantity: it.quantity,
          unitPrice: Number(it.unit_price),
        })),
        subtotal: Number(existing.subtotal),
        shipping: Number(existing.shipping_total ?? 0),
        discount: Number(existing.discount_total ?? 0),
        total: Number(existing.grand_total),
        shippingAddressLines: addressLines,
        trackOrderUrl: `${baseUrl}/compte/commandes`,
        estimatedDelivery: formatDate(eta),
      });
    } catch (emailError) {
      // L'échec d'email ne doit pas faire échouer le webhook
      console.error("[stripe webhook] Erreur envoi email:", emailError);
    }
  }
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  const admin = createAdminClient();
  const orderId = pi.metadata?.order_id;

  await admin
    .from("payments")
    .update({
      status: "failed",
      error_message:
        pi.last_payment_error?.message ?? "Échec du paiement",
    })
    .eq("stripe_payment_intent_id", pi.id);

  if (orderId) {
    await admin.from("orders").update({ status: "cancelled" }).eq("id", orderId);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const admin = createAdminClient();
  const piId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!piId) return;

  const { data: payment } = await admin
    .from("payments")
    .select("id, order_id")
    .eq("stripe_payment_intent_id", piId)
    .maybeSingle();

  if (!payment) return;

  await admin
    .from("payments")
    .update({
      status: "refunded",
      refunded_at: new Date().toISOString(),
      stripe_refund_id: charge.refunds?.data?.[0]?.id ?? null,
    })
    .eq("id", payment.id);

  await admin
    .from("orders")
    .update({ status: "refunded" })
    .eq("id", payment.order_id);
}
