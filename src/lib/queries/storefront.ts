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
    productType: "product",
    material: row.material,
    createdAt: row.created_at,
  };
}

// ============================================================================
// UNIFIED SEARCH — used by /boutique with filters in URL
// ============================================================================

export type ProductBadgeFilter =
  | "nouveau"
  | "best-seller"
  | "promo"
  | "derniere-piece";
export type ProductTypeFilter = "produit" | "pack";
export type ProductSort =
  | "popularite"
  | "prix-asc"
  | "prix-desc"
  | "nouveaute"
  | "promo";

export interface ProductSearchFilters {
  q?: string;
  categories?: string[];
  collections?: string[];
  badges?: ProductBadgeFilter[];
  types?: ProductTypeFilter[];
  min?: number;
  max?: number;
  materiaux?: string[];
  tri?: ProductSort;
  limit?: number;
}

async function fetchProductIdsForCategorySlugs(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slugs: string[],
): Promise<string[]> {
  const { data: cats } = await supabase
    .from("categories")
    .select("id, parent_id")
    .in("slug", slugs);
  if (!cats || cats.length === 0) return [];
  const parentIds = cats.map((c) => c.id);
  const { data: children } = await supabase
    .from("categories")
    .select("id")
    .in("parent_id", parentIds);
  const allCatIds = [...parentIds, ...(children ?? []).map((c) => c.id)];
  const { data: links } = await supabase
    .from("product_categories")
    .select("product_id")
    .in("category_id", allCatIds);
  const m2mIds = (links ?? []).map((l) => l.product_id);
  if (m2mIds.length > 0) return Array.from(new Set(m2mIds));
  const { data: legacy } = await supabase
    .from("products")
    .select("id")
    .in("category_id", allCatIds);
  return (legacy ?? []).map((r) => r.id);
}

async function fetchProductIdsForCollectionSlugs(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slugs: string[],
): Promise<string[]> {
  const { data: cols } = await supabase
    .from("collections")
    .select("id")
    .in("slug", slugs);
  if (!cols || cols.length === 0) return [];
  const colIds = cols.map((c) => c.id);
  const { data: links } = await supabase
    .from("product_collections")
    .select("product_id")
    .in("collection_id", colIds);
  const m2mIds = (links ?? []).map((l) => l.product_id);
  if (m2mIds.length > 0) return Array.from(new Set(m2mIds));
  const { data: legacy } = await supabase
    .from("products")
    .select("id")
    .in("collection_id", colIds);
  return (legacy ?? []).map((r) => r.id);
}

async function fetchProductsForSearch(
  filters: ProductSearchFilters,
): Promise<ProductCardProduct[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT)
    .or("is_active.is.null,is_active.eq.true");

  if (filters.badges?.includes("nouveau")) query = query.eq("is_new", true);
  if (filters.badges?.includes("best-seller"))
    query = query.eq("is_featured", true);
  if (filters.badges?.includes("promo"))
    query = query.not("compare_at_price", "is", null);
  if (typeof filters.min === "number") query = query.gte("base_price", filters.min);
  if (typeof filters.max === "number") query = query.lte("base_price", filters.max);
  if (filters.q && filters.q.trim().length > 0) {
    const term = `%${filters.q.trim().replace(/[%]/g, "")}%`;
    query = query.or(
      `name.ilike.${term},short_description.ilike.${term},material.ilike.${term}`,
    );
  }
  if (filters.materiaux && filters.materiaux.length > 0) {
    const ors = filters.materiaux
      .map((m) => `material.ilike.%${m.replace(/[%]/g, "")}%`)
      .join(",");
    query = query.or(ors);
  }

  const idsByCategory = filters.categories?.length
    ? await fetchProductIdsForCategorySlugs(supabase, filters.categories)
    : null;
  const idsByCollection = filters.collections?.length
    ? await fetchProductIdsForCollectionSlugs(supabase, filters.collections)
    : null;
  if (idsByCategory !== null && idsByCategory.length === 0) return [];
  if (idsByCollection !== null && idsByCollection.length === 0) return [];

  let intersected: string[] | null = null;
  if (idsByCategory && idsByCollection) {
    const setB = new Set(idsByCollection);
    intersected = idsByCategory.filter((id) => setB.has(id));
    if (intersected.length === 0) return [];
  } else if (idsByCategory) {
    intersected = idsByCategory;
  } else if (idsByCollection) {
    intersected = idsByCollection;
  }
  if (intersected) query = query.in("id", intersected);

  query = query.order("sort_order", { ascending: true, nullsFirst: false });

  const { data, error } = await query;
  if (error) {
    console.error("[searchProducts:products]", error);
    return [];
  }
  return ((data ?? []) as unknown as ProductRow[]).map(rowToCard);
}

