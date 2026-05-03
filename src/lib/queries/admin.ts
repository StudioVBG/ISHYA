import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
  customerEmail: string | null;
  customerName: string | null;
}

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  basePrice: number;
  isActive: boolean;
  isFeatured: boolean;
  category: string | null;
  totalStock: number;
  imageUrl: string | null;
}

export interface AdminLowStockRow {
  variantId: string;
  productName: string;
  productSlug: string;
  variantSku: string | null;
  variantSize: string | null;
  variantMaterial: string | null;
  quantity: number;
  threshold: number;
}

export interface AdminVariantStockRow {
  variantId: string;
  productName: string;
  productSlug: string;
  sku: string | null;
  variantLabel: string;
  quantity: number;
  threshold: number;
  isActive: boolean;
}

export interface AdminDashboardStats {
  todayRevenue: number;
  todayOrders: number;
  averageBasket: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockCount: number;
  pendingReturns: number;
  openTickets: number;
  revenueByDay: Array<{ day: string; ca: number }>;
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    imageUrl: string | null;
  }>;
}

export async function getAdminOrders(filters?: {
  status?: string;
  search?: string;
  limit?: number;
}): Promise<AdminOrderListItem[]> {
  const admin = createAdminClient();
  const limit = filters?.limit ?? 100;

  let query = admin
    .from("orders")
    .select(
      `id, order_number, status, grand_total, email, created_at,
       shipping_address_snapshot,
       order_items ( id )`,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters?.status) {
    query = query.eq(
      "status",
      filters.status as
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
        | "partially_refunded"
        | "on_hold"
        | "failed",
    );
  }
  if (filters?.search) {
    query = query.ilike("order_number", `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getAdminOrders]", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const items = (row.order_items ?? []) as Array<{ id: string }>;
    const addr = (row.shipping_address_snapshot ?? {}) as Record<
      string,
      string | undefined
    >;
    const customerName =
      [addr.firstName, addr.lastName].filter(Boolean).join(" ") || null;

    return {
      id: row.id,
      orderNumber: row.order_number,
      status: row.status ?? "pending",
      total: Number(row.grand_total ?? 0),
      itemCount: items.length,
      createdAt: row.created_at ?? new Date().toISOString(),
      customerEmail: row.email,
      customerName,
    };
  });
}

export async function getAdminProducts(): Promise<AdminProductRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select(
      `id, name, slug, sku, base_price, is_active, is_featured,
       category:categories ( name ),
       product_variants ( stock_quantity ),
       product_media ( url, is_primary, sort_order )`,
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[getAdminProducts]", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const variants = (row.product_variants ?? []) as Array<{
      stock_quantity: number;
    }>;
    const media = (row.product_media ?? []) as Array<{
      url: string;
      is_primary: boolean | null;
      sort_order: number | null;
    }>;
    const primary =
      media.find((m) => m.is_primary) ??
      media.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
    const category = Array.isArray(row.category)
      ? row.category[0]?.name
      : (row.category as { name: string } | null)?.name;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      sku: row.sku ?? null,
      basePrice: Number(row.base_price ?? 0),
      isActive: row.is_active ?? false,
      isFeatured: row.is_featured ?? false,
      category: category ?? null,
      totalStock: variants.reduce((s, v) => s + (v.stock_quantity ?? 0), 0),
      imageUrl: primary?.url ?? null,
    };
  });
}

export async function getAdminLowStock(): Promise<AdminLowStockRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_variants")
    .select(
      `id, sku, size, material_variant, stock_quantity, low_stock_threshold,
       product:products ( name, slug )`,
    )
    .eq("is_active", true)
    .order("stock_quantity", { ascending: true })
    .limit(50);

  if (error) {
    console.error("[getAdminLowStock]", error);
    return [];
  }

  return (data ?? [])
    .filter(
      (row) =>
        (row.stock_quantity ?? 0) <= (row.low_stock_threshold ?? 5),
    )
    .map((row) => {
      const product = Array.isArray(row.product)
        ? row.product[0]
        : (row.product as { name: string; slug: string } | null);
      return {
        variantId: row.id,
        productName: product?.name ?? "Produit inconnu",
        productSlug: product?.slug ?? "",
        variantSku: row.sku ?? null,
        variantSize: row.size ?? null,
        variantMaterial: row.material_variant ?? null,
        quantity: row.stock_quantity ?? 0,
        threshold: row.low_stock_threshold ?? 5,
      };
    });
}

export async function getAdminVariantStocks(): Promise<AdminVariantStockRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_variants")
    .select(
      `id, sku, size, material_variant, stone, length_cm, stock_quantity,
       low_stock_threshold, is_active,
       product:products ( name, slug )`,
    )
    .order("stock_quantity", { ascending: true })
    .limit(500);

  if (error) {
    console.error("[getAdminVariantStocks]", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const product = Array.isArray(row.product)
      ? row.product[0]
      : (row.product as { name: string; slug: string } | null);
    const labelParts = [
      row.size,
      row.material_variant,
      row.stone,
      row.length_cm ? `${row.length_cm}cm` : null,
    ].filter(Boolean);
    return {
      variantId: row.id,
      productName: product?.name ?? "Produit inconnu",
      productSlug: product?.slug ?? "",
      sku: row.sku ?? null,
      variantLabel: labelParts.join(" · ") || "Standard",
      quantity: row.stock_quantity ?? 0,
      threshold: row.low_stock_threshold ?? 5,
      isActive: row.is_active ?? true,
    };
  });
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const admin = createAdminClient();
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const start30 = new Date(now);
  start30.setDate(start30.getDate() - 30);
  start30.setHours(0, 0, 0, 0);

  const [todayOrders, last30Orders, customersCount, pendingOrders, lowStock, pendingReturns, openTickets, topItems] =
    await Promise.all([
      admin
        .from("orders")
        .select("grand_total", { count: "exact" })
        .gte("created_at", startOfToday.toISOString())
        .in("status", [
          "confirmed",
          "processing",
          "shipped",
          "delivered",
        ]),
      admin
        .from("orders")
        .select("grand_total, created_at")
        .gte("created_at", start30.toISOString())
        .in("status", [
          "confirmed",
          "processing",
          "shipped",
          "delivered",
        ]),
      admin
        .from("profiles")
        .select("id", { count: "exact", head: true }),
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      getAdminLowStock(),
      admin
        .from("returns")
        .select("id", { count: "exact", head: true })
        .eq("status", "requested"),
      admin
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "in_progress", "waiting_customer"]),
      admin
        .from("order_items")
        .select(
          `product_id, product_name_snapshot, quantity, total,
           product:products ( id, name,
             product_media ( url, is_primary, sort_order )
           )`,
        )
        .gte("created_at", start30.toISOString())
        .limit(500),
    ]);

  // Today
  const todayList = (todayOrders.data ?? []) as Array<{
    grand_total: number | string;
  }>;
  const todayRevenue = todayList.reduce(
    (sum, o) => sum + Number(o.grand_total ?? 0),
    0,
  );
  const todayOrderCount = todayList.length;

  // Average basket on the last 30 days
  const last30List = (last30Orders.data ?? []) as Array<{
    grand_total: number | string;
    created_at: string | null;
  }>;
  const last30Total = last30List.reduce(
    (sum, o) => sum + Number(o.grand_total ?? 0),
    0,
  );
  const averageBasket = last30List.length
    ? last30Total / last30List.length
    : 0;

  // Revenue by day (30d)
  const dayMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const o of last30List) {
    if (!o.created_at) continue;
    const key = o.created_at.slice(0, 10);
    if (dayMap.has(key)) {
      dayMap.set(key, (dayMap.get(key) ?? 0) + Number(o.grand_total ?? 0));
    }
  }
  const revenueByDay = Array.from(dayMap.entries()).map(([date, ca]) => ({
    day: `${date.slice(8, 10)}/${date.slice(5, 7)}`,
    ca: Math.round(ca),
  }));

  // Top products
  const productAgg = new Map<
    string,
    { id: string; name: string; quantity: number; revenue: number; imageUrl: string | null }
  >();
  const topItemsRows = (topItems.data ?? []) as Array<{
    product_id: string | null;
    product_name_snapshot: string;
    quantity: number;
    total: number | string;
    product?:
      | {
          id: string;
          name: string;
          product_media: Array<{
            url: string;
            is_primary: boolean | null;
            sort_order: number | null;
          }>;
        }
      | Array<{
          id: string;
          name: string;
          product_media: Array<{
            url: string;
            is_primary: boolean | null;
            sort_order: number | null;
          }>;
        }>
      | null;
  }>;

  for (const item of topItemsRows) {
    if (!item.product_id) continue;
    const product = Array.isArray(item.product)
      ? item.product[0]
      : item.product;
    const prev = productAgg.get(item.product_id);
    const media = product?.product_media ?? [];
    const primary =
      media.find((m) => m.is_primary) ??
      media
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
    productAgg.set(item.product_id, {
      id: item.product_id,
      name: product?.name ?? item.product_name_snapshot,
      quantity: (prev?.quantity ?? 0) + item.quantity,
      revenue: (prev?.revenue ?? 0) + Number(item.total ?? 0),
      imageUrl: prev?.imageUrl ?? primary?.url ?? null,
    });
  }
  const topProducts = Array.from(productAgg.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    todayRevenue: Math.round(todayRevenue * 100) / 100,
    todayOrders: todayOrderCount,
    averageBasket: Math.round(averageBasket * 100) / 100,
    totalCustomers: customersCount.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    lowStockCount: lowStock.length,
    pendingReturns: pendingReturns.count ?? 0,
    openTickets: openTickets.count ?? 0,
    revenueByDay,
    topProducts,
  };
}
