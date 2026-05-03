import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { ProductCardProduct } from "@/components/product/ProductCard";
import type { Database } from "@/types/supabase";

// Cookie-free client safe for `generateStaticParams` (build-time, no request context)
function createBuildClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

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
      .select("id, parent_id")
      .eq("slug", filter.categorySlug)
      .maybeSingle();
    if (!cat) return [];
    // Include children when the slug is a top-level category
    const { data: children } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", cat.id);
    const ids = [cat.id, ...(children ?? []).map((c) => c.id)];
    query = query.in("category_id", ids);
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

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, sort_order, parent_id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("[getCategoryBySlug]", error);
    return null;
  }
  return data;
}

export async function getCollectionBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, description, image_url, sort_order, starts_at, ends_at")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("[getCollectionBySlug]", error);
    return null;
  }
  return data;
}

export async function getAllCollections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, description, image_url")
    .or("is_active.is.null,is_active.eq.true")
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("[getAllCollections]", error);
    return [];
  }
  return data ?? [];
}

export type ProductDetailMedia = {
  id: string;
  url: string;
  alt_text: string | null;
  position: number;
  is_primary: boolean;
  media_type: string | null;
};

export type ProductDetailVariant = {
  id: string;
  name: string | null;
  sku: string | null;
  size: string | null;
  color: string | null;
  stone: string | null;
  length_cm: number | null;
  material_variant: string | null;
  price_override: number | null;
  stock_quantity: number;
  is_active: boolean | null;
  sort_order: number | null;
};

export type ProductDetailReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  photos: string[] | null;
  is_verified_purchase: boolean | null;
  created_at: string | null;
  user_id: string;
};

export type ProductDetail = {
  product: {
    id: string;
    name: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    base_price: number;
    compare_at_price: number | null;
    sku: string | null;
    material: string | null;
    weight_g: number | null;
    dimensions: string | null;
    care_instructions: string | null;
    is_nickel_free: boolean | null;
    is_featured: boolean | null;
    category_id: string | null;
    collection_id: string | null;
    created_at: string | null;
  };
  media: ProductDetailMedia[];
  variants: ProductDetailVariant[];
  reviews: ProductDetailReview[];
  category: { id: string; name: string; slug: string } | null;
  collection: { id: string; name: string; slug: string } | null;
};

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, short_description, description, base_price, compare_at_price,
      sku, material, weight_g, dimensions, care_instructions, is_nickel_free,
      is_featured, category_id, collection_id, created_at,
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
  if (!data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  const cat = Array.isArray(row.category) ? row.category[0] : row.category;
  const col = Array.isArray(row.collection) ? row.collection[0] : row.collection;

  return {
    product: {
      id: row.id,
      name: row.name,
      slug: row.slug,
      short_description: row.short_description,
      description: row.description,
      base_price: Number(row.base_price),
      compare_at_price:
        row.compare_at_price === null ? null : Number(row.compare_at_price),
      sku: row.sku,
      material: row.material,
      weight_g: row.weight_g === null ? null : Number(row.weight_g),
      dimensions: row.dimensions,
      care_instructions: row.care_instructions,
      is_nickel_free: row.is_nickel_free,
      is_featured: row.is_featured,
      category_id: row.category_id,
      collection_id: row.collection_id,
      created_at: row.created_at,
    },
    media: (row.product_media ?? [])
      .map(
        (m: {
          id: string;
          url: string;
          alt_text: string | null;
          sort_order: number | null;
          is_primary: boolean | null;
          media_type: string | null;
        }) => ({
          id: m.id,
          url: m.url,
          alt_text: m.alt_text,
          position: m.sort_order ?? 0,
          is_primary: m.is_primary ?? false,
          media_type: m.media_type,
        })
      )
      .sort(
        (a: ProductDetailMedia, b: ProductDetailMedia) =>
          (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.position - b.position
      ),
    variants: (row.product_variants ?? []).map(
      (v: {
        id: string;
        name: string | null;
        sku: string | null;
        size: string | null;
        color: string | null;
        stone: string | null;
        length_cm: number | string | null;
        material_variant: string | null;
        price_override: number | string | null;
        stock_quantity: number;
        is_active: boolean | null;
        sort_order: number | null;
      }) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        size: v.size,
        color: v.color,
        stone: v.stone,
        length_cm: v.length_cm === null ? null : Number(v.length_cm),
        material_variant: v.material_variant,
        price_override:
          v.price_override === null ? null : Number(v.price_override),
        stock_quantity: v.stock_quantity,
        is_active: v.is_active,
        sort_order: v.sort_order,
      })
    ),
    reviews: (row.reviews ?? []).filter(
      (r: { is_verified_purchase: boolean | null }) => true
    ),
    category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
    collection: col ? { id: col.id, name: col.name, slug: col.slug } : null,
  };
}

