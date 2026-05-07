"use server";

import { randomUUID } from "crypto";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewsletterConfirmation } from "@/lib/email";

const subscribeSchema = z.object({
  email: z.string().min(1, "Email requis").email("Email invalide"),
  source: z
    .enum(["home", "footer", "checkout", "popup", "blog", "other"])
    .optional(),
});

export type SubscribeNewsletterInput = z.infer<typeof subscribeSchema>;

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

function buildConfirmUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ishya.fr";
  return `${base}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
}

export async function subscribeNewsletter(
  input: SubscribeNewsletterInput,
): Promise<ActionResult> {
  const parsed = subscribeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const source = parsed.data.source ?? "other";

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      ok: false,
      error: "Le service est temporairement indisponible. Réessayez plus tard.",
    };
  }

  // newsletter_subscribers a un index unique sur lower(email).
  const table = admin.from("newsletter_subscribers" as never);

  const { data: existing } = await table
    .select("id, unsubscribed_at, confirmed_at, marketing_consent")
    .filter("email", "ilike", email)
    .maybeSingle<{
      id: string;
      unsubscribed_at: string | null;
      confirmed_at: string | null;
      marketing_consent: boolean | null;
    }>();

  // Génération du token de double opt-in
  const token = randomUUID();
  const now = new Date().toISOString();

  if (existing) {
    // Déjà confirmé et toujours actif → rien à faire
    if (
      existing.confirmed_at &&
      !existing.unsubscribed_at &&
      existing.marketing_consent
    ) {
      return {
        ok: true,
        message: "Vous êtes déjà inscrit(e) à notre newsletter.",
      };
    }

    // Sinon (désabonné, non confirmé, ou consentement révoqué) : on relance le
    // double opt-in. Le consentement n'est effectif qu'après clic sur le lien
    // de confirmation (RGPD double opt-in).
    const { error } = await table
      .update({
        unsubscribed_at: null,
        unsubscribe_reason: null,
        source,
        subscribed_at: now,
        marketing_consent: true,
        confirmed_at: null,
        confirmation_token: token,
      } as never)
      .eq("id", existing.id);
    if (error) {
      return {
        ok: false,
        error: "Impossible de mettre à jour votre inscription.",
      };
    }
  } else {
    const { error } = await table.insert({
      email,
      source,
      marketing_consent: true,
      confirmed_at: null,
      confirmation_token: token,
    } as never);
    if (error) {
      return {
        ok: false,
        error: "Impossible d'enregistrer votre inscription.",
      };
    }
  }

  // Email de confirmation (RGPD double opt-in). Sans confirmation, l'adresse
  // n'est pas considérée comme consentante et ne recevra aucun email marketing.
  try {
    if (process.env.RESEND_API_KEY) {
      await sendNewsletterConfirmation(email, {
        confirmUrl: buildConfirmUrl(token),
      });
    }
  } catch (err) {
    console.error("[newsletter] confirmation email failed", err);
  }

  return {
    ok: true,
    message:
      "Vérifiez votre boîte mail : un email de confirmation vient de vous être envoyé.",
  };
}

const unsubscribeSchema = z.object({
  email: z.string().min(1).email("Email invalide"),
  reason: z.string().max(60).optional(),
});

export async function unsubscribeNewsletter(
  input: z.infer<typeof unsubscribeSchema>,
): Promise<ActionResult> {
  const parsed = unsubscribeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Email invalide" };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const reason = parsed.data.reason?.trim() || null;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "Service indisponible, réessayez plus tard." };
  }

  // 1. Marquer le subscriber comme désinscrit (idempotent).
  await admin
    .from("newsletter_subscribers" as never)
    .update({
      unsubscribed_at: new Date().toISOString(),
      unsubscribe_reason: reason,
    } as never)
    .filter("email", "ilike", email);

  // 2. Si l'email correspond à un compte, désactiver email_marketing dans
  //    notification_preferences (le suivi de commande reste actif).
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (profile?.id) {
    await admin
      .from("notification_preferences")
      .update({ email_marketing: false })
      .eq("user_id", profile.id);
  }

  return {
    ok: true,
    message: `L'adresse ${email} a été retirée de notre newsletter.`,
  };
}
