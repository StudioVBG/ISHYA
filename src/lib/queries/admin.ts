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

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  email: string | null;
  phone: string | null;
  userId: string | null;
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  giftWrap: boolean;
  giftMessage: string | null;
  customerNote: string | null;
  internalNote: string | null;
  shippingAddress: Record<string, string> | null;
  billingAddress: Record<string, string> | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  items: Array<{
    id: string;
    productId: string | null;
    variantId: string | null;
    productName: string;
    variantName: string | null;
    sku: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  payment: {
    id: string;
    status: string | null;
    method: string | null;
    amount: number;
    stripePaymentIntentId: string | null;
    stripeChargeId: string | null;
    stripeReceiptUrl: string | null;
    paidAt: string | null;
    refundedAt: string | null;
  } | null;
  shipment: {
    id: string;
    trackingNumber: string | null;
    carrier: string | null;
    status: string | null;
    shippedAt: string | null;
    estimatedDelivery: string | null;
    deliveredAt: string | null;
  } | null;
}

export interface AdminCategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface AdminCategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  parentName: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

export interface AdminCollectionRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

export interface AdminCollectionOption {
  id: string;
  name: string;
  slug: string;
}

export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  sku: string | null;
  categoryId: string | null;
  collectionId: string | null;
  material: string | null;
  weightG: number | null;
  dimensions: string | null;
  careInstructions: string | null;
  isNickelFree: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string | null;
  variants: Array<{
    id: string;
    sku: string | null;
    name: string | null;
    size: string | null;
    materialVariant: string | null;
    stone: string | null;
    color: string | null;
    lengthCm: number | null;
    priceOverride: number | null;
    stockQuantity: number;
    lowStockThreshold: number;
    weightG: number | null;
    isActive: boolean;
  }>;
  media: Array<{
    id: string;
    url: string;
    altText: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }>;
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

export interface AdminClientRow {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  loyaltyTier: string;
  loyaltyPoints: number;
  createdAt: string | null;
  ordersCount: number;
  totalSpent: number;
}

export interface AdminPromotionRow {
  id: string;
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y";
  discountValue: number;
  minimumOrderAmount: number | null;
  maximumDiscount: number | null;
  perUserLimit: number | null;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

export interface AdminBannerRow {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  placement: string;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminReviewRow {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  userId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string | null;
}

export interface AdminTeamMember {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string | null;
  lastSignInAt: string | null;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  tableName: string | null;
  recordId: string | null;
  userId: string | null;
  userName: string | null;
  ipAddress: string | null;
  createdAt: string | null;
}

export interface AdminSettingRow {
  id: string;
  key: string;
  description: string | null;
  value: unknown;
  updatedAt: string | null;
}

export interface AdminPackRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  discountType: "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y";
  discountValue: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  itemCount: number;
}

export interface AdminPackDetail extends AdminPackRow {
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    productImageUrl: string | null;
    sortOrder: number;
    isRequired: boolean;
  }>;
}

