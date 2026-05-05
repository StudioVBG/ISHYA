import { createAdminClient } from "@/lib/supabase/admin";
import { NewsletterView, type NewsletterRow } from "./NewsletterView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Newsletter — Admin ISHYA",
};

interface RawNewsletterRow {
  id: string;
  email: string;
  source: string | null;
  subscribed_at: string | null;
  unsubscribed_at: string | null;
  unsubscribe_reason: string | null;
}

export default async function AdminNewsletterPage() {
  const admin = createAdminClient() as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        order: (
          c: string,
          o: { ascending: boolean },
        ) => Promise<{
          data: RawNewsletterRow[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };

  const { data, error } = await admin
    .from("newsletter_subscribers")
    .select("id, email, source, subscribed_at, unsubscribed_at, unsubscribe_reason")
    .order("subscribed_at", { ascending: false });

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
  }));

  return <NewsletterView rows={rows} />;
}
