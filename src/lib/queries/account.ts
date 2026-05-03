import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AccountOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "partially_refunded"
  | "on_hold"
  | "failed";

export interface AccountOrderListItem {
  id: string;
  orderNumber: string;
  status: AccountOrderStatus;
  total: number;
  createdAt: string;
  itemNames: string[];
  itemCount: number;
}

export interface AccountOrderDetail extends AccountOrderListItem {
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  giftWrap: boolean;
  giftMessage: string | null;
  shippingAddress: Record<string, string> | null;
  items: Array<{
    id: string;
    productName: string;
    variantName: string | null;
    sku: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  shipment: {
    trackingNumber: string | null;
    carrier: string | null;
    shippedAt: string | null;
    estimatedDelivery: string | null;
    deliveredAt: string | null;
  } | null;
}

export interface AccountProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  birthDate: string | null;
  loyaltyPoints: number;
  loyaltyTier: string;
  newsletterOptin: boolean;
  createdAt: string | null;
}

export interface AccountStats {
  ordersCount: number;
  loyaltyPoints: number;
  loyaltyTier: string;
  wishlistCount: number;
  reviewsCount: number;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserProfile(): Promise<AccountProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileResult, prefsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, phone, date_of_birth, loyalty_points, loyalty_tier, created_at",
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("notification_preferences")
      .select("email_marketing")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return {
    id: user.id,
    email: user.email ?? "",
    firstName: profileResult.data?.first_name ?? null,
    lastName: profileResult.data?.last_name ?? null,
    phone: profileResult.data?.phone ?? null,
    birthDate: profileResult.data?.date_of_birth ?? null,
    loyaltyPoints: profileResult.data?.loyalty_points ?? 0,
    loyaltyTier: profileResult.data?.loyalty_tier ?? "bronze",
    newsletterOptin: prefsResult.data?.email_marketing ?? false,
    createdAt: profileResult.data?.created_at ?? null,
  };
}

export async function getCurrentUserOrders(): Promise<AccountOrderListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, order_number, status, grand_total, created_at,
       order_items ( product_name_snapshot )`,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[getCurrentUserOrders]", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const items = (row.order_items ?? []) as Array<{
      product_name_snapshot: string;
    }>;
    return {
      id: row.id,
      orderNumber: row.order_number,
      status: (row.status ?? "pending") as AccountOrderStatus,
      total: Number(row.grand_total ?? 0),
      createdAt: row.created_at ?? new Date().toISOString(),
      itemNames: items.map((it) => it.product_name_snapshot),
      itemCount: items.length,
    };
  });
}

export async function getCurrentUserOrderByNumber(
  orderNumber: string,
): Promise<AccountOrderDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, order_number, status, grand_total, subtotal, shipping_total,
       discount_total, gift_wrap, gift_message, shipping_address_snapshot,
       created_at, shipped_at, delivered_at,
       order_items ( id, product_name_snapshot, variant_name_snapshot, sku_snapshot,
                     quantity, unit_price, total ),
       shipments ( tracking_number, carrier, shipped_at, estimated_delivery,
                   delivered_at )`,
    )
    .eq("user_id", user.id)
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[getCurrentUserOrderByNumber]", error);
    return null;
  }

  const items = (data.order_items ?? []) as Array<{
    id: string;
    product_name_snapshot: string;
    variant_name_snapshot: string | null;
    sku_snapshot: string | null;
    quantity: number;
    unit_price: number | string;
    total: number | string;
  }>;

  const shipments = (data.shipments ?? []) as Array<{
    tracking_number: string | null;
    carrier: string | null;
    shipped_at: string | null;
    estimated_delivery: string | null;
    delivered_at: string | null;
  }>;

  return {
    id: data.id,
    orderNumber: data.order_number,
    status: (data.status ?? "pending") as AccountOrderStatus,
    total: Number(data.grand_total ?? 0),
    subtotal: Number(data.subtotal ?? 0),
    shippingTotal: Number(data.shipping_total ?? 0),
    discountTotal: Number(data.discount_total ?? 0),
    giftWrap: data.gift_wrap ?? false,
    giftMessage: data.gift_message ?? null,
    shippingAddress: (data.shipping_address_snapshot ?? null) as Record<
      string,
      string
    > | null,
    createdAt: data.created_at ?? new Date().toISOString(),
    itemCount: items.length,
    itemNames: items.map((it) => it.product_name_snapshot),
    items: items.map((it) => ({
      id: it.id,
      productName: it.product_name_snapshot,
      variantName: it.variant_name_snapshot,
      sku: it.sku_snapshot,
      quantity: it.quantity,
      unitPrice: Number(it.unit_price),
      total: Number(it.total),
    })),
    shipment: shipments[0]
      ? {
          trackingNumber: shipments[0].tracking_number,
          carrier: shipments[0].carrier,
          shippedAt: shipments[0].shipped_at,
          estimatedDelivery: shipments[0].estimated_delivery,
          deliveredAt: shipments[0].delivered_at,
        }
      : null,
  };
}

export async function getCurrentUserStats(): Promise<AccountStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ordersCount: 0,
      loyaltyPoints: 0,
      loyaltyTier: "bronze",
      wishlistCount: 0,
      reviewsCount: 0,
    };
  }

  const [profile, orders, wishlist, reviews] = await Promise.all([
    supabase
      .from("profiles")
      .select("loyalty_points, loyalty_tier")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("wishlists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return {
    ordersCount: orders.count ?? 0,
    loyaltyPoints: profile.data?.loyalty_points ?? 0,
    loyaltyTier: profile.data?.loyalty_tier ?? "bronze",
    wishlistCount: wishlist.count ?? 0,
    reviewsCount: reviews.count ?? 0,
  };
}
