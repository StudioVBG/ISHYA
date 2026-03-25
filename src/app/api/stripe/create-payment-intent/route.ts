import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";

interface PaymentIntentBody {
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  shippingCost: number;
  giftWrap: boolean;
  discountAmount: number;
  email?: string;
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
    const { items, shippingCost, giftWrap, discountAmount, email } = body;

    if (!items || items.length === 0) {
      return Response.json(
        { error: "Le panier est vide" },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const giftWrapCost = giftWrap ? 3 : 0;
    const total = subtotal + shippingCost + giftWrapCost - discountAmount;

    if (total <= 0) {
      return Response.json(
        { error: "Le montant total doit être supérieur à 0" },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: {
        items_count: items.length.toString(),
        subtotal: subtotal.toFixed(2),
        shipping_cost: shippingCost.toFixed(2),
        gift_wrap: giftWrap.toString(),
        discount_amount: discountAmount.toFixed(2),
        items_summary: items
          .map((i) => `${i.name} x${i.quantity}`)
          .join(", ")
          .slice(0, 500),
      },
      ...(email && { receipt_email: email }),
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Erreur création PaymentIntent:", error);
    return Response.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
