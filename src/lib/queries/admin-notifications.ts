import { createClient } from "@/lib/supabase/server";

export interface AdminNotificationCounts {
  pendingOrders: number;
  pendingReturns: number;
  openTickets: number;
  unmoderatedReviews: number;
  total: number;
}

// Compteurs pour la cloche de notifications du back-office. Léger et
// indépendant des stats du dashboard pour ne pas tirer une grosse requête à
// chaque rendu de l'admin shell.
export async function getAdminNotificationCounts(): Promise<AdminNotificationCounts> {
  const supabase = await createClient();

  const [orders, returns, tickets, reviews] = await Promise.all([
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
  ]);

  const pendingOrders = orders.count ?? 0;
  const pendingReturns = returns.count ?? 0;
  const openTickets = tickets.count ?? 0;
  const unmoderatedReviews = reviews.count ?? 0;

  return {
    pendingOrders,
    pendingReturns,
    openTickets,
    unmoderatedReviews,
    total: pendingOrders + pendingReturns + openTickets + unmoderatedReviews,
  };
}
