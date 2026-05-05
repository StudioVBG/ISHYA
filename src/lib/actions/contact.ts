"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendContactNotification } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(120),
  email: z.string().email("Email invalide"),
  subject: z.string().max(140).optional(),
  message: z.string().min(10, "Message trop court (10 caractères min.)").max(5000),
  // honeypot : doit rester vide
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function submitContactMessage(input: ContactInput): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  // Honeypot : si rempli, on prétend avoir réussi sans rien faire (anti-bot).
  if (parsed.data.website) {
    return { ok: true, message: "Message envoyé ! Nous vous répondrons sous 24-48h." };
  }

  const { name, email, subject, message } = parsed.data;

  const headerList = await headers();
  const ipAddress =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    null;
  const userAgent = headerList.get("user-agent") ?? null;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "Service indisponible. Réessayez plus tard." };
  }

  const { error: insertErr } = await admin.from("contact_messages" as never).insert({
    name,
    email: email.toLowerCase(),
    subject: subject || null,
    message,
    ip_address: ipAddress,
    user_agent: userAgent,
  } as never);

  if (insertErr) {
    console.error("[contact] insert failed", insertErr);
    return { ok: false, error: "Impossible d'enregistrer votre message." };
  }

  // Email best-effort vers la boîte de l'équipe.
  try {
    const inbox = process.env.CONTACT_INBOX_EMAIL ?? "contact@ishya.fr";
    if (process.env.RESEND_API_KEY) {
      await sendContactNotification(inbox, {
        name,
        email,
        subject: subject || null,
        message,
        receivedAt: new Date().toLocaleString("fr-FR", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "Europe/Paris",
        }),
        replyTo: email,
      });
    }
  } catch (err) {
    console.error("[contact] notification email failed", err);
  }

  return { ok: true, message: "Message envoyé ! Nous vous répondrons sous 24-48h." };
}
