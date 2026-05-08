"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const lookupSchema = z.object({
  orderNumber: z.string().trim().min(1).max(50),
  email: z.string().trim().toLowerCase().email(),
});

export interface OrderTrackingEvent {
  status: string;
  description: string | null;
  location: string | null;
  occurredAt: string;
}

export interface OrderTracking {
  orderNumber: string;
  status: string;
  createdAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  shipment: {
    carrier: string | null;
    trackingNumber: string | null;
    estimatedDelivery: string | null;
    status: string;
  } | null;
  events: OrderTrackingEvent[];
}

type LookupResult =
  | { ok: true; data: OrderTracking }
  | { ok: false; error: string };

const NOT_FOUND_MESSAGE =
  "Commande introuvable. Vérifiez votre numéro de commande et l'email utilisé lors de l'achat.";

export async function lookupOrder(input: unknown): Promise<LookupResult> {
  const parsed = lookupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Numéro de commande ou email invalide.",
    };
  }

  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, created_at, shipped_at, delivered_at, cancelled_at, email",
    )
    .eq("order_number", parsed.data.orderNumber)
    .maybeSingle();

  if (error) {
    console.error("[lookupOrder] orders", error);
    return { ok: false, error: "Service temporairement indisponible." };
  }

  // Anti-énumération : on retourne un message générique que l'order existe ou
  // pas, tant que l'email ne correspond pas (les order_number sont déjà
  // imprévisibles, mais on ne fuite pas leur existence).
  if (!order) return { ok: false, error: NOT_FOUND_MESSAGE };

  const orderEmail = (order.email ?? "").trim().toLowerCase();
  if (!orderEmail || orderEmail !== parsed.data.email) {
    return { ok: false, error: NOT_FOUND_MESSAGE };
  }

  const { data: shipments } = await supabase
    .from("shipments")
    .select(
      "id, status, carrier, tracking_number, estimated_delivery, created_at",
    )
    .eq("order_id", order.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const shipment = shipments?.[0] ?? null;

  let events: OrderTrackingEvent[] = [];
  if (shipment) {
    const { data: rows } = await supabase
      .from("tracking_events")
      .select("status, description, location, occurred_at")
      .eq("shipment_id", shipment.id)
      .order("occurred_at", { ascending: false })
      .limit(50);
    events = (rows ?? []).map((r) => ({
      status: r.status,
      description: r.description,
      location: r.location,
      occurredAt: r.occurred_at,
    }));
  }

  return {
    ok: true,
    data: {
      orderNumber: order.order_number,
      status: order.status ?? "pending",
      createdAt: order.created_at ?? new Date().toISOString(),
      shippedAt: order.shipped_at,
      deliveredAt: order.delivered_at,
      cancelledAt: order.cancelled_at,
      shipment: shipment
        ? {
            carrier: shipment.carrier,
            trackingNumber: shipment.tracking_number,
            estimatedDelivery: shipment.estimated_delivery,
            status: shipment.status ?? "pending",
          }
        : null,
      events,
    },
  };
}
