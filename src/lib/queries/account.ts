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

export interface AccountAddress {
  id: string;
  label: string | null;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string;
  city: string;
  country: string;
  phone: string | null;
  type: "shipping" | "billing";
  isDefault: boolean;
}

export interface AccountWishlistItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  basePrice: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  inStock: boolean;
}

export interface AccountReturn {
  id: string;
  orderId: string;
  orderNumber: string | null;
  status: string;
  reason: string;
  description: string | null;
  refundAmount: number | null;
  trackingNumber: string | null;
  createdAt: string | null;
  approvedAt: string | null;
  receivedAt: string | null;
  refundedAt: string | null;
}

export interface AccountReturnableOrder {
  id: string;
  orderNumber: string;
  createdAt: string | null;
  status: string;
  items: Array<{
    id: string;
    productName: string;
    variantName: string | null;
    quantity: number;
    unitPrice: number;
    imageUrl: string | null;
  }>;
}

export interface AccountLoyaltyTransaction {
  id: string;
  type: "earn" | "redeem" | "expire" | "adjust";
  points: number;
  description: string | null;
  orderId: string | null;
  orderNumber: string | null;
  createdAt: string | null;
}

export interface AccountLoyaltySummary {
  points: number;
  tier: string;
  tiers: Array<{
    name: string;
    minPoints: number;
    pointsMultiplier: number;
    perks: string[];
  }>;
  transactions: AccountLoyaltyTransaction[];
}

export interface AccountNotificationPrefs {
  emailMarketing: boolean;
  emailOrderUpdates: boolean;
  emailReviewReplies: boolean;
  smsMarketing: boolean;
  smsOrderUpdates: boolean;
  pushEnabled: boolean;
}

export interface AccountReview {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImageUrl: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
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

export async function getCurrentUserAddresses(): Promise<AccountAddress[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("addresses")
    .select(
      "id, label, first_name, last_name, address_line1, address_line2, postal_code, city, country, phone, type, is_default",
    )
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getCurrentUserAddresses]", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    firstName: row.first_name,
    lastName: row.last_name,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    postalCode: row.postal_code,
    city: row.city,
    country: row.country,
    phone: row.phone,
    type: row.type,
    isDefault: row.is_default ?? false,
  }));
}

export async function getCurrentUserWishlist(): Promise<AccountWishlistItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("wishlists")
    .select(
      `id,
       product:products (
         id, name, slug, base_price, compare_at_price,
         product_media ( url, is_primary, sort_order ),
         product_variants ( stock_quantity )
       )`,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getCurrentUserWishlist]", error);
    return [];
  }

  type ProductWithMedia = {
    id: string;
    name: string;
    slug: string;
    base_price: number | string;
    compare_at_price: number | string | null;
    product_media: Array<{
      url: string;
      is_primary: boolean | null;
      sort_order: number | null;
    }>;
    product_variants: Array<{ stock_quantity: number }>;
  };

  return (data ?? [])
    .map((row) => {
      const raw = row.product as
        | ProductWithMedia
        | ProductWithMedia[]
        | null;
      const product = Array.isArray(raw) ? raw[0] : raw;
      if (!product) return null;
      const media = product.product_media ?? [];
      const primary =
        media.find((m) => m.is_primary) ??
        media
          .slice()
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
      const variants = product.product_variants ?? [];
      const inStock = variants.some((v) => (v.stock_quantity ?? 0) > 0);
      const result: AccountWishlistItem = {
        id: row.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        basePrice: Number(product.base_price ?? 0),
        compareAtPrice:
          product.compare_at_price != null
            ? Number(product.compare_at_price)
            : null,
        imageUrl: primary?.url ?? null,
        inStock,
      };
      return result;
    })
    .filter((it): it is AccountWishlistItem => it !== null);
}

export async function getCurrentUserReturns(): Promise<AccountReturn[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("returns")
    .select(
      `id, order_id, status, reason, description, refund_amount, tracking_number,
       created_at, approved_at, received_at, refunded_at,
       order:orders ( order_number )`,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getCurrentUserReturns]", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const order = Array.isArray(row.order)
      ? row.order[0]
      : (row.order as { order_number: string } | null);
    return {
      id: row.id,
      orderId: row.order_id,
      orderNumber: order?.order_number ?? null,
      status: row.status ?? "requested",
      reason: row.reason,
      description: row.description,
      refundAmount:
        row.refund_amount != null ? Number(row.refund_amount) : null,
      trackingNumber: row.tracking_number,
      createdAt: row.created_at,
      approvedAt: row.approved_at,
      receivedAt: row.received_at,
      refundedAt: row.refunded_at,
    };
  });
}