export async function getAllSlugs(table: "products" | "categories" | "collections") {
  const supabase = createBuildClient();
  const { data, error } = await supabase.from(table).select("slug");
  if (error) {
    console.error(`[getAllSlugs:${table}]`, error);
    return [];
  }
  return (data ?? []).map((r) => r.slug);
}

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  tags: string[];
  publishedAt: string | null;
  authorName: string | null;
}

export interface BlogPostDetail extends BlogPostSummary {
  body: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export async function getPublishedBlogPosts(
  limit = 50,
): Promise<BlogPostSummary[]> {
  const supabase = createBuildClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, cover_image_url, tags, published_at, author_id",
    )
    .eq("is_published", true)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getPublishedBlogPosts]", error);
    return [];
  }

  const authorIds = Array.from(
    new Set(
      (data ?? []).map((p) => p.author_id).filter((id): id is string => !!id),
    ),
  );
  const authorsById = await fetchAuthorsByIds(authorIds);

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    tags: row.tags ?? [],
    publishedAt: row.published_at,
    authorName: row.author_id ? authorsById.get(row.author_id) ?? null : null,
  }));
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPostDetail | null> {
  const supabase = createBuildClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, body, cover_image_url, tags, published_at, author_id, seo_title, seo_description",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[getBlogPostBySlug]", error);
    return null;
  }

  const authorsById = data.author_id
    ? await fetchAuthorsByIds([data.author_id])
    : new Map<string, string>();

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    coverImageUrl: data.cover_image_url,
    tags: data.tags ?? [],
    publishedAt: data.published_at,
    authorName: data.author_id
      ? authorsById.get(data.author_id) ?? null
      : null,
    body: data.body,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
  };
}

async function fetchAuthorsByIds(
  ids: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (ids.length === 0) return map;
  const supabase = createBuildClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", ids);
  for (const p of data ?? []) {
    const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
    if (name) map.set(p.id, name);
  }
  return map;
}

export interface PublicFaqArticle {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
}

export interface PublicFaqCategory {
  slug: string;
  name: string;
  count: number;
}

function faqSlugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function getPublicFaqArticles(): Promise<PublicFaqArticle[]> {
  const supabase = createBuildClient();
  const { data, error } = await supabase
    .from("faq_articles")
    .select("id, question, answer, category, sort_order")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[getPublicFaqArticles]", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    sortOrder: row.sort_order ?? 0,
  }));
}

export async function getPublicFaqCategories(): Promise<PublicFaqCategory[]> {
  const articles = await getPublicFaqArticles();
  const counts = new Map<string, { name: string; count: number }>();
  for (const a of articles) {
    if (!a.category) continue;
    const key = faqSlugify(a.category);
    const prev = counts.get(key);
    if (prev) {
      prev.count += 1;
    } else {
      counts.set(key, { name: a.category, count: 1 });
    }
  }
  return Array.from(counts.entries()).map(([slug, v]) => ({
    slug,
    name: v.name,
    count: v.count,
  }));
}

export async function getPublicFaqArticlesByCategorySlug(
  slug: string,
): Promise<{ name: string; articles: PublicFaqArticle[] } | null> {
  const articles = await getPublicFaqArticles();
  const matching = articles.filter(
    (a) => a.category && faqSlugify(a.category) === slug,
  );
  if (matching.length === 0) return null;
  return {
    name: matching[0].category!,
    articles: matching,
  };
}

export interface PublicCmsPage {
  slug: string;
  title: string;
  body: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
}