async function fetchPacksForSearch(
  filters: ProductSearchFilters,
): Promise<ProductCardProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("packs")
    .select("id, name, slug, description, image_url, created_at")
    .or("is_active.is.null,is_active.eq.true")
    .order("created_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[searchProducts:packs]", error);
    return [];
  }

  let cards: ProductCardProduct[] = (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    base_price: 0,
    compare_at_price: null,
    is_featured: false,
    media: p.image_url
      ? [{ url: p.image_url, alt_text: p.name, position: 0, is_primary: true }]
      : [],
    variants: [],
    badges: ["pack"],
    productType: "pack" as const,
    material: null,
    createdAt: p.created_at,
    description: p.description ?? null,
  }));

  if (filters.q && filters.q.trim().length > 0) {
    const term = filters.q.trim().toLowerCase();
    cards = cards.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.description ?? "").toLowerCase().includes(term),
    );
  }
  return cards;
}

export async function searchProducts(
  filters: ProductSearchFilters = {},
): Promise<ProductCardProduct[]> {
  const types =
    filters.types && filters.types.length > 0
      ? filters.types
      : (["produit", "pack"] as ProductTypeFilter[]);

  const wantsProducts = types.includes("produit");
  const wantsPacks = types.includes("pack");

  // Packs n'ont pas de variants/prix/matière/catégorie : si l'utilisateur applique
  // des filtres SQL stricts, on n'inclut pas les packs (sauf demande explicite).
  const restrictsPacks =
    (filters.badges && filters.badges.length > 0) ||
    typeof filters.min === "number" ||
    typeof filters.max === "number" ||
    (filters.materiaux && filters.materiaux.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.collections && filters.collections.length > 0);

  const explicitPackOnly = types.length === 1 && types[0] === "pack";

  const [products, packs] = await Promise.all([
    wantsProducts ? fetchProductsForSearch(filters) : Promise.resolve([]),
    wantsPacks && (!restrictsPacks || explicitPackOnly)
      ? fetchPacksForSearch(filters)
      : Promise.resolve([]),
  ]);

  let combined = [...products, ...packs];

  if (filters.badges?.includes("promo")) {
    combined = combined.filter(
      (c) =>
        c.compare_at_price !== null &&
        c.compare_at_price !== undefined &&
        c.compare_at_price > c.base_price,
    );
  }
  if (filters.badges?.includes("derniere-piece")) {
    combined = combined.filter((c) => {
      if (c.productType === "pack") return false;
      const total = (c.variants ?? []).reduce(
        (sum, v) => sum + v.stock_quantity,
        0,
      );
      return total > 0 && total < 5;
    });
  }

  switch (filters.tri) {
    case "prix-asc":
      combined.sort((a, b) => a.base_price - b.base_price);
      break;
    case "prix-desc":
      combined.sort((a, b) => b.base_price - a.base_price);
      break;
    case "nouveaute":
      combined.sort((a, b) => {
        const da = a.createdAt ? Date.parse(a.createdAt) : 0;
        const db = b.createdAt ? Date.parse(b.createdAt) : 0;
        return db - da;
      });
      break;
    case "promo":
      combined.sort((a, b) => {
        const ra =
          a.compare_at_price && a.compare_at_price > a.base_price
            ? (a.compare_at_price - a.base_price) / a.compare_at_price
            : -1;
        const rb =
          b.compare_at_price && b.compare_at_price > b.base_price
            ? (b.compare_at_price - b.base_price) / b.compare_at_price
            : -1;
        return rb - ra;
      });
      break;
    case "popularite":
    default:
      combined.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
      break;
  }

  if (filters.limit) combined = combined.slice(0, filters.limit);
  return combined;
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

// ============================================================================
// BANNERS (hero + barre d'annonce)
// ============================================================================

export interface PublicBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
}

async function getActiveBanner(
  placement: "hero" | "announcement_bar",
): Promise<PublicBanner | null> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("banners")
    .select("id, title, subtitle, image_url, link_url, starts_at, ends_at")
    .eq("placement", placement)
    .or("is_active.is.null,is_active.eq.true")
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`[getActiveBanner:${placement}]`, error);
    return null;
  }
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    imageUrl: data.image_url,
    linkUrl: data.link_url,
  };
}

export const getHeroBanner = () => getActiveBanner("hero");
export const getAnnouncementBanner = () => getActiveBanner("announcement_bar");

/**
 * Liste des product_id mis en favori par l'utilisateur connecté.
 * Renvoie un tableau vide si non authentifié.
 */
