import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NewsletterView, type NewsletterRow } from "./NewsletterView";

export const revalidate = 60;

// Limite de chargement pour éviter de tirer toute la table en RAM.
// Au-delà, prévoir une vraie pagination cursor (P2).
const PAGE_LIMIT = 1000;

export const metadata = {
  title: "Newsletter — Admin ISHYA",
};

export default async function AdminNewsletterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?redirect_to=/admin/newsletter");

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("newsletter_subscribers")
    .select(
      "id, email, source, subscribed_at, unsubscribed_at, unsubscribe_reason, confirmed_at, marketing_consent, bounce_count, last_bounced_at, last_bounce_type, last_bounce_reason",
    )
    .order("subscribed_at", { ascending: false })
    .limit(PAGE_LIMIT);

  if (error) {
    console.error("[AdminNewsletterPage]", error);
  }

  const rows: NewsletterRow[] = (data ?? []).map((r) => ({
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
  }));

  return <NewsletterView rows={rows} totalLimit={PAGE_LIMIT} />;
}
