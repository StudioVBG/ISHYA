import { createAdminClient } from "@/lib/supabase/admin";
import {
  AbandonedCartsView,
  type AbandonedCartRow,
} from "./AbandonedCartsView";

export const revalidate = 60;

export const metadata = {
  title: "Paniers abandonnés — Admin ISHYA",
};

export default async function AdminAbandonedCartsPage() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("abandoned_carts")
    .select(
      "id, cart_id, user_id, email, cart_total, items_snapshot, reminder_sent_at, reminders_count, recovered, recovered_order_id, abandoned_at",
    )
    .order("abandoned_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[AdminAbandonedCartsPage]", error);
  }

  const userIds = Array.from(
    new Set(
      (data ?? [])
        .map((c) => c.user_id)
        .filter((id): id is string => !!id),
    ),
  );

  const profilesById = new Map<
    string,
    { first_name: string | null; last_name: string | null; email: string | null }
  >();

  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      profilesById.set(p.id, {
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
      });
    }
  }

  const orderIds = Array.from(
    new Set(
      (data ?? [])
        .map((c) => c.recovered_order_id)
        .filter((id): id is string => !!id),
    ),
  );

  const ordersById = new Map<string, { order_number: string }>();
  if (orderIds.length > 0) {
    const { data: orders } = await admin
      .from("orders")
      .select("id, order_number")
      .in("id", orderIds);
    for (const o of orders ?? []) {
      ordersById.set(o.id, { order_number: o.order_number });
    }
  }

  const rows: AbandonedCartRow[] = (data ?? []).map((c) => {
    const profile = c.user_id ? profilesById.get(c.user_id) : null;
    const fullName =
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      null;
    const order = c.recovered_order_id
      ? ordersById.get(c.recovered_order_id)
      : null;

    let itemsCount = 0;
    if (Array.isArray(c.items_snapshot)) {
      itemsCount = c.items_snapshot.length;
    } else if (
      c.items_snapshot &&
      typeof c.items_snapshot === "object" &&
      Array.isArray((c.items_snapshot as { items?: unknown[] }).items)
    ) {
      itemsCount = (c.items_snapshot as { items: unknown[] }).items.length;
    }

    return {
      id: c.id,
      email: c.email ?? profile?.email ?? null,
      customerName: fullName,
      cartTotal: c.cart_total != null ? Number(c.cart_total) : null,
      itemsCount,
      reminderSentAt: c.reminder_sent_at,
      remindersCount: c.reminders_count ?? 0,
      recovered: c.recovered ?? false,
      recoveredOrderNumber: order?.order_number ?? null,
      recoveredOrderId: c.recovered_order_id,
      abandonedAt: c.abandoned_at,
    };
  });

  return <AbandonedCartsView rows={rows} />;
}
