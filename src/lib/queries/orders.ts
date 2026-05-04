import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

function adminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export type OrderItemInput = {
  productId: string;
  variantId: string | null;
  productNameSnapshot: string;
  variantNameSnapshot?: string | null;
  skuSnapshot?: string | null;
  unitPrice: number;
  quantity: number;
};

export type ShippingAddressSnapshot = {
  firstName?: string;
  lastName?: string;
  line1?: string;
  line2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  phone?: string;
};

function generateOrderNumber() {
  const date = new Date();
  const yyyymmdd = `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ISH-${yyyymmdd}-${rand}`;
}

export type CreatePendingOrderInput = {
  email: string;
  phone?: string;
  userId?: string | null;
  items: OrderItemInput[];
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  grandTotal: number;
  giftWrap: boolean;
  giftMessage?: string | null;
  shippingAddress?: ShippingAddressSnapshot | null;
};

export async function createPendingOrder(input: CreatePendingOrderInput) {
  const supabase = adminClient();
  const orderNumber = generateOrderNumber();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: input.userId ?? null,
      status: "pending",
      currency: "EUR",
      subtotal: input.subtotal,
      discount_total: input.discountTotal,
      shipping_total: input.shippingTotal,
      tax_total: 0,
      grand_total: input.grandTotal,
      shipping_address_snapshot: input.shippingAddress ?? null,
      gift_wrap: input.giftWrap,
      gift_message: input.giftMessage ?? null,
      email: input.email,
      phone: input.phone ?? null,
    })
    .select("id, order_number")
    .single();

  if (orderErr || !order) {
    throw new Error(`createPendingOrder: ${orderErr?.message ?? "no data"}`);
  }

  const itemsRows = input.items.map((it) => ({
    order_id: order.id,
    product_id: it.productId,
    variant_id: it.variantId,
    product_name_snapshot: it.productNameSnapshot,
    variant_name_snapshot: it.variantNameSnapshot ?? null,
    sku_snapshot: it.skuSnapshot ?? null,
    unit_price: it.unitPrice,
    quantity: it.quantity,
    discount_amount: 0,
    tax_amount: 0,
    total: Number((it.unitPrice * it.quantity).toFixed(2)),
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(itemsRows);
  if (itemsErr) {
    throw new Error(`createPendingOrder items: ${itemsErr.message}`);
  }

  return { id: order.id, orderNumber: order.order_number };
}

export async function recordPaymentIntent(args: {
  orderId: string;
  amount: number;
  paymentIntentId: string;
}) {
  const supabase = adminClient();
  const { error } = await supabase.from("payments").insert({
    order_id: args.orderId,
    status: "pending",
    method: "card",
    amount: args.amount,
    currency: "EUR",
    stripe_payment_intent_id: args.paymentIntentId,
  });
  if (error) {
    console.error("[recordPaymentIntent]", error);
  }
}

export async function markOrderConfirmed(args: {
  paymentIntentId: string;
  chargeId?: string | null;
  receiptUrl?: string | null;
}) {
  const supabase = adminClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, order_id, amount")
    .eq("stripe_payment_intent_id", args.paymentIntentId)
    .maybeSingle();
  if (!payment) {
    console.warn(`[markOrderConfirmed] no payment row for ${args.paymentIntentId}`);
    return null;
  }

  await supabase
    .from("payments")
    .update({
      status: "succeeded",
      paid_at: new Date().toISOString(),
      stripe_charge_id: args.chargeId ?? null,
      stripe_receipt_url: args.receiptUrl ?? null,
    })
    .eq("id", payment.id);

  await supabase
    .from("orders")
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .eq("id", payment.order_id);

  return { orderId: payment.order_id };
}

export async function markOrderFailed(args: {
  paymentIntentId: string;
  errorMessage?: string;
}) {
  const supabase = adminClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, order_id")
    .eq("stripe_payment_intent_id", args.paymentIntentId)
    .maybeSingle();
  if (!payment) return;

  await supabase
    .from("payments")
    .update({ status: "failed", error_message: args.errorMessage ?? null })
    .eq("id", payment.id);
  await supabase
    .from("orders")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("id", payment.order_id);
}

export async function markOrderRefunded(args: {
  paymentIntentId?: string | null;
  chargeId: string;
  refundId?: string | null;
  amountRefunded: number;
  isFullRefund: boolean;
}) {
  const supabase = adminClient();
  let payment;
  if (args.paymentIntentId) {
    const { data } = await supabase
      .from("payments")
      .select("id, order_id, amount")
      .eq("stripe_payment_intent_id", args.paymentIntentId)
      .maybeSingle();
    payment = data;
  }
  if (!payment) {
    const { data } = await supabase
      .from("payments")
      .select("id, order_id, amount")
      .eq("stripe_charge_id", args.chargeId)
      .maybeSingle();
    payment = data;
  }
  if (!payment) return;

  await supabase
    .from("payments")
    .update({
      status: args.isFullRefund ? "refunded" : "partially_refunded",
      refunded_at: new Date().toISOString(),
      stripe_refund_id: args.refundId ?? null,
    })
    .eq("id", payment.id);

  await supabase
    .from("orders")
    .update({
      status: args.isFullRefund ? "refunded" : "partially_refunded",
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.order_id);
}

export async function decrementInventory(items: { variantId: string | null; quantity: number }[]) {
  const supabase = adminClient();
  for (const it of items) {
    if (!it.variantId) continue;
    const { data: row } = await supabase
      .from("inventory")
      .select("id, quantity")
      .eq("variant_id", it.variantId)
      .maybeSingle();
    if (!row) {
      const { data: variantStock } = await supabase
        .from("product_variants")
        .select("stock_quantity")
        .eq("id", it.variantId)
        .maybeSingle();
      const newStock = Math.max(0, (variantStock?.stock_quantity ?? 0) - it.quantity);
      await supabase
        .from("product_variants")
        .update({ stock_quantity: newStock })
        .eq("id", it.variantId);
      continue;
    }
    await supabase
      .from("inventory")
      .update({
        quantity: Math.max(0, row.quantity - it.quantity),
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    const { data: variantStock } = await supabase
      .from("product_variants")
      .select("stock_quantity")
      .eq("id", it.variantId)
      .maybeSingle();
    const newStock = Math.max(0, (variantStock?.stock_quantity ?? 0) - it.quantity);
    await supabase
      .from("product_variants")
      .update({ stock_quantity: newStock })
      .eq("id", it.variantId);
  }
}

export async function getOrderForEmail(orderId: string) {
  const supabase = adminClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, email, subtotal, shipping_total, discount_total, grand_total, shipping_address_snapshot, created_at"
    )
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;
  const { data: items } = await supabase
    .from("order_items")
    .select("product_name_snapshot, variant_name_snapshot, unit_price, quantity")
    .eq("order_id", orderId);
  return { order, items: items ?? [] };
}
