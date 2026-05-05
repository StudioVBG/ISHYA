"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";

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

  // Upsert : si l'email existait et était désabonné, on le réactive.
  // newsletter_subscribers a un index unique sur lower(email).
  const table = admin.from("newsletter_subscribers" as never);

  const { data: existing } = await table
    .select("id, unsubscribed_at")
    .filter("email", "ilike", email)
    .maybeSingle<{ id: string; unsubscribed_at: string | null }>();

  if (existing) {
    if (!existing.unsubscribed_at) {
      return { ok: true, message: "Vous êtes déjà inscrit(e) à notre newsletter." };
    }
    const { error } = await table
      .update({
        unsubscribed_at: null,
        unsubscribe_reason: null,
        source,
        subscribed_at: new Date().toISOString(),
      } as never)
      .eq("id", existing.id);
    if (error) {
      return { ok: false, error: "Impossible de mettre à jour votre inscription." };
    }
  } else {
    const { error } = await table.insert({ email, source } as never);
    if (error) {
      return { ok: false, error: "Impossible d'enregistrer votre inscription." };
    }
  }

  // Bienvenue + code -10%. L'email est best-effort : si Resend tombe, l'inscription
  // est enregistrée — on log et on retourne un succès softé.
  try {
    if (process.env.RESEND_API_KEY) {
      await sendWelcomeEmail(email, { firstName: "" });
    }
  } catch (err) {
    console.error("[newsletter] welcome email failed", err);
  }

  return {
    ok: true,
    message: "Merci ! Vérifiez votre boîte mail pour votre code -10%.",
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