export interface AdminBlogPostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  authorId: string | null;
  authorName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminBlogPostDetail extends AdminBlogPostRow {
  body: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface AdminReturnRow {
  id: string;
  orderId: string;
  orderNumber: string | null;
  customerEmail: string | null;
  customerName: string | null;
  status: string;
  reason: string | null;
  description: string | null;
  refundAmount: number | null;
  requestedAt: string | null;
  approvedAt: string | null;
  receivedAt: string | null;
  refundedAt: string | null;
}

export interface AdminTicketRow {
  id: string;
  subject: string;
  status: string;
  priority: string;
  channel: string | null;
  category: string | null;
  customerEmail: string | null;
  customerName: string | null;
  orderId: string | null;
  orderNumber: string | null;
  assignedTo: string | null;
  createdAt: string | null;
  updatedAt: string | null;
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

export async function getAdminOrderById(
  id: string,
): Promise<AdminOrderDetail | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select(
      `id, order_number, status, email, phone, user_id, created_at,
       subtotal, shipping_total, discount_total, tax_total, grand_total,
       gift_wrap, gift_message, customer_note, internal_note,
       shipping_address_snapshot, billing_address_snapshot,
       shipped_at, delivered_at, cancelled_at,
       order_items ( id, product_id, variant_id, product_name_snapshot,
                     variant_name_snapshot, sku_snapshot, quantity,
                     unit_price, total ),
       payments ( id, status, method, amount, stripe_payment_intent_id,
                  stripe_charge_id, stripe_receipt_url, paid_at, refunded_at ),
       shipments ( id, tracking_number, carrier, status, shipped_at,
                   estimated_delivery, delivered_at )`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[getAdminOrderById]", error);
    return null;
  }

  const items = (data.order_items ?? []) as Array<{
    id: string;
    product_id: string | null;
    variant_id: string | null;
    product_name_snapshot: string;
    variant_name_snapshot: string | null;
    sku_snapshot: string | null;
    quantity: number;
    unit_price: number | string;
    total: number | string;
  }>;

  const payments = (data.payments ?? []) as Array<{
    id: string;
    status: string | null;
    method: string | null;
    amount: number | string;
    stripe_payment_intent_id: string | null;
    stripe_charge_id: string | null;
    stripe_receipt_url: string | null;
    paid_at: string | null;
    refunded_at: string | null;
  }>;

  const shipments = (data.shipments ?? []) as Array<{
    id: string;
    tracking_number: string | null;
    carrier: string | null;
    status: string | null;
    shipped_at: string | null;
    estimated_delivery: string | null;
    delivered_at: string | null;
  }>;

  return {
    id: data.id,
    orderNumber: data.order_number,
    status: data.status ?? "pending",
    createdAt: data.created_at ?? new Date().toISOString(),
    email: data.email,
    phone: data.phone,
    userId: data.user_id,
    subtotal: Number(data.subtotal ?? 0),
    shippingTotal: Number(data.shipping_total ?? 0),
    discountTotal: Number(data.discount_total ?? 0),
    taxTotal: Number(data.tax_total ?? 0),
    grandTotal: Number(data.grand_total ?? 0),
    giftWrap: data.gift_wrap ?? false,
    giftMessage: data.gift_message,
    customerNote: data.customer_note,
    internalNote: data.internal_note,
    shippingAddress: (data.shipping_address_snapshot ?? null) as Record<
      string,
      string
    > | null,
    billingAddress: (data.billing_address_snapshot ?? null) as Record<
      string,
      string
    > | null,
    shippedAt: data.shipped_at,
    deliveredAt: data.delivered_at,
    cancelledAt: data.cancelled_at,
    items: items.map((it) => ({
      id: it.id,
      productId: it.product_id,
      variantId: it.variant_id,
      productName: it.product_name_snapshot,
      variantName: it.variant_name_snapshot,
      sku: it.sku_snapshot,
      quantity: it.quantity,
      unitPrice: Number(it.unit_price),
      total: Number(it.total),
    })),
    payment: payments[0]
      ? {
          id: payments[0].id,
          status: payments[0].status,
          method: payments[0].method,
          amount: Number(payments[0].amount),
          stripePaymentIntentId: payments[0].stripe_payment_intent_id,
          stripeChargeId: payments[0].stripe_charge_id,
          stripeReceiptUrl: payments[0].stripe_receipt_url,
          paidAt: payments[0].paid_at,
          refundedAt: payments[0].refunded_at,
        }
      : null,
    shipment: shipments[0]
      ? {
          id: shipments[0].id,
          trackingNumber: shipments[0].tracking_number,
          carrier: shipments[0].carrier,
          status: shipments[0].status,
          shippedAt: shipments[0].shipped_at,
          estimatedDelivery: shipments[0].estimated_delivery,
          deliveredAt: shipments[0].delivered_at,
        }
      : null,
  };
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

export async function getAdminClients(): Promise<AdminClientRow[]> {
  const admin = createAdminClient();

  const [profilesResult, ordersResult] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id, email, first_name, last_name, loyalty_tier, loyalty_points, created_at, role",
      )
      .order("created_at", { ascending: false })
      .limit(500),
    admin
      .from("orders")
      .select("user_id, grand_total, status")
      .not("user_id", "is", null)
      .in("status", ["confirmed", "processing", "shipped", "delivered"]),
  ]);

  if (profilesResult.error) {
    console.error("[getAdminClients] profiles:", profilesResult.error);
    return [];
  }

  const aggregates = new Map<string, { count: number; total: number }>();
  for (const order of ordersResult.data ?? []) {
    if (!order.user_id) continue;
    const prev = aggregates.get(order.user_id) ?? { count: 0, total: 0 };
    aggregates.set(order.user_id, {
      count: prev.count + 1,
      total: prev.total + Number(order.grand_total ?? 0),
    });
  }

  return (profilesResult.data ?? [])
    .filter((p) => p.role === "customer" || !p.role)
    .map((p) => {
      const agg = aggregates.get(p.id);
      return {
        id: p.id,
        email: p.email,
        firstName: p.first_name,
        lastName: p.last_name,
        loyaltyTier: p.loyalty_tier ?? "bronze",
        loyaltyPoints: p.loyalty_points ?? 0,
        createdAt: p.created_at,
        ordersCount: agg?.count ?? 0,
        totalSpent: agg?.total ?? 0,
      };
    });
}

