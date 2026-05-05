import { NextRequest } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  amount: z.number().int().min(10, "Montant minimum 10 €").max(1000),
  recipientEmail: z.string().email("Email invalide"),
  recipientName: z.string().max(120).optional(),
  senderName: z.string().max(120).optional(),
  senderEmail: z.string().email().optional(),
  message: z.string().max(250).optional(),
  deliveryDate: z.string().optional(), // ISO yyyy-mm-dd ou ""
});

function generateGiftCardCode(): string {
  // ISHYA-XXXX-XXXX (alphanumérique, lisible, sans 0/O/I/1)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(
      "",
    );
  return `ISHYA-${block(4)}-${block(4)}`;
}

export async function POST(request: NextRequest) {
  if (!stripe) {
    return Response.json(
      { error: "Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env.local" },
      { status: 503 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 },
    );
  }

  const {
    amount,
    recipientEmail,
    recipientName,
    senderName,
    senderEmail,
    message,
    deliveryDate,
  } = parsed.data;

  const admin = createAdminClient();

  // 1. Pré-créer la carte cadeau en base avec status='pending', sans code visible
  //    (le code définitif est attribué après paiement réussi pour éviter les
  //    cartes inutilisées en cas d'échec).
  const provisionalCode = generateGiftCardCode();

  const { data: created, error: insertErr } = await admin
    .from("gift_cards" as never)
    .insert({
      code: provisionalCode,
      initial_amount: amount,
      amount_remaining: amount,
      currency: "EUR",
      recipient_email: recipientEmail.toLowerCase(),
      recipient_name: recipientName || null,
      sender_name: senderName || null,
      sender_email: senderEmail?.toLowerCase() || null,
      message: message || null,
      delivery_date: deliveryDate || null,
      status: "pending",
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    } as never)
    .select("id")
    .single<{ id: string }>();

  if (insertErr || !created) {
    console.error("[gift-card] insert failed", insertErr);
    return Response.json(
      { error: "Impossible d'enregistrer la carte cadeau." },
      { status: 500 },
    );
  }

  // 2. Créer la session Stripe Checkout
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ishya.fr";

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `Carte cadeau ISHYA ${amount} €`,
              description: senderName
                ? `De ${senderName} pour ${recipientName || recipientEmail}`
                : `Pour ${recipientName || recipientEmail}`,
            },
          },
        },
      ],
      success_url: `${baseUrl}/carte-cadeau?status=success`,
      cancel_url: `${baseUrl}/carte-cadeau?status=cancelled`,
      customer_email: senderEmail || undefined,
      metadata: {
        kind: "gift_card",
        gift_card_id: created.id,
      },
    });
  } catch (err) {
    console.error("[gift-card] stripe error", err);
    // Rollback : suppression de la ligne pending pour ne pas laisser de codes orphelins
    await admin.from("gift_cards" as never).delete().eq("id", created.id);
    return Response.json(
      { error: "Erreur lors de la création de la session de paiement." },
      { status: 500 },
    );
  }

  // 3. Stocker l'ID de session pour matcher dans le webhook
  await admin
    .from("gift_cards" as never)
    .update({ stripe_session_id: session.id } as never)
    .eq("id", created.id);

  return Response.json({ checkoutUrl: session.url });
}
