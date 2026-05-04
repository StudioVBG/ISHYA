import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import {
  decrementInventory,
  getOrderForEmail,
  markOrderConfirmed,
  markOrderFailed,
  markOrderRefunded,
} from "@/lib/queries/orders";
import { sendOrderConfirmation } from "@/lib/email";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function adminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function formatAddressLines(snap: unknown): string[] {
  if (!snap || typeof snap !== "object") return [];
  const a = snap as Record<string, string | undefined>;
  const lines: string[] = [];
  const name = [a.firstName, a.lastName].filter(Boolean).join(" ");
  if (name) lines.push(name);
  if (a.line1) lines.push(a.line1);
  if (a.line2) lines.push(a.line2);
  if (a.postalCode || a.city) {
    lines.push([a.postalCode, a.city].filter(Boolean).join(" "));
  }
  if (a.country) lines.push(a.country);
  return lines;
}

async function loadOrderItemsForStock(orderId: string) {
  const supabase = adminClient();
  const { data } = await supabase
    .from("order_items")
    .select("variant_id, quantity")
    .eq("order_id", orderId);
  return (data ?? []).map((r) => ({
    variantId: r.variant_id,
    quantity: r.quantity,
  }));
}

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
    console.error("Erreur vérification webhook:", message);
    return Response.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const latestCharge =
          typeof pi.latest_charge === "string" ? null : pi.latest_charge ?? null;
        const result = await markOrderConfirmed({
          paymentIntentId: pi.id,
          chargeId:
            (typeof pi.latest_charge === "string" ? pi.latest_charge : latestCharge?.id) ??
            null,
          receiptUrl: latestCharge?.receipt_url ?? null,
        });
        if (!result) break;

        // Decrement stock
        const stockItems = await loadOrderItemsForStock(result.orderId);
        await decrementInventory(stockItems);

        // Send confirmation email
        const data = await getOrderForEmail(result.orderId);
        if (data && data.order.email) {
          const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL ?? "https://ishya.vercel.app";
          const eta = new Date();
          eta.setDate(eta.getDate() + 5);
          await sendOrderConfirmation(data.order.email, {
            orderNumber: data.order.order_number,
            orderDate: new Date(data.order.created_at ?? Date.now()).toLocaleDateString(
              "fr-FR",
              { day: "numeric", month: "long", year: "numeric" }
            ),
            items: data.items.map((it) => ({
              name: [it.product_name_snapshot, it.variant_name_snapshot]
                .filter(Boolean)
                .join(" — "),
              quantity: it.quantity,
              unitPrice: Number(it.unit_price),
            })),
            subtotal: Number(data.order.subtotal),
            shipping: Number(data.order.shipping_total ?? 0),
            discount: Number(data.order.discount_total ?? 0),
            total: Number(data.order.grand_total),
            shippingAddressLines: formatAddressLines(
              data.order.shipping_address_snapshot
            ),
            trackOrderUrl: `${baseUrl}/compte/commandes/${result.orderId}/suivi`,
            estimatedDelivery: eta.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
            }),
          }).catch((err) => {
            console.error("[webhook] sendOrderConfirmation failed:", err);
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await markOrderFailed({
          paymentIntentId: pi.id,
          errorMessage: pi.last_payment_error?.message,
        });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const refunded = charge.amount_refunded;
        const isFull = refunded >= charge.amount;
        const lastRefundId = charge.refunds?.data?.[0]?.id ?? null;
        await markOrderRefunded({
          paymentIntentId:
            typeof charge.payment_intent === "string" ? charge.payment_intent : null,
          chargeId: charge.id,
          refundId: lastRefundId,
          amountRefunded: refunded / 100,
          isFullRefund: isFull,
        });
        break;
      }

      default:
        // Other events (charge.succeeded, payment_intent.created, etc.) acknowledged silently.
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Erreur traitement webhook:", error);
    return Response.json(
      { error: "Erreur traitement webhook" },
      { status: 500 }
    );
  }
}
