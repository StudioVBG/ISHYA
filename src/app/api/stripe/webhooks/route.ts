import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    return Response.json(
      { error: "Stripe non configuré" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json(
      { error: "Signature manquante" },
      { status: 400 }
    );
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
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(
          `Paiement réussi: ${paymentIntent.id} — ${paymentIntent.amount / 100}€`
        );
        // TODO: Créer la commande en base de données (Supabase)
        // TODO: Envoyer l'email de confirmation (Resend)
        // TODO: Mettre à jour le stock des produits
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(
          `Échec paiement: ${paymentIntent.id} — ${paymentIntent.last_payment_error?.message}`
        );
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log(`Remboursement: ${charge.id} — ${charge.amount_refunded / 100}€`);
        // TODO: Mettre à jour le statut de la commande → "refunded"
        break;
      }

      default:
        console.log(`Événement non géré: ${event.type}`);
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
