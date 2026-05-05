"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { stripe } from "@/lib/stripe";
import {
  sendShippingNotification,
  sendDeliveryEmail,
} from "@/lib/email";
import { formatDate } from "@/lib/utils";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "partially_refunded"
  | "on_hold"
  | "failed";

const ALLOWED_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "partially_refunded",
  "on_hold",
  "failed",
];

function revalidateOrder(id: string) {
  revalidatePath(`/admin/commandes/${id}`);
  revalidatePath("/admin/commandes");
  revalidatePath("/admin");
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!ALLOWED_STATUSES.includes(newStatus as OrderStatus)) {
    return { ok: false, error: "Statut invalide" };
  }

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const patch: Record<string, string | null> = { status: newStatus };
  if (newStatus === "delivered") patch.delivered_at = new Date().toISOString();
  if (newStatus === "cancelled") patch.cancelled_at = new Date().toISOString();

  const { error } = await admin
    .from("orders")
    .update(patch)
    .eq("id", orderId);

  if (error) {
    console.error("[updateOrderStatus]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }

  // Email "livré" → ReviewRequest workflow déclenché ici si livré
  if (newStatus === "delivered") {
    const { data: order } = await admin
      .from("orders")
      .select("email, shipping_address_snapshot")
      .eq("id", orderId)
      .maybeSingle();
    if (order?.email) {
      try {
        const addr = (order.shipping_address_snapshot ?? {}) as {
          firstName?: string;
        };
        const baseUrl =
          process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
          "https://ishya.fr";
        await sendDeliveryEmail(order.email, {
          firstName: addr.firstName ?? "",
          reviewUrl: `${baseUrl}/compte/avis`,
        });
      } catch (e) {
        console.error("[updateOrderStatus] delivery email:", e);
      }
    }
  }

  revalidateOrder(orderId);
  return { ok: true };
}

export async function markOrderShipped(
  orderId: string,
  carrier: string,
  trackingNumber: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!carrier.trim() || !trackingNumber.trim()) {
    return { ok: false, error: "Transporteur et numéro de suivi requis" };
  }

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Update order status
  const { error: orderErr } = await admin
    .from("orders")
    .update({ status: "shipped", shipped_at: now })
    .eq("id", orderId);

  if (orderErr) {
    console.error("[markOrderShipped] orders:", orderErr);
    return { ok: false, error: "Erreur de mise à jour" };
  }

  // Upsert shipment
  const { data: existing } = await admin
    .from("shipments")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  const eta = new Date();
  eta.setDate(eta.getDate() + 5);

  if (existing) {
    await admin
      .from("shipments")
      .update({
        carrier: carrier.trim(),
        tracking_number: trackingNumber.trim(),
        status: "in_transit",
        shipped_at: now,
        estimated_delivery: eta.toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await admin.from("shipments").insert({
      order_id: orderId,
      carrier: carrier.trim(),
      tracking_number: trackingNumber.trim(),
      status: "in_transit",
      shipped_at: now,
      estimated_delivery: eta.toISOString(),
    });
  }

  // Send shipping email
  const { data: order } = await admin
    .from("orders")
    .select(
      `order_number, email,
       order_items ( product_name_snapshot, quantity )`,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (order?.email) {
    try {
      const items = (order.order_items ?? []) as Array<{
        product_name_snapshot: string;
        quantity: number;
      }>;
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
        "https://ishya.fr";
      await sendShippingNotification(order.email, {
        orderNumber: order.order_number,
        trackingNumber: trackingNumber.trim(),
        carrier: carrier.trim(),
        trackParcelUrl: `${baseUrl}/suivi?n=${encodeURIComponent(trackingNumber.trim())}`,
        estimatedDeliveryDate: formatDate(eta),
        items: items.map((it) => ({
          name: it.product_name_snapshot,
          imageUrl: "",
          quantity: it.quantity,
        })),
      });
    } catch (e) {
      console.error("[markOrderShipped] shipping email:", e);
    }
  }

  revalidateOrder(orderId);
  return { ok: true };
}

export async function refundOrder(
  orderId: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  if (!stripe) {
    return { ok: false, error: "Stripe non configuré" };
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select(
      `id, status,
       payments ( id, stripe_payment_intent_id, status )`,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false, error: "Commande introuvable" };

  const payments = (order.payments ?? []) as Array<{
    id: string;
    stripe_payment_intent_id: string | null;
    status: string | null;
  }>;
  const payment = payments[0];

  if (!payment?.stripe_payment_intent_id) {
    return { ok: false, error: "Aucun paiement Stripe associé" };
  }
  if (payment.status === "refunded") {
    return { ok: false, error: "Déjà remboursée" };
  }

  try {
    await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur Stripe";
    console.error("[refundOrder] stripe:", e);
    return { ok: false, error: msg };
  }

  // Le webhook charge.refunded mettra à jour la base, mais on anticipe
  await admin
    .from("orders")
    .update({ status: "refunded" })
    .eq("id", orderId);
  await admin
    .from("payments")
    .update({
      status: "refunded",
      refunded_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  revalidateOrder(orderId);
  return { ok: true };
}

export async function updateInternalNote(
  orderId: string,
  note: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ internal_note: note.trim() || null })
    .eq("id", orderId);

  if (error) {
    console.error("[updateInternalNote]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }

  revalidateOrder(orderId);
  return { ok: true };
}