export async function getMyWishlistProductIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", user.id);
  if (error) {
    console.error("[getMyWishlistProductIds]", error);
    return [];
  }
  return Array.from(new Set((data ?? []).map((r) => r.product_id)));
}

// Best-sellers carousel sur la home — wrapper autour de searchProducts.
export const getBestSellers = (limit = 8) =>
  searchProducts({ badges: ["best-seller"], limit, types: ["produit"] });

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
  categorySlug: string | null;
  sortOrder: number;
}

export interface PublicFaqCategory {
  slug: string;
  name: string;
  count: number;
}

// Fallback côté code si category_slug est NULL en DB (avant migration 011)
function faqSlugifyFallback(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

interface FaqArticleRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  category_slug: string | null;
  sort_order: number | null;
}

export async function getPublicFaqArticles(): Promise<PublicFaqArticle[]> {
  const supabase = createBuildClient();
  const { data, error } = await supabase
    .from("faq_articles")
    .select("id, question, answer, category, category_slug, sort_order")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[getPublicFaqArticles]", error);
    return [];
  }

  return ((data ?? []) as unknown as FaqArticleRow[]).map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    categorySlug:
      row.category_slug ??
      (row.category ? faqSlugifyFallback(row.category) : null),
    sortOrder: row.sort_order ?? 0,
  }));
}

export async function getPublicFaqCategories(): Promise<PublicFaqCategory[]> {
  const articles = await getPublicFaqArticles();
  const counts = new Map<string, { name: string; count: number }>();
  for (const a of articles) {
    if (!a.category || !a.categorySlug) continue;
    const key = a.categorySlug;
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

/**
 * Cross-sell pour le panier : recommande des produits actifs qui ne sont pas
 * déjà dans le panier. On essaie d'abord de couvrir les mêmes catégories que
 * les produits du panier (clients en quête de plus du même type), puis on
 * complète avec des best-sellers / featured pour atteindre `limit`.
 *
 * Si le panier est vide, retombe sur les best-sellers.
 */
export async function getCartCrossSell(
  cartProductIds: string[],
  limit = 4,
): Promise<ProductCardProduct[]> {
  const supabase = await createClient();

  // Panier vide → best-sellers featured
  if (cartProductIds.length === 0) {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_CARD_SELECT)
      .or("is_active.is.null,is_active.eq.true")
      .eq("is_featured", true)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .limit(limit);
    if (error) {
      console.error("[getCartCrossSell] best-sellers fallback", error);
      return [];
    }
    return ((data ?? []) as unknown as ProductRow[]).map(rowToCard);
  }

  // 1. Récupérer les catégories des produits du panier
  const { data: cartProducts } = await supabase
    .from("products")
    .select("category_id")
    .in("id", cartProductIds);

  const categoryIds = Array.from(
    new Set(
      (cartProducts ?? [])
        .map((p) => p.category_id)
        .filter((c): c is string => !!c),
    ),
  );

  // 2. Tirer des produits dans ces catégories, en excluant les items déjà au panier
  let related: ProductCardProduct[] = [];
  if (categoryIds.length > 0) {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_CARD_SELECT)
      .or("is_active.is.null,is_active.eq.true")
      .in("category_id", categoryIds)
      .not("id", "in", `(${cartProductIds.join(",")})`)
      .order("is_featured", { ascending: false, nullsFirst: false })
      .order("sort_order", { ascending: true, nullsFirst: false })
      .limit(limit);
    if (error) {
      console.error("[getCartCrossSell] same-category", error);
    } else {
      related = ((data ?? []) as unknown as ProductRow[]).map(rowToCard);
    }
  }

  // 3. Compléter avec des featured si on n'a pas atteint la limite
  if (related.length < limit) {
    const exclude = [...cartProductIds, ...related.map((p) => p.id)];
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_CARD_SELECT)
      .or("is_active.is.null,is_active.eq.true")
      .eq("is_featured", true)
      .not("id", "in", `(${exclude.join(",")})`)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .limit(limit - related.length);
    if (!error) {
      related = [
        ...related,
        ...((data ?? []) as unknown as ProductRow[]).map(rowToCard),
      ];
    }
  }

  return related.slice(0, limit);
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

// ============================================================================
// PACKS
// ============================================================================

export type {
  PackDetail,
  PackItem,
  PackVariantOption,
  PackDiscountType,
} from "@/lib/pack-pricing";
export { computePackPrice } from "@/lib/pack-pricing";

import type { PackDetail, PackItem, PackVariantOption } from "@/lib/pack-pricing";
import { computePackPrice } from "@/lib/pack-pricing";

