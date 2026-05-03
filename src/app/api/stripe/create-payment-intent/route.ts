import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/utils";

interface PaymentIntentItem {
  productId: string;
  variantId: string | null;
  name: string;
  variantName?: string | null;
  sku?: string | null;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
  phone?: string;
}

interface PaymentIntentBody {
  items: PaymentIntentItem[];
  shippingCost: number;
  giftWrap: boolean;
  giftMessage?: string;
  discountAmount: number;
  discountCode?: string | null;
  email?: string;
  shippingAddress?: ShippingAddress;
}

export async function POST(request: NextRequest) {
  if (!stripe) {
    return Response.json(
      { error: "Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env.local" },
      { status: 503 },
    );
  }

  let body: PaymentIntentBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const {
    items,
    shippingCost,
    giftWrap,
    giftMessage,
    discountAmount,
    discountCode,
    email,
    shippingAddress,
  } = body;

  if (!items || items.length === 0) {
    return Response.json({ error: "Le panier est vide" }, { status: 400 });
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const giftWrapCost = giftWrap ? 3 : 0;
  const total = subtotal + shippingCost + giftWrapCost - discountAmount;

  if (total <= 0) {
    return Response.json(
      { error: "Le montant total doit être supérieur à 0" },
      { status: 400 },
    );
  }

  // Identifier l'utilisateur connecté (sinon commande invitée)
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  const admin = createAdminClient();
  const orderNumber = generateOrderNumber();

  // 1. Créer la commande (status pending)
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: userId,
      email: email ?? null,
      phone: shippingAddress?.phone ?? null,
      status: "pending",
      currency: "EUR",
      subtotal,
      discount_total: discountAmount,
      shipping_total: shippingCost + giftWrapCost,
      tax_total: 0,
      grand_total: total,
      gift_wrap: giftWrap,
      gift_message: giftMessage ?? null,
      shipping_address_snapshot: shippingAddress
        ? JSON.parse(JSON.stringify(shippingAddress))
        : null,
      billing_address_snapshot: shippingAddress
        ? JSON.parse(JSON.stringify(shippingAddress))
        : null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("[create-payment-intent] Erreur création commande:", orderError);
    return Response.json(
      { error: "Impossible de créer la commande" },
      { status: 500 },
    );
  }

  // 2. Insérer les lignes de commande
  const orderItemsRows = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId,
    product_name_snapshot: item.name,
    variant_name_snapshot: item.variantName ?? null,
    sku_snapshot: item.sku ?? null,
    unit_price: item.price,
    quantity: item.quantity,
    discount_amount: 0,
    tax_amount: 0,
    total: item.price * item.quantity,
  }));

  const { error: itemsError } = await admin
    .from("order_items")
    .insert(orderItemsRows);

  if (itemsError) {
    console.error("[create-payment-intent] Erreur insertion items:", itemsError);
    // Rollback: supprimer la commande orpheline
    await admin.from("orders").delete().eq("id", order.id);
    return Response.json(
      { error: "Impossible d'enregistrer les articles" },
      { status: 500 },
    );
  }

  // 3. Code de réduction appliqué
  if (discountCode && discountAmount > 0) {
    await admin.from("applied_discounts").insert({
      order_id: order.id,
      code: discountCode,
      discount_type: "fixed_amount",
      discount_value: discountAmount,
      amount_saved: discountAmount,
    });
  }

  // 4. Créer le PaymentIntent Stripe avec liens vers la commande
  const amountInCents = Math.round(total * 100);

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        ...(userId && { user_id: userId }),
      },
      ...(email && { receipt_email: email }),
    });
  } catch (error) {
    console.error("[create-payment-intent] Erreur Stripe:", error);
    // Rollback en cascade via FK
    await admin.from("orders").delete().eq("id", order.id);
    return Response.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 },
    );
  }

  // 5. Insérer le paiement (status pending)
  const { error: paymentError } = await admin.from("payments").insert({
    order_id: order.id,
    status: "pending",
    method: "card",
    amount: total,
    currency: "EUR",
    stripe_payment_intent_id: paymentIntent.id,
  });

  if (paymentError) {
    console.error("[create-payment-intent] Erreur création payment:", paymentError);
  }

  return Response.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    orderId: order.id,
    orderNumber: order.order_number,
  });
}