export async function getAdminProductById(
  id: string,
): Promise<AdminProductDetail | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select(
      `id, name, slug, short_description, description, base_price,
       compare_at_price, sku, category_id, collection_id, material,
       weight_g, dimensions, care_instructions, is_nickel_free,
       is_active, is_featured, is_new, seo_title, seo_description,
       created_at,
       product_variants ( id, sku, name, size, material_variant, stone,
                          color, length_cm, price_override, stock_quantity,
                          low_stock_threshold, weight_g, is_active ),
       product_media ( id, url, alt_text, is_primary, sort_order )`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[getAdminProductById]", error);
    return null;
  }

  const variants = (data.product_variants ?? []) as Array<{
    id: string;
    sku: string | null;
    name: string | null;
    size: string | null;
    material_variant: string | null;
    stone: string | null;
    color: string | null;
    length_cm: number | null;
    price_override: number | string | null;
    stock_quantity: number;
    low_stock_threshold: number | null;
    weight_g: number | null;
    is_active: boolean | null;
  }>;

  const media = (data.product_media ?? []) as Array<{
    id: string;
    url: string;
    alt_text: string | null;
    is_primary: boolean | null;
    sort_order: number | null;
  }>;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    shortDescription: data.short_description,
    description: data.description,
    basePrice: Number(data.base_price ?? 0),
    compareAtPrice:
      data.compare_at_price != null ? Number(data.compare_at_price) : null,
    sku: data.sku,
    categoryId: data.category_id,
    collectionId: data.collection_id,
    material: data.material,
    weightG: data.weight_g,
    dimensions: data.dimensions,
    careInstructions: data.care_instructions,
    isNickelFree: data.is_nickel_free ?? true,
    isActive: data.is_active ?? false,
    isFeatured: data.is_featured ?? false,
    isNew: data.is_new ?? false,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    createdAt: data.created_at,
    variants: variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      size: v.size,
      materialVariant: v.material_variant,
      stone: v.stone,
      color: v.color,
      lengthCm: v.length_cm,
      priceOverride: v.price_override != null ? Number(v.price_override) : null,
      stockQuantity: v.stock_quantity,
      lowStockThreshold: v.low_stock_threshold ?? 5,
      weightG: v.weight_g,
      isActive: v.is_active ?? true,
    })),
    media: media
      .map((m) => ({
        id: m.id,
        url: m.url,
        altText: m.alt_text,
        isPrimary: m.is_primary ?? false,
        sortOrder: m.sort_order ?? 0,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export async function getAdminCategories(): Promise<AdminCategoryRow[]> {
  const admin = createAdminClient();
  const [categoriesResult, productsResult] = await Promise.all([
    admin
      .from("categories")
      .select(
        "id, name, slug, description, image_url, parent_id, sort_order, is_active",
      )
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    admin.from("products").select("category_id").not("category_id", "is", null),
  ]);

  if (categoriesResult.error) {
    console.error("[getAdminCategories]", categoriesResult.error);
    return [];
  }

  const counts = new Map<string, number>();
  for (const p of productsResult.data ?? []) {
    if (!p.category_id) continue;
    counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  }

  const all = categoriesResult.data ?? [];
  const byId = new Map(all.map((c) => [c.id, c]));

  return all.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    parentId: row.parent_id,
    parentName: row.parent_id
      ? (byId.get(row.parent_id)?.name ?? null)
      : null,
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active ?? true,
    productCount: counts.get(row.id) ?? 0,
  }));
}

