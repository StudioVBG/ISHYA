import { createClient } from "@/lib/supabase/server";

export interface AdminNotificationCounts {
  pendingOrders: number;
  pendingReturns: number;
  openTickets: number;
  unmoderatedReviews: number;
  /** Abonnés newsletter ayant bouncé dans les 7 derniers jours. */
  recentBounces: number;
  total: number;
}

const BOUNCE_WINDOW_DAYS = 7;

// Compteurs pour la cloche de notifications du back-office. Léger et
// indépendant des stats du dashboard pour ne pas tirer une grosse requête à
// chaque rendu de l'admin shell.
export async function getAdminNotificationCounts(): Promise<AdminNotificationCounts> {
  const supabase = await createClient();
  const sinceIso = new Date(
    Date.now() - BOUNCE_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [orders, returns, tickets, reviews, bounces] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("returns")
      .select("id", { count: "exact", head: true })
      .eq("status", "requested"),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "in_progress", "waiting_internal"]),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("is_approved", false),
    // Index partiel `idx_newsletter_subscribers_bounced` (migration 015)
    // → cette query reste un Index Scan O(log N).
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .gt("bounce_count", 0)
      .gte("last_bounced_at", sinceIso),
  ]);

  const pendingOrders = orders.count ?? 0;
  const pendingReturns = returns.count ?? 0;
  const openTickets = tickets.count ?? 0;
  const unmoderatedReviews = reviews.count ?? 0;
  const recentBounces = bounces.count ?? 0;

  return {
    pendingOrders,
    pendingReturns,
    openTickets,
    unmoderatedReviews,
    recentBounces,
    total:
      pendingOrders +
      pendingReturns +
      openTickets +
      unmoderatedReviews +
      recentBounces,
  };
}