export async function getReturnableOrder(
  orderId: string,
): Promise<AccountReturnableOrder | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, order_number, status, created_at,
       order_items ( id, product_name_snapshot, variant_name_snapshot,
                     quantity, unit_price, product_id,
                     product:products (
                       product_media ( url, is_primary, sort_order )
                     ) )`,
    )
    .eq("id", orderId)
    .eq("user_id", user.id)
    .in("status", ["delivered", "shipped"])
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[getReturnableOrder]", error);
    return null;
  }

  type OrderItemRow = {
    id: string;
    product_name_snapshot: string;
    variant_name_snapshot: string | null;
    quantity: number;
    unit_price: number | string;
    product_id: string | null;
    product?:
      | {
          product_media: Array<{
            url: string;
            is_primary: boolean | null;
            sort_order: number | null;
          }>;
        }
      | Array<{
          product_media: Array<{
            url: string;
            is_primary: boolean | null;
            sort_order: number | null;
          }>;
        }>
      | null;
  };

  const items = (data.order_items ?? []) as OrderItemRow[];

  return {
    id: data.id,
    orderNumber: data.order_number,
    createdAt: data.created_at,
    status: data.status ?? "delivered",
    items: items.map((it) => {
      const product = Array.isArray(it.product) ? it.product[0] : it.product;
      const media = product?.product_media ?? [];
      const primary =
        media.find((m) => m.is_primary) ??
        media.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
      return {
        id: it.id,
        productName: it.product_name_snapshot,
        variantName: it.variant_name_snapshot,
        quantity: it.quantity,
        unitPrice: Number(it.unit_price),
        imageUrl: primary?.url ?? null,
      };
    }),
  };
}

export async function getCurrentUserLoyalty(): Promise<AccountLoyaltySummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fallback: AccountLoyaltySummary = {
    points: 0,
    tier: "bronze",
    tiers: [],
    transactions: [],
  };
  if (!user) return fallback;

  const [profileRes, tiersRes, txRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("loyalty_points, loyalty_tier")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("loyalty_tiers")
      .select("name, min_points, points_multiplier, perks")
      .order("min_points", { ascending: true }),
    supabase
      .from("loyalty_transactions")
      .select(
        `id, type, points, description, order_id, created_at,
         order:orders ( order_number )`,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return {
    points: profileRes.data?.loyalty_points ?? 0,
    tier: profileRes.data?.loyalty_tier ?? "bronze",
    tiers: (tiersRes.data ?? []).map((t) => {
      const perks = Array.isArray(t.perks)
        ? (t.perks as unknown as string[])
        : [];
      return {
        name: t.name,
        minPoints: t.min_points,
        pointsMultiplier: Number(t.points_multiplier ?? 1),
        perks,
      };
    }),
    transactions: (txRes.data ?? []).map((row) => {
      const order = Array.isArray(row.order)
        ? row.order[0]
        : (row.order as { order_number: string } | null);
      return {
        id: row.id,
        type: row.type as AccountLoyaltyTransaction["type"],
        points: row.points,
        description: row.description,
        orderId: row.order_id,
        orderNumber: order?.order_number ?? null,
        createdAt: row.created_at,
      };
    }),
  };
}

export async function getCurrentUserNotificationPrefs(): Promise<AccountNotificationPrefs> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const fallback: AccountNotificationPrefs = {
    emailMarketing: false,
    emailOrderUpdates: true,
    emailReviewReplies: true,
    smsMarketing: false,
    smsOrderUpdates: false,
    pushEnabled: false,
  };
  if (!user) return fallback;

  const { data } = await supabase
    .from("notification_preferences")
    .select(
      "email_marketing, email_order_updates, email_review_replies, sms_marketing, sms_order_updates, push_enabled",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return fallback;

  return {
    emailMarketing: data.email_marketing ?? false,
    emailOrderUpdates: data.email_order_updates ?? true,
    emailReviewReplies: data.email_review_replies ?? true,
    smsMarketing: data.sms_marketing ?? false,
    smsOrderUpdates: data.sms_order_updates ?? false,
    pushEnabled: data.push_enabled ?? false,
  };
}

export async function getCurrentUserReviews(): Promise<AccountReview[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `id, product_id, rating, title, body, is_approved, is_verified_purchase,
       created_at,
       product:products (
         name, slug,
         product_media ( url, is_primary, sort_order )
       )`,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getCurrentUserReviews]", error);
    return [];
  }

  type ProductRowReview = {
    name: string;
    slug: string;
    product_media: Array<{
      url: string;
      is_primary: boolean | null;
      sort_order: number | null;
    }>;
  };

  return (data ?? []).map((row) => {
    const raw = row.product as
      | ProductRowReview
      | ProductRowReview[]
      | null;
    const product = Array.isArray(raw) ? raw[0] : raw;
    const media = product?.product_media ?? [];
    const primary =
      media.find((m) => m.is_primary) ??
      media.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
    return {
      id: row.id,
      productId: row.product_id,
      productName: product?.name ?? "Produit inconnu",
      productSlug: product?.slug ?? "",
      productImageUrl: primary?.url ?? null,
      rating: row.rating ?? 0,
      title: row.title,
      body: row.body,
      isApproved: row.is_approved ?? false,
      isVerifiedPurchase: row.is_verified_purchase ?? false,
      createdAt: row.created_at,
    };
  });
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