export async function getAdminCollections(): Promise<AdminCollectionRow[]> {
  const admin = createAdminClient();
  const [collectionsResult, productsResult] = await Promise.all([
    admin
      .from("collections")
      .select(
        "id, name, slug, description, image_url, starts_at, ends_at, sort_order, is_active",
      )
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    admin
      .from("products")
      .select("collection_id")
      .not("collection_id", "is", null),
  ]);

  if (collectionsResult.error) {
    console.error("[getAdminCollections]", collectionsResult.error);
    return [];
  }

  const counts = new Map<string, number>();
  for (const p of productsResult.data ?? []) {
    if (!p.collection_id) continue;
    counts.set(p.collection_id, (counts.get(p.collection_id) ?? 0) + 1);
  }

  return (collectionsResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active ?? true,
    productCount: counts.get(row.id) ?? 0,
  }));
}

export async function getAdminCategoryOptions(): Promise<AdminCategoryOption[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("categories")
    .select("id, name, slug")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) {
    console.error("[getAdminCategoryOptions]", error);
    return [];
  }
  return data ?? [];
}

export async function getAdminCollectionOptions(): Promise<
  AdminCollectionOption[]
> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("collections")
    .select("id, name, slug")
    .order("name", { ascending: true });
  if (error) {
    console.error("[getAdminCollectionOptions]", error);
    return [];
  }
  return data ?? [];
}

export async function getAdminPromotions(): Promise<AdminPromotionRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("discount_codes")
    .select(
      "id, code, description, discount_type, discount_value, minimum_order_amount, maximum_discount, per_user_limit, usage_limit, usage_count, starts_at, ends_at, is_active",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAdminPromotions]", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    description: row.description,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value ?? 0),
    minimumOrderAmount:
      row.minimum_order_amount != null
        ? Number(row.minimum_order_amount)
        : null,
    maximumDiscount:
      row.maximum_discount != null ? Number(row.maximum_discount) : null,
    perUserLimit: row.per_user_limit ?? null,
    usageLimit: row.usage_limit ?? null,
    usageCount: row.usage_count ?? 0,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    isActive: row.is_active ?? false,
  }));
}

export async function getAdminBanners(): Promise<AdminBannerRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("banners")
    .select(
      "id, title, subtitle, image_url, link_url, placement, starts_at, ends_at, sort_order, is_active",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAdminBanners]", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
    placement: row.placement ?? "hero",
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active ?? false,
  }));
}

export async function getAdminReviews(): Promise<AdminReviewRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .select(
      `id, product_id, user_id, rating, title, body, is_verified_purchase,
       is_approved, created_at,
       product:products ( name, slug )`,
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[getAdminReviews]", error);
    return [];
  }

  // Récupérer les infos auteurs en lot
  const userIds = Array.from(
    new Set(
      (data ?? [])
        .map((r) => r.user_id)
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

  return (data ?? []).map((row) => {
    const product = Array.isArray(row.product)
      ? row.product[0]
      : (row.product as { name: string; slug: string } | null);
    const author = row.user_id ? profilesById.get(row.user_id) : null;
    const fullName =
      [author?.first_name, author?.last_name].filter(Boolean).join(" ") ||
      null;
    return {
      id: row.id,
      productId: row.product_id ?? "",
      productName: product?.name ?? "Produit inconnu",
      productSlug: product?.slug ?? "",
      userId: row.user_id ?? null,
      authorName: fullName,
      authorEmail: author?.email ?? null,
      rating: row.rating ?? 0,
      title: row.title,
      body: row.body,
      isVerifiedPurchase: row.is_verified_purchase ?? false,
      isApproved: row.is_approved ?? false,
      createdAt: row.created_at,
    };
  });
}

export async function getAdminPacks(): Promise<AdminPackRow[]> {
  const admin = createAdminClient();
  const [packsResult, itemsResult] = await Promise.all([
    admin
      .from("packs")
      .select(
        "id, name, slug, description, image_url, discount_type, discount_value, starts_at, ends_at, is_active",
      )
      .order("created_at", { ascending: false })
      .limit(200),
    admin.from("pack_items").select("pack_id"),
  ]);

  if (packsResult.error) {
    console.error("[getAdminPacks]", packsResult.error);
    return [];
  }

  const counts = new Map<string, number>();
  for (const it of itemsResult.data ?? []) {
    counts.set(it.pack_id, (counts.get(it.pack_id) ?? 0) + 1);
  }

  return (packsResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value ?? 0),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    isActive: row.is_active ?? false,
    itemCount: counts.get(row.id) ?? 0,
  }));
}