export async function getPublicCmsPageBySlug(
  slug: string,
): Promise<PublicCmsPage | null> {
  const supabase = createBuildClient();
  const { data, error } = await supabase
    .from("cms_pages")
    .select("slug, title, body, meta_title, meta_description, published_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[getPublicCmsPageBySlug]", error);
    return null;
  }

  return {
    slug: data.slug,
    title: data.title,
    body: data.body,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    publishedAt: data.published_at,
  };
}

export async function getAllPublishedCmsSlugs(): Promise<string[]> {
  const supabase = createBuildClient();
  const { data, error } = await supabase
    .from("cms_pages")
    .select("slug")
    .eq("is_published", true);
  if (error) {
    console.error("[getAllPublishedCmsSlugs]", error);
    return [];
  }
  return (data ?? []).map((r) => r.slug);
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const supabase = createBuildClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true);
  if (error) {
    console.error("[getAllBlogSlugs]", error);
    return [];
  }
  return (data ?? []).map((r) => r.slug);
}

export interface PublicReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string | null;
  authorName: string;
  productName?: string;
  productSlug?: string;
}

/**
 * Retourne les meilleurs avis approuvés pour la home (5 étoiles, content non vide).
 */
export async function getHomepageReviews(limit = 3): Promise<PublicReview[]> {
  const supabase = createBuildClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `id, rating, title, body, is_verified_purchase, created_at, user_id,
       product:products ( name, slug )`,
    )
    .eq("is_approved", true)
    .eq("rating", 5)
    .not("body", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getHomepageReviews]", error);
    return [];
  }

  return await enrichReviewsWithAuthor(data ?? []);
}

/**
 * Avis approuvés pour un produit donné.
 */
export async function getProductReviews(
  productId: string,
  limit = 20,
): Promise<PublicReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, rating, title, body, is_verified_purchase, created_at, user_id",
    )
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getProductReviews]", error);
    return [];
  }

  return await enrichReviewsWithAuthor(data ?? []);
}

interface ReviewRow {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean | null;
  created_at: string | null;
  user_id: string | null;
  product?:
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
}

async function enrichReviewsWithAuthor(
  rows: ReviewRow[],
): Promise<PublicReview[]> {
  const supabase = await createClient();
  const userIds = Array.from(
    new Set(rows.map((r) => r.user_id).filter((id): id is string => !!id)),
  );

  const profiles = new Map<string, { firstName: string | null; lastName: string | null }>();
  if (userIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", userIds);
    for (const p of data ?? []) {
      profiles.set(p.id, {
        firstName: p.first_name ?? null,
        lastName: p.last_name ?? null,
      });
    }
  }

  return rows.map((row) => {
    const author = row.user_id ? profiles.get(row.user_id) : undefined;
    const first = author?.firstName ?? "";
    const lastInitial = author?.lastName
      ? `${author.lastName.charAt(0).toUpperCase()}.`
      : "";
    const authorName =
      [first, lastInitial].filter(Boolean).join(" ").trim() || "Cliente ISHYA";
    const product = Array.isArray(row.product) ? row.product[0] : row.product;
    return {
      id: row.id,
      rating: row.rating,
      title: row.title,
      body: row.body,
      isVerifiedPurchase: row.is_verified_purchase ?? false,
      createdAt: row.created_at,
      authorName,
      productName: product?.name,
      productSlug: product?.slug,
    };
  });
}

export interface ProductReviewSummary {
  count: number;
  average: number;
}

export async function getProductReviewSummary(
  productId: string,
): Promise<ProductReviewSummary> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_approved", true);

  const ratings = (data ?? []).map((r) => r.rating);
  if (ratings.length === 0) return { count: 0, average: 0 };
  const sum = ratings.reduce((a, b) => a + b, 0);
  return {
    count: ratings.length,
    average: Math.round((sum / ratings.length) * 10) / 10,
  };
}

export async function userHasPurchasedProduct(
  productId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("orders")
    .select("id, order_items!inner ( product_id )")
    .eq("user_id", user.id)
    .in("status", ["confirmed", "processing", "shipped", "delivered"])
    .eq("order_items.product_id", productId)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

export async function userHasReviewedProduct(
  productId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  return data !== null;
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
