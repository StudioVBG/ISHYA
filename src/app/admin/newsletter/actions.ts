"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";
import { sendNewsletterConfirmation } from "@/lib/email";
import { decodeCursor, encodeCursor, type NewsletterRow } from "./types";

function buildConfirmUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ishya.fr";
  return `${base}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
}

export async function unsubscribeNewsletter(
  id: string,
  reason: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("newsletter_subscribers")
    .update({
      unsubscribed_at: new Date().toISOString(),
      unsubscribe_reason: reason,
      // Le consentement est révoqué : sans nouveau consentement explicite, on
      // n'enverra plus rien, même si la ligne reste en DB pour traçabilité.
      marketing_consent: false,
      // Le token éventuellement en attente est purgé (plus de confirmation
      // possible jusqu'à un nouveau cycle).
      confirmation_token: null,
    })
    .eq("id", id);

  if (error) {
    console.error("[unsubscribeNewsletter]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "newsletter_subscribers",
    recordId: id,
    newData: { unsubscribed: true, reason, marketing_consent: false },
  });

  revalidatePath("/admin/newsletter");
  return { ok: true };
}

/**
 * Réabonne un email après désabonnement. **RGPD : on ne peut pas réabonner
 * directement** — seul le client peut redonner son consentement. L'admin
 * peut uniquement déclencher l'envoi d'un nouvel email de confirmation
 * (double opt-in), et ce seulement si elle/il atteste avoir reçu une
 * demande explicite du client.
 */
export async function resubscribeNewsletter(
  id: string,
  options: { acknowledgedConsent: boolean },
): Promise<{ ok: boolean; error?: string }> {
  if (!options.acknowledgedConsent) {
    return {
      ok: false,
      error:
        "RGPD : un admin ne peut pas réabonner sans le consentement explicite du client. Cochez l'attestation pour déclencher un email de confirmation.",
    };
  }

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("newsletter_subscribers")
    .select("email")
    .eq("id", id)
    .maybeSingle();

  if (!existing?.email) {
    return { ok: false, error: "Abonné introuvable" };
  }

  const token = randomUUID();
  const { error } = await admin
    .from("newsletter_subscribers")
    .update({
      // L'admin lève la désinscription côté DB, mais le consentement n'est
      // pas restauré tant que le client ne confirme pas via l'email.
      unsubscribed_at: null,
      unsubscribe_reason: null,
      marketing_consent: false,
      confirmed_at: null,
      confirmation_token: token,
    })
    .eq("id", id);
  if (error) {
    console.error("[resubscribeNewsletter] update", error);
    return { ok: false, error: "Erreur" };
  }

  // Envoi du nouvel email de confirmation au client. Sans clic de sa part,
  // il ne recevra aucun email marketing — c'est lui qui doit consentir.
  try {
    if (process.env.RESEND_API_KEY) {
      await sendNewsletterConfirmation(existing.email, {
        confirmUrl: buildConfirmUrl(token),
      });
    }
  } catch (err) {
    console.error("[resubscribeNewsletter] confirmation email", err);
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "newsletter_subscribers",
    recordId: id,
    newData: {
      action: "resubscribe_confirmation_sent",
      acknowledged_consent: true,
    },
  });

  revalidatePath("/admin/newsletter");
  return { ok: true };
}

export async function deleteNewsletterSubscriber(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("newsletter_subscribers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteNewsletterSubscriber]", error);
    return { ok: false, error: "Erreur de suppression" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "delete",
    tableName: "newsletter_subscribers",
    recordId: id,
  });

  revalidatePath("/admin/newsletter");
  return { ok: true };
}

const NEWSLETTER_SELECT =
  "id, email, source, subscribed_at, unsubscribed_at, unsubscribe_reason, confirmed_at, marketing_consent, bounce_count, last_bounced_at, last_bounce_type, last_bounce_reason";

const MAX_PAGE_SIZE = 200;
const DEFAULT_PAGE_SIZE = 100;

interface RawNewsletterRow {
  id: string;
  email: string;
  source: string | null;
  subscribed_at: string | null;
  unsubscribed_at: string | null;
  unsubscribe_reason: string | null;
  confirmed_at: string | null;
  marketing_consent: boolean | null;
  bounce_count: number | null;
  last_bounced_at: string | null;
  last_bounce_type: string | null;
  last_bounce_reason: string | null;
}

function mapNewsletterRow(r: RawNewsletterRow): NewsletterRow {
  return {
    id: r.id,
    email: r.email,
    source: r.source,
    subscribedAt: r.subscribed_at,
    unsubscribedAt: r.unsubscribed_at,
    unsubscribeReason: r.unsubscribe_reason,
    confirmedAt: r.confirmed_at ?? null,
    marketingConsent: r.marketing_consent ?? false,
    bounceCount: r.bounce_count ?? 0,
    lastBouncedAt: r.last_bounced_at ?? null,
    lastBounceType: r.last_bounce_type ?? null,
    lastBounceReason: r.last_bounce_reason ?? null,
  };
}

/**
 * Pagination cursor — ordonné par `(subscribed_at desc, id desc)`.
 *
 * - `cursor: null` → première page (les plus récents).
 * - `cursor: "<subscribed_at>|<id>"` → page suivante (strictement avant).
 * - `withTotal: true` → calcule aussi `total` (à appeler une seule fois,
 *   c'est un COUNT(*) exact qui peut être lent sur très grosse table).
 */
export async function loadNewsletterPage(
  cursor: string | null,
  pageSize: number = DEFAULT_PAGE_SIZE,
  options: { withTotal?: boolean } = {},
): Promise<{
  ok: boolean;
  error?: string;
  data?: { rows: NewsletterRow[]; nextCursor: string | null; total?: number };
}> {
  const auth = await requireAdminRole();
  if (!auth.ok) return { ok: false, error: auth.error };

  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSize));

  const admin = createAdminClient();
  let query = admin
    .from("newsletter_subscribers")
    // Si withTotal : on demande le count exact en un seul aller-retour.
    .select(NEWSLETTER_SELECT, options.withTotal ? { count: "exact" } : {})
    .order("subscribed_at", { ascending: false })
    .order("id", { ascending: false })
    // +1 pour détecter hasMore sans seconde requête.
    .limit(limit + 1);

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (!decoded) return { ok: false, error: "Cursor invalide" };
    // Tuple comparison via `or` : strict < sur (subscribed_at, id).
    query = query.or(
      `subscribed_at.lt.${decoded.subscribedAt},and(subscribed_at.eq.${decoded.subscribedAt},id.lt.${decoded.id})`,
    );
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[loadNewsletterPage]", error);
    return { ok: false, error: "Erreur de chargement" };
  }

  const all = (data ?? []) as RawNewsletterRow[];
  const hasMore = all.length > limit;
  const sliced = hasMore ? all.slice(0, limit) : all;
  const rows = sliced.map(mapNewsletterRow);
  const last = sliced[sliced.length - 1];
  const nextCursor =
    hasMore && last?.subscribed_at
      ? encodeCursor(last.subscribed_at, last.id)
      : null;

  return {
    ok: true,
    data: {
      rows,
      nextCursor,
      total: options.withTotal ? (count ?? undefined) : undefined,
    },
  };
}