export async function getAdminPackById(
  id: string,
): Promise<AdminPackDetail | null> {
  const admin = createAdminClient();
  const { data: pack, error } = await admin
    .from("packs")
    .select(
      "id, name, slug, description, image_url, discount_type, discount_value, starts_at, ends_at, is_active",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !pack) {
    if (error) console.error("[getAdminPackById]", error);
    return null;
  }

  const { data: items } = await admin
    .from("pack_items")
    .select(
      `id, product_id, sort_order, is_required,
       product:products (
         name, slug,
         product_media ( url, is_primary, sort_order )
       )`,
    )
    .eq("pack_id", id)
    .order("sort_order", { ascending: true });

  type ItemRow = {
    id: string;
    product_id: string;
    sort_order: number | null;
    is_required: boolean | null;
    product?:
      | {
          name: string;
          slug: string;
          product_media: Array<{
            url: string;
            is_primary: boolean | null;
            sort_order: number | null;
          }>;
        }
      | Array<{
          name: string;
          slug: string;
          product_media: Array<{
            url: string;
            is_primary: boolean | null;
            sort_order: number | null;
          }>;
        }>
      | null;
  };

  return {
    id: pack.id,
    name: pack.name,
    slug: pack.slug,
    description: pack.description,
    imageUrl: pack.image_url,
    discountType: pack.discount_type,
    discountValue: Number(pack.discount_value ?? 0),
    startsAt: pack.starts_at,
    endsAt: pack.ends_at,
    isActive: pack.is_active ?? false,
    itemCount: items?.length ?? 0,
    items: ((items ?? []) as ItemRow[]).map((it) => {
      const product = Array.isArray(it.product) ? it.product[0] : it.product;
      const media = product?.product_media ?? [];
      const primary =
        media.find((m) => m.is_primary) ??
        media.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
      return {
        id: it.id,
        productId: it.product_id,
        productName: product?.name ?? "Produit inconnu",
        productSlug: product?.slug ?? "",
        productImageUrl: primary?.url ?? null,
        sortOrder: it.sort_order ?? 0,
        isRequired: it.is_required ?? true,
      };
    }),
  };
}

export async function searchAdminProducts(query: string, limit = 10) {
  const admin = createAdminClient();
  let req = admin
    .from("products")
    .select(
      `id, name, slug, sku,
       product_media ( url, is_primary, sort_order )`,
    )
    .order("name", { ascending: true })
    .limit(limit);
  if (query.trim()) {
    req = req.ilike("name", `%${query.trim()}%`);
  }
  const { data, error } = await req;
  if (error) {
    console.error("[searchAdminProducts]", error);
    return [];
  }
  return (data ?? []).map((row) => {
    const media = (row.product_media ?? []) as Array<{
      url: string;
      is_primary: boolean | null;
      sort_order: number | null;
    }>;
    const primary =
      media.find((m) => m.is_primary) ??
      media.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      sku: row.sku ?? null,
      imageUrl: primary?.url ?? null,
    };
  });
}

export async function getAdminTeamMembers(): Promise<AdminTeamMember[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select(
      "id, email, first_name, last_name, role, is_active, created_at, last_login_at",
    )
    .in("role", ["super_admin", "admin", "editor", "support"])
    .order("role", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAdminTeamMembers]", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role ?? "support",
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    lastSignInAt: row.last_login_at,
  }));
}

export async function getAdminAuditLogs(): Promise<AdminAuditLog[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("audit_logs")
    .select(
      "id, action, table_name, record_id, user_id, ip_address, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[getAdminAuditLogs]", error);
    return [];
  }

  const userIds = Array.from(
    new Set(
      (data ?? []).map((r) => r.user_id).filter((id): id is string => !!id),
    ),
  );
  const namesById = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      const name =
        [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email;
      if (name) namesById.set(p.id, name);
    }
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    action: row.action,
    tableName: row.table_name,
    recordId: row.record_id,
    userId: row.user_id,
    userName: row.user_id ? namesById.get(row.user_id) ?? null : null,
    ipAddress: row.ip_address ? String(row.ip_address) : null,
    createdAt: row.created_at,
  }));
}

