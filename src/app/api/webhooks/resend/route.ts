import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySvixSignature } from "@/lib/webhooks/svix-signature";
import { hasEmailBeenSent, logEmailSent } from "@/lib/email-logs";

export const dynamic = "force-dynamic";

// Auto-désinscription après ce nombre de soft bounces
const SOFT_BOUNCE_THRESHOLD = 3;

interface ResendBounceEvent {
  type: "email.bounced";
  data: {
    to: string[] | string;
    bounce?: {
      type?: "hard" | "soft" | "transient";
      message?: string;
    };
  };
}

interface ResendComplaintEvent {
  type: "email.complained";
  data: {
    to: string[] | string;
  };
}

type ResendEvent =
  | ResendBounceEvent
  | ResendComplaintEvent
  | { type: string; data: unknown };

function asEmail(value: string[] | string | undefined): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

/**
 * Webhook Resend pour le bounce handling de la newsletter.
 *
 * Événements traités :
 * - `email.bounced` (type=`hard`) → désabonnement immédiat
 * - `email.bounced` (type=`soft` | `transient`) → incrément du compteur ;
 *   désabonnement si seuil atteint
 * - `email.complained` (plainte spam) → désabonnement immédiat
 *
 * Idempotence : on déduplique sur `svix-id` via la table `email_logs`.
 *
 * Configuration Resend : Dashboard → Webhooks → Add endpoint
 *   URL: https://ishya.fr/api/webhooks/resend
 *   Events: email.bounced, email.complained
 *   Le secret généré par Resend doit être posé dans
 *   `RESEND_WEBHOOK_SECRET` côté Vercel.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhooks/resend] RESEND_WEBHOOK_SECRET non configuré");
    return Response.json({ error: "not-configured" }, { status: 503 });
  }

  // Lire le body brut pour la vérif HMAC
  const body = await request.text();

  const verifyError = verifySvixSignature({
    body,
    headers: {
      "svix-id": request.headers.get("svix-id"),
      "svix-timestamp": request.headers.get("svix-timestamp"),
      "svix-signature": request.headers.get("svix-signature"),
    },
    secret,
  });
  if (verifyError) {
    console.error("[webhooks/resend] signature invalid:", verifyError);
    return Response.json(
      { error: "invalid-signature", reason: verifyError },
      { status: 401 },
    );
  }

  const svixId = request.headers.get("svix-id") ?? "";

  // Idempotence : si on a déjà traité ce message, on répond 200 sans rien faire
  if (svixId && (await hasEmailBeenSent("resend_webhook", svixId))) {
    return Response.json({ ok: true, dedup: true });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(body) as ResendEvent;
  } catch {
    return Response.json({ error: "invalid-json" }, { status: 400 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  if (event.type === "email.bounced") {
    const data = (event as ResendBounceEvent).data;
    const email = asEmail(data.to);
    const bounceType = data.bounce?.type ?? "soft";
    const reason = data.bounce?.message ?? null;

    if (!email) {
      console.warn("[webhooks/resend] email.bounced sans destinataire");
    } else {
      const isHard = bounceType === "hard";

      // Lecture pour incrémenter atomiquement
      const { data: subscriber } = await admin
        .from("newsletter_subscribers")
        .select("id, bounce_count")
        .ilike("email", email)
        .maybeSingle();

      if (subscriber) {
        const newCount = (subscriber.bounce_count ?? 0) + 1;
        const shouldUnsubscribe =
          isHard || newCount >= SOFT_BOUNCE_THRESHOLD;

        const update: Record<string, unknown> = {
          bounce_count: newCount,
          last_bounced_at: now,
          last_bounce_type: bounceType,
          last_bounce_reason: reason,
        };
        if (shouldUnsubscribe) {
          update.unsubscribed_at = now;
          update.unsubscribe_reason = isHard
            ? "Hard bounce (Resend)"
            : `${SOFT_BOUNCE_THRESHOLD} soft bounces (Resend)`;
          update.marketing_consent = false;
        }

        await admin
          .from("newsletter_subscribers")
          .update(update)
          .eq("id", subscriber.id);
      }
    }
  } else if (event.type === "email.complained") {
    const data = (event as ResendComplaintEvent).data;
    const email = asEmail(data.to);
    if (email) {
      await admin
        .from("newsletter_subscribers")
        .update({
          unsubscribed_at: now,
          unsubscribe_reason: "Plainte spam (Resend)",
          marketing_consent: false,
          last_bounced_at: now,
          last_bounce_type: "complaint",
        })
        .ilike("email", email);
    }
  }
  // Autres événements (email.sent, email.delivered, email.opened, etc.) :
  // ignorés silencieusement — on log l'idempotence quand même pour ne pas
  // re-traiter en cas de retry.

  if (svixId) {
    await logEmailSent({
      email: "system",
      emailType: "resend_webhook",
      dedupKey: svixId,
      metadata: { event_type: event.type },
    });
  }

  return Response.json({ ok: true });
}
