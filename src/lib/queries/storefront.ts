import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProductCardProduct } from "@/components/product/ProductCard";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  base_price: number | string;
  compare_at_price: number | string | null;
  is_featured: boolean | null;
  is_new: boolean | null;
  short_description: string | null;
  description: string | null;
  material: string | null;
  category_id: string | null;
  collection_id: string | null;
  created_at: string | null;
  category?: { name: string; slug: string } | { name: string; slug: string }[] | null;
  product_media?: Array<{
    url: string;
    alt_text: string | null;
    sort_order: number | null;
    is_primary: boolean | null;
  }> | null;
  product_variants?: Array<{ stock_quantity: number }> | null;
};

const PRODUCT_CARD_SELECT = `
  id, name, slug, base_price, compare_at_price, is_featured, is_new,
  short_description, material, created_at,
  category:categories!products_category_id_fkey ( name, slug ),
  product_media ( url, alt_text, sort_order, is_primary ),
  product_variants ( stock_quantity )
`;

function pickCategory(
  cat: ProductRow["category"]
): { name: string; slug: string } | undefined {
  if (!cat) return undefined;
  if (Array.isArray(cat)) return cat[0] ?? undefined;
  return cat;
}

function rowToCard(row: ProductRow): ProductCardProduct {
  const badges: string[] = [];
  if (row.is_new) badges.push("nouveau");
  if (row.is_featured) badges.push("best-seller");

  const media = (row.product_media ?? []).map((m) => ({
    url: m.url,
    alt_text: m.alt_text,
    position: m.sort_order ?? 0,
    is_primary: m.is_primary ?? false,
  }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    base_price: Number(row.base_price),
    compare_at_price:
      row.compare_at_price === null ? null : Number(row.compare_at_price),
    is_featured: row.is_featured ?? false,
    media,
    category: pickCategory(row.category),
    variants: (row.product_variants ?? []).map((v) => ({
      stock_quantity: v.stock_quantity,
    })),
    badges,
  };
}

export async function getTopCategories(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, sort_order")
    .is("parent_id", null)
    .or("is_active.is.null,is_active.eq.true")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error("[getTopCategories]", error);
    return [];
  }
  return data ?? [];
}

export async function getFeaturedCollection() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, description, image_url")
    .or("is_active.is.null,is_active.eq.true")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getFeaturedCollection]", error);
    return null;
  }
  return data;
}

async function fetchCardProducts(filter: {
  is_featured?: boolean;
  is_new?: boolean;
  promoOnly?: boolean;
  categorySlug?: string;
  collectionSlug?: string;
  limit?: number;
}): Promise<ProductCardProduct[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT)
    .or("is_active.is.null,is_active.eq.true");

  if (filter.is_featured) query = query.eq("is_featured", true);
  if (filter.is_new) query = query.eq("is_new", true);
  if (filter.promoOnly) {
    query = query.not("compare_at_price", "is", null);
  }
  if (filter.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filter.categorySlug)
      .maybeSingle();
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }
  if (filter.collectionSlug) {
    const { data: col } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", filter.collectionSlug)
      .maybeSingle();
    if (!col) return [];
    query = query.eq("collection_id", col.id);
  }

  query = query.order("sort_order", { ascending: true, nullsFirst: false });
  if (filter.limit) query = query.limit(filter.limit);

  const { data, error } = await query;
  if (error) {
    console.error("[fetchCardProducts]", error);
    return [];
  }
  return ((data ?? []) as unknown as ProductRow[]).map(rowToCard);
}

export const getFeaturedProducts = (limit?: number) =>
  fetchCardProducts({ is_featured: true, limit });

export const getBestSellers = (limit = 8) =>
  fetchCardProducts({ is_featured: true, limit });

export const getNewProducts = (limit?: number) =>
  fetchCardProducts({ is_new: true, limit });

export const getPromotionProducts = (limit?: number) =>
  fetchCardProducts({ promoOnly: true, limit });

export const getAllCardProducts = (limit?: number) => fetchCardProducts({ limit });

export const getProductsByCategory = (slug: string) =>
  fetchCardProducts({ categorySlug: slug });

export const getProductsByCollection = (slug: string) =>
  fetchCardProducts({ collectionSlug: slug });

export async function getProductsByBudget(min: number, max: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT)
    .or("is_active.is.null,is_active.eq.true")
    .gte("base_price", min)
    .lte("base_price", max)
    .order("base_price", { ascending: true });

  if (error) {
    console.error("[getProductsByBudget]", error);
    return [];
  }
  return ((data ?? []) as unknown as ProductRow[]).map(rowToCard);
}

export async function searchProducts(q: string) {
  if (!q.trim()) return [];
  const supabase = await createClient();
  const term = `%${q.trim()}%`;
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT)
    .or("is_active.is.null,is_active.eq.true")
    .or(`name.ilike.${term},short_description.ilike.${term},material.ilike.${term}`)
    .limit(50);

  if (error) {
    console.error("[searchProducts]", error);
    return [];
  }
  return ((data ?? []) as unknown as ProductRow[]).map(rowToCard);
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories!products_category_id_fkey ( id, name, slug ),
      collection:collections!products_collection_id_fkey ( id, name, slug ),
      product_media ( id, url, alt_text, sort_order, is_primary, media_type ),
      product_variants ( id, name, sku, size, color, stone, length_cm, material_variant, price_override, stock_quantity, is_active, sort_order ),
      reviews ( id, rating, title, body, photos, is_verified_purchase, created_at, user_id )
      `
    )
    .eq("slug", slug)
    .or("is_active.is.null,is_active.eq.true")
    .maybeSingle();

  if (error) {
    console.error("[getProductBySlug]", error);
    return null;
  }
  return product;
}

export async function getRelatedProducts(productId: string, limit = 4) {
  const supabase = await createClient();
  const { data: source } = await supabase
    .from("products")
    .select("category_id, collection_id")
    .eq("id", productId)
    .maybeSingle();
  if (!source) return [];

  let query = supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT)
    .neq("id", productId)
    .or("is_active.is.null,is_active.eq.true");

  if (source.category_id) {
    query = query.eq("category_id", source.category_id);
  } else if (source.collection_id) {
    query = query.eq("collection_id", source.collection_id);
  }

  const { data, error } = await query.limit(limit);
  if (error) {
    console.error("[getRelatedProducts]", error);
    return [];
  }
  return ((data ?? []) as unknown as ProductRow[]).map(rowToCard);
}