export async function getAdminSettings(): Promise<AdminSettingRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("settings")
    .select("id, key, description, value, updated_at")
    .order("key", { ascending: true });

  if (error) {
    console.error("[getAdminSettings]", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    key: row.key,
    description: row.description,
    value: row.value,
    updatedAt: row.updated_at,
  }));
}

export interface AdminAnalyticsSummary {
  revenueLast30: number;
  revenuePrev30: number;
  ordersLast30: number;
  ordersPrev30: number;
  averageBasketLast30: number;
  newCustomersLast30: number;
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  byCategory: Array<{
    name: string;
    revenue: number;
  }>;
  ordersByStatus: Record<string, number>;
}

export async function getAdminAnalytics(): Promise<AdminAnalyticsSummary> {
  const admin = createAdminClient();
  const now = new Date();
  const start30 = new Date(now);
  start30.setDate(start30.getDate() - 30);
  start30.setHours(0, 0, 0, 0);
  const start60 = new Date(now);
  start60.setDate(start60.getDate() - 60);
  start60.setHours(0, 0, 0, 0);

  const VALID_STATUSES: Array<
    "confirmed" | "processing" | "shipped" | "delivered"
  > = ["confirmed", "processing", "shipped", "delivered"];

  const [last30, prev30, allStatusCounts, customers, items] = await Promise.all([
    admin
      .from("orders")
      .select("grand_total, created_at")
      .gte("created_at", start30.toISOString())
      .in("status", VALID_STATUSES),
    admin
      .from("orders")
      .select("grand_total, created_at")
      .gte("created_at", start60.toISOString())
      .lt("created_at", start30.toISOString())
      .in("status", VALID_STATUSES),
    admin.from("orders").select("status"),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", start30.toISOString()),
    admin
      .from("order_items")
      .select(
        `product_id, product_name_snapshot, quantity, total,
         product:products (
           id, name,
           category:categories ( name )
         )`,
      )
      .gte("created_at", start30.toISOString())
      .limit(1000),
  ]);

  const last30List = (last30.data ?? []) as Array<{
    grand_total: number | string;
    created_at: string | null;
  }>;
  const prev30List = (prev30.data ?? []) as Array<{
    grand_total: number | string;
    created_at: string | null;
  }>;
  const revenueLast30 = last30List.reduce(
    (s, o) => s + Number(o.grand_total ?? 0),
    0,
  );
  const revenuePrev30 = prev30List.reduce(
    (s, o) => s + Number(o.grand_total ?? 0),
    0,
  );
  const averageBasketLast30 = last30List.length
    ? revenueLast30 / last30List.length
    : 0;

  // Status counts
  const ordersByStatus: Record<string, number> = {};
  for (const row of allStatusCounts.data ?? []) {
    if (!row.status) continue;
    ordersByStatus[row.status] = (ordersByStatus[row.status] ?? 0) + 1;
  }

  // Top products + revenue par catégorie
  type ItemRow = {
    product_id: string | null;
    product_name_snapshot: string;
    quantity: number;
    total: number | string;
    product?:
      | { id: string; name: string; category?: { name: string } | { name: string }[] | null }
      | Array<{
          id: string;
          name: string;
          category?: { name: string } | { name: string }[] | null;
        }>
      | null;
  };
  const productAgg = new Map<
    string,
    { id: string; name: string; quantity: number; revenue: number }
  >();
  const categoryAgg = new Map<string, number>();

  for (const it of (items.data ?? []) as ItemRow[]) {
    if (!it.product_id) continue;
    const prev = productAgg.get(it.product_id);
    productAgg.set(it.product_id, {
      id: it.product_id,
      name: prev?.name ?? it.product_name_snapshot,
      quantity: (prev?.quantity ?? 0) + it.quantity,
      revenue: (prev?.revenue ?? 0) + Number(it.total ?? 0),
    });

    const product = Array.isArray(it.product) ? it.product[0] : it.product;
    const category = Array.isArray(product?.category)
      ? product?.category[0]
      : product?.category;
    if (category?.name) {
      categoryAgg.set(
        category.name,
        (categoryAgg.get(category.name) ?? 0) + Number(it.total ?? 0),
      );
    }
  }

  return {
    revenueLast30: Math.round(revenueLast30 * 100) / 100,
    revenuePrev30: Math.round(revenuePrev30 * 100) / 100,
    ordersLast30: last30List.length,
    ordersPrev30: prev30List.length,
    averageBasketLast30: Math.round(averageBasketLast30 * 100) / 100,
    newCustomersLast30: customers.count ?? 0,
    topProducts: Array.from(productAgg.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10),
    byCategory: Array.from(categoryAgg.entries())
      .map(([name, revenue]) => ({
        name,
        revenue: Math.round(revenue * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue),
    ordersByStatus,
  };
}

export async function getAdminBlogPosts(): Promise<AdminBlogPostRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, cover_image_url, tags, is_published, published_at, author_id, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[getAdminBlogPosts]", error);
    return [];
  }

  const authorIds = Array.from(
    new Set(
      (data ?? []).map((r) => r.author_id).filter((id): id is string => !!id),
    ),
  );
  const authors = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", authorIds);
    for (const p of profiles ?? []) {
      const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
      if (name) authors.set(p.id, name);
    }
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    tags: row.tags ?? [],
    isPublished: row.is_published ?? false,
    publishedAt: row.published_at,
    authorId: row.author_id,
    authorName: row.author_id ? authors.get(row.author_id) ?? null : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getAdminBlogPostById(
  id: string,
): Promise<AdminBlogPostDetail | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, body, cover_image_url, tags, is_published, published_at, author_id, seo_title, seo_description, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[getAdminBlogPostById]", error);
    return null;
  }

  let authorName: string | null = null;
  if (data.author_id) {
    const { data: profile } = await admin
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", data.author_id)
      .maybeSingle();
    if (profile) {
      authorName =
        [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
        null;
    }
  }

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    body: data.body,
    coverImageUrl: data.cover_image_url,
    tags: data.tags ?? [],
    isPublished: data.is_published ?? false,
    publishedAt: data.published_at,
    authorId: data.author_id,
    authorName,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getAdminReturns(): Promise<AdminReturnRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("returns")
    .select(
      `id, order_id, status, reason, description, refund_amount,
       created_at, approved_at, received_at, refunded_at,
       order:orders ( order_number, email, shipping_address_snapshot )`,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[getAdminReturns]", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const order = Array.isArray(row.order)
      ? row.order[0]
      : (row.order as
          | {
              order_number: string;
              email: string | null;
              shipping_address_snapshot: Record<string, string> | null;
            }
          | null);
    const addr = (order?.shipping_address_snapshot ?? {}) as Record<
      string,
      string | undefined
    >;
    const customerName =
      [addr.firstName, addr.lastName].filter(Boolean).join(" ") || null;
    return {
      id: row.id,
      orderId: row.order_id,
      orderNumber: order?.order_number ?? null,
      customerEmail: order?.email ?? null,
      customerName,
      status: row.status ?? "requested",
      reason: row.reason,
      description: row.description,
      refundAmount:
        row.refund_amount != null ? Number(row.refund_amount) : null,
      requestedAt: row.created_at,
      approvedAt: row.approved_at,
      receivedAt: row.received_at,
      refundedAt: row.refunded_at,
    };
  });
}

export async function getAdminTickets(): Promise<AdminTicketRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("tickets")
    .select(
      `id, subject, status, priority, channel, category, user_id, order_id,
       assigned_to, created_at, updated_at,
       order:orders ( order_number )`,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[getAdminTickets]", error);
    return [];
  }

  // Récupérer les profils en lot (pas de FK directe entre tickets.user_id et profiles)
  const userIds = Array.from(
    new Set(
      (data ?? []).map((r) => r.user_id).filter((id): id is string => !!id),
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

  return (data ?? []).map((row) => {
    const order = Array.isArray(row.order)
      ? row.order[0]
      : (row.order as { order_number: string } | null);
    const user = row.user_id ? profilesById.get(row.user_id) : null;
    const customerName =
      [user?.first_name, user?.last_name].filter(Boolean).join(" ") || null;
    return {
      id: row.id,
      subject: row.subject,
      status: row.status ?? "open",
      priority: row.priority ?? "normal",
      channel: row.channel,
      category: row.category,
      customerEmail: user?.email ?? null,
      customerName,
      orderId: row.order_id,
      orderNumber: order?.order_number ?? null,
      assignedTo: row.assigned_to,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
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
