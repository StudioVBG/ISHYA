import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Confirme un abonnement newsletter via le token de double opt-in envoyé par
 * email. Une fois confirmé, le subscriber recevra les emails marketing —
 * jusque-là, son consentement est considéré comme non-vérifié et il ne reçoit
 * **rien** (RGPD : pas d'email marketing sans double opt-in).
 *
 * GET /api/newsletter/confirm?token=<uuid>
 *   - 302 → /newsletter/confirme?status=ok      si confirmation OK
 *   - 302 → /newsletter/confirme?status=invalid si token invalide / expiré
 *   - 302 → /newsletter/confirme?status=already si déjà confirmé
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const trimmed = token.trim();
  const baseUrl = request.nextUrl.origin;
  const successUrl = (status: "ok" | "invalid" | "already") =>
    NextResponse.redirect(`${baseUrl}/newsletter/confirme?status=${status}`, {
      status: 302,
    });

  // Validation basique du format token (UUID v4 attendu mais on reste permissif)
  if (!trimmed || trimmed.length < 16 || trimmed.length > 100) {
    return successUrl("invalid");
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return successUrl("invalid");
  }

  const table = admin.from("newsletter_subscribers" as never);

  const { data: subscriber } = await table
    .select("id, email, confirmed_at")
    .eq("confirmation_token", trimmed)
    .maybeSingle<{
      id: string;
      email: string;
      confirmed_at: string | null;
    }>();

  if (!subscriber) {
    return successUrl("invalid");
  }

  // Idempotence : si déjà confirmé, on ne renvoie pas un nouvel email mais on
  // affiche un message "déjà confirmé" plutôt qu'une erreur.
  if (subscriber.confirmed_at) {
    return successUrl("already");
  }

  const now = new Date().toISOString();
  const { error: updateError } = await table
    .update({
      confirmed_at: now,
      confirmation_token: null, // token consommé : ne peut plus être réutilisé
      unsubscribed_at: null,
      unsubscribe_reason: null,
    } as never)
    .eq("id", subscriber.id);

  if (updateError) {
    console.error("[newsletter/confirm] update", updateError);
    return successUrl("invalid");
  }

  // Bienvenue + code -10 % — envoyé seulement après confirmation effective
  // (avant, on ne sait pas si l'adresse appartient bien au visiteur).
  try {
    if (process.env.RESEND_API_KEY) {
      await sendWelcomeEmail(subscriber.email, { firstName: "" });
    }
  } catch (err) {
    console.error("[newsletter/confirm] welcome email failed", err);
  }

  return successUrl("ok");
}