export async function getPackBySlug(slug: string): Promise<PackDetail | null> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const { data: pack, error } = await supabase
    .from("packs")
    .select(
      "id, name, slug, description, image_url, discount_type, discount_value, starts_at, ends_at",
    )
    .eq("slug", slug)
    .or("is_active.is.null,is_active.eq.true")
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
    .maybeSingle();

  if (error || !pack) {
    if (error) console.error("[getPackBySlug]", error);
    return null;
  }

  const { data: items } = await supabase
    .from("pack_items")
    .select(
      `id, product_id, sort_order, is_required,
       product:products (
         id, name, slug, short_description, base_price,
         product_media ( url, is_primary, sort_order ),
         product_variants ( id, name, sku, size, color, stone, material_variant,
                            length_cm, price_override, stock_quantity, is_active, sort_order )
       )`,
    )
    .eq("pack_id", pack.id)
    .order("sort_order", { ascending: true });

  type ItemRow = {
    id: string;
    product_id: string;
    sort_order: number | null;
    is_required: boolean | null;
    product?:
      | {
          id: string;
          name: string;
          slug: string;
          short_description: string | null;
          base_price: number | string;
          product_media: Array<{
            url: string;
            is_primary: boolean | null;
            sort_order: number | null;
          }>;
          product_variants: Array<{
            id: string;
            name: string | null;
            sku: string | null;
            size: string | null;
            color: string | null;
            stone: string | null;
            material_variant: string | null;
            length_cm: number | string | null;
            price_override: number | string | null;
            stock_quantity: number;
            is_active: boolean | null;
            sort_order: number | null;
          }>;
        }
      | Array<{
          id: string;
          name: string;
          slug: string;
          short_description: string | null;
          base_price: number | string;
          product_media: Array<{
            url: string;
            is_primary: boolean | null;
            sort_order: number | null;
          }>;
          product_variants: Array<{
            id: string;
            name: string | null;
            sku: string | null;
            size: string | null;
            color: string | null;
            stone: string | null;
            material_variant: string | null;
            length_cm: number | string | null;
            price_override: number | string | null;
            stock_quantity: number;
            is_active: boolean | null;
            sort_order: number | null;
          }>;
        }>
      | null;
  };

  const packItems: PackItem[] = ((items ?? []) as ItemRow[]).flatMap((it) => {
    const product = Array.isArray(it.product) ? it.product[0] : it.product;
    if (!product) return [];
    const media = product.product_media ?? [];
    const primary =
      media.find((m) => m.is_primary) ??
      media
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];

    const variants: PackVariantOption[] = (product.product_variants ?? [])
      .filter((v) => v.is_active !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((v) => ({
        id: v.id,
        name: v.name,
        size: v.size,
        color: v.color,
        stone: v.stone,
        material_variant: v.material_variant,
        length_cm: v.length_cm == null ? null : Number(v.length_cm),
        price_override:
          v.price_override == null ? null : Number(v.price_override),
        stock_quantity: v.stock_quantity,
        sku: v.sku,
      }));

    const item: PackItem = {
      id: it.id,
      product_id: it.product_id,
      product_name: product.name,
      product_slug: product.slug,
      product_short_description: product.short_description,
      base_price: Number(product.base_price),
      is_required: it.is_required ?? true,
      sort_order: it.sort_order ?? 0,
      image_url: primary?.url ?? null,
      variants,
    };
    return [item];
  });

  // Default pricing : 1ère variante (ou base_price) de chaque item, qty=1
  const lineItems = packItems.map((it) => ({
    price: it.variants[0]?.price_override ?? it.base_price,
    quantity: 1,
  }));
  const { subtotal, total, savings } = computePackPrice(
    lineItems,
    pack.discount_type as PackDetail["discount_type"],
    Number(pack.discount_value ?? 0),
  );

  return {
    id: pack.id,
    name: pack.name,
    slug: pack.slug,
    description: pack.description,
    image_url: pack.image_url,
    discount_type: pack.discount_type as PackDetail["discount_type"],
    discount_value: Number(pack.discount_value ?? 0),
    starts_at: pack.starts_at,
    ends_at: pack.ends_at,
    items: packItems,
    default_subtotal: subtotal,
    default_total: total,
    default_savings: savings,
  };
}

export async function getAllPackSlugs(): Promise<{ slug: string }[]> {
  const supabase = createBuildClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("packs")
    .select("slug")
    .or("is_active.is.null,is_active.eq.true")
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`);
  if (error) {
    console.error("[getAllPackSlugs]", error);
    return [];
  }
  return data ?? [];
}
