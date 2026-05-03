"use server";

import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SavedCard {
  id: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
}

async function getOrCreateStripeCustomerId(
  userId: string,
  email: string | null,
): Promise<string | null> {
  if (!stripe) return null;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("payments")
    .select("stripe_customer_id")
    .not("stripe_customer_id", "is", null)
    .eq("order_id", userId) // jamais matché : sert juste à valider la table
    .maybeSingle();

  if (existing?.stripe_customer_id) return existing.stripe_customer_id;

  // Sinon on cherche dans Stripe par email
  if (email) {
    const list = await stripe.customers.list({ email, limit: 1 });
    if (list.data[0]) {
      return list.data[0].id;
    }
  }

  // Crée un customer
  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { user_id: userId },
  });
  return customer.id;
}

export async function listSavedCards(): Promise<{
  cards: SavedCard[];
  error?: string;
}> {
  if (!stripe) return { cards: [], error: "Stripe non configuré" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { cards: [], error: "Non authentifié" };

  const customerId = await getOrCreateStripeCustomerId(user.id, user.email ?? null);
  if (!customerId) return { cards: [] };

  try {
    const [paymentMethods, customer] = await Promise.all([
      stripe.paymentMethods.list({ customer: customerId, type: "card" }),
      stripe.customers.retrieve(customerId),
    ]);

    const defaultPmId =
      typeof customer === "object" && !customer.deleted
        ? (customer.invoice_settings?.default_payment_method as
            | string
            | null) ?? null
        : null;

    const cards: SavedCard[] = paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand ?? null,
      last4: pm.card?.last4 ?? null,
      expMonth: pm.card?.exp_month ?? null,
      expYear: pm.card?.exp_year ?? null,
      isDefault: pm.id === defaultPmId,
    }));

    return { cards };
  } catch (e) {
    console.error("[listSavedCards]", e);
    return {
      cards: [],
      error: "Impossible de récupérer vos moyens de paiement",
    };
  }
}

export async function createCardSetupIntent(): Promise<{
  ok: boolean;
  clientSecret?: string;
  error?: string;
}> {
  if (!stripe) return { ok: false, error: "Stripe non configuré" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const customerId = await getOrCreateStripeCustomerId(user.id, user.email ?? null);
  if (!customerId) return { ok: false, error: "Erreur de configuration" };

  try {
    const setup = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
    });
    return { ok: true, clientSecret: setup.client_secret ?? undefined };
  } catch (e) {
    console.error("[createCardSetupIntent]", e);
    return { ok: false, error: "Erreur Stripe" };
  }
}

export async function deleteSavedCard(
  paymentMethodId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!stripe) return { ok: false, error: "Stripe non configuré" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  try {
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    // Vérifier que la carte appartient bien à un customer du user courant
    const customerId = await getOrCreateStripeCustomerId(
      user.id,
      user.email ?? null,
    );
    if (
      typeof pm.customer === "string"
        ? pm.customer !== customerId
        : pm.customer?.id !== customerId
    ) {
      return { ok: false, error: "Carte non autorisée" };
    }
    await stripe.paymentMethods.detach(paymentMethodId);
    revalidatePath("/compte/paiement");
    return { ok: true };
  } catch (e) {
    console.error("[deleteSavedCard]", e);
    return { ok: false, error: "Erreur Stripe" };
  }
}

export async function setDefaultCard(
  paymentMethodId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!stripe) return { ok: false, error: "Stripe non configuré" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const customerId = await getOrCreateStripeCustomerId(
    user.id,
    user.email ?? null,
  );
  if (!customerId) return { ok: false, error: "Erreur de configuration" };

  try {
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    revalidatePath("/compte/paiement");
    return { ok: true };
  } catch (e) {
    console.error("[setDefaultCard]", e);
    return { ok: false, error: "Erreur Stripe" };
  }
}
