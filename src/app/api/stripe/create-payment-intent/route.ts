import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  createPendingOrder,
  recordPaymentIntent,
  type OrderItemInput,
  type ShippingAddressSnapshot,
} from "@/lib/queries/orders";

interface PaymentIntentBody {
  items: {
    productId: string;
    variantId?: string | null;
    name: string;
    variantName?: string | null;
    sku?: string | null;
    price: number;
    quantity: number;
  }[];
  shippingCost: number;
  giftWrap: boolean;
  giftMessage?: string | null;
  discountAmount: number;
  email?: string;
  phone?: string | null;
  userId?: string | null;
  shippingAddress?: ShippingAddressSnapshot | null;
}

export async function POST(request: NextRequest) {
  if (!stripe) {
    return Response.json(
      { error: "Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env.local" },
      { status: 503 }
    );
  }

  try {
    const body: PaymentIntentBody = await request.json();
    const {
      items,
      shippingCost,
      giftWrap,
      giftMessage,
      discountAmount,
      email,
      phone,
      userId,
      shippingAddress,
    } = body;

    if (!items || items.length === 0) {
      return Response.json({ error: "Le panier est vide" }, { status: 400 });
    }
    if (!email) {
      return Response.json(
        { error: "Email client requis pour créer la commande" },
        { status: 400 }
      );
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const giftWrapCost = giftWrap ? 3 : 0;
    const total = subtotal + shippingCost + giftWrapCost - discountAmount;

    if (total <= 0) {
      return Response.json(
        { error: "Le montant total doit être supérieur à 0" },
        { status: 400 }
      );
    }

    const orderItems: OrderItemInput[] = items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId ?? null,
      productNameSnapshot: i.name,
      variantNameSnapshot: i.variantName ?? null,
      skuSnapshot: i.sku ?? null,
      unitPrice: i.price,
      quantity: i.quantity,
    }));

    const order = await createPendingOrder({
      email,
      phone: phone ?? undefined,
      userId,
      items: orderItems,
      subtotal: Number(subtotal.toFixed(2)),
      discountTotal: Number(discountAmount.toFixed(2)),
      shippingTotal: Number((shippingCost + giftWrapCost).toFixed(2)),
      grandTotal: Number(total.toFixed(2)),
      giftWrap,
      giftMessage,
      shippingAddress,
    });

    const amountInCents = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
        items_count: items.length.toString(),
        items_summary: items
          .map((i) => `${i.name} x${i.quantity}`)
          .join(", ")
          .slice(0, 500),
      },
    });

    await recordPaymentIntent({
      orderId: order.id,
      amount: Number(total.toFixed(2)),
      paymentIntentId: paymentIntent.id,
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Erreur création PaymentIntent:", error);
    return Response.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
