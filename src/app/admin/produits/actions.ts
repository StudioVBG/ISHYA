"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { slugify } from "@/lib/utils";

export interface ProductInput {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  compareAtPrice: number | null;
  sku: string | null;
  categoryId: string | null;
  collectionId: string | null;
  categoryIds: string[];
  collectionIds: string[];
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
}

export interface VariantInput {
  id?: string;
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
}

export interface MediaInput {
  id?: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

function validate(input: ProductInput): string | null {
  if (!input.name.trim()) return "Le nom est requis";
  if (!input.slug.trim()) return "Le slug est requis";
  if (!Number.isFinite(input.basePrice) || input.basePrice < 0)
    return "Le prix doit être positif";
  if (
    input.compareAtPrice != null &&
    Number.isFinite(input.compareAtPrice) &&
    input.compareAtPrice <= input.basePrice
  )
    return "Le prix barré doit être supérieur au prix de base";
  return null;
}

async function syncProductMemberships(
  admin: ReturnType<typeof createAdminClient>,
  productId: string,
  collectionIds: string[],
  categoryIds: string[],
) {
  // collections
  await admin
    .from("product_collections")
    .delete()
    .eq("product_id", productId);
  if (collectionIds.length > 0) {
    await admin.from("product_collections").insert(
      collectionIds.map((cid, idx) => ({
        product_id: productId,
        collection_id: cid,
        sort_order: idx,
      })),
    );
  }

  // categories
  await admin
    .from("product_categories")
    .delete()
    .eq("product_id", productId);
  if (categoryIds.length > 0) {
    await admin.from("product_categories").insert(
      categoryIds.map((cid, idx) => ({
        product_id: productId,
        category_id: cid,
        sort_order: idx,
      })),
    );
  }
}

export async function createProduct(
  input: ProductInput,
  variants: VariantInput[],
  media: MediaInput[],
): Promise<{ ok: boolean; error?: string; productId?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  const primaryCategoryId = input.categoryId ?? input.categoryIds[0] ?? null;
  const primaryCollectionId =
    input.collectionId ?? input.collectionIds[0] ?? null;

  const { data: product, error: productError } = await admin
    .from("products")
    .insert({
      name: input.name.trim(),
      slug: input.slug.trim() || slugify(input.name),
      short_description: input.shortDescription || null,
      description: input.description || null,
      base_price: input.basePrice,
      compare_at_price: input.compareAtPrice,
      sku: input.sku || null,
      category_id: primaryCategoryId,
      collection_id: primaryCollectionId,
      material: input.material,
      weight_g: input.weightG,
      dimensions: input.dimensions,
      care_instructions: input.careInstructions,
      is_nickel_free: input.isNickelFree,
      is_active: input.isActive,
      is_featured: input.isFeatured,
      is_new: input.isNew,
      seo_title: input.seoTitle,
      seo_description: input.seoDescription,
    })
    .select("id")
    .single();

  if (productError || !product) {
    console.error("[createProduct]", productError);
    return {
      ok: false,
      error:
        productError?.message?.includes("duplicate")
          ? "Ce slug est déjà utilisé"
          : "Erreur lors de la création du produit",
    };
  }

  if (variants.length > 0) {
    const { error: variantsError } = await admin
      .from("product_variants")
      .insert(
        variants.map((v, idx) => ({
          product_id: product.id,
          sku: v.sku,
          name: v.name,
          size: v.size,
          material_variant: v.materialVariant,
          stone: v.stone,
          color: v.color,
          length_cm: v.lengthCm,
          price_override: v.priceOverride,
          stock_quantity: v.stockQuantity,
          low_stock_threshold: v.lowStockThreshold,
          weight_g: v.weightG,
          is_active: v.isActive,
          sort_order: idx,
        })),
      );
    if (variantsError) {
      console.error("[createProduct] variants:", variantsError);
      // Rollback : on supprime le produit
      await admin.from("products").delete().eq("id", product.id);
      return { ok: false, error: "Erreur création variantes" };
    }
  }

  // Ensure at least the primary collection/category appear in the m2m
  const collectionIds = Array.from(
    new Set(
      [primaryCollectionId, ...input.collectionIds].filter(
        (v): v is string => !!v,
      ),
    ),
  );
  const categoryIds = Array.from(
    new Set(
      [primaryCategoryId, ...input.categoryIds].filter(
        (v): v is string => !!v,
      ),
    ),
  );
  await syncProductMemberships(admin, product.id, collectionIds, categoryIds);

  if (media.length > 0) {
    const { error: mediaError } = await admin.from("product_media").insert(
      media.map((m, idx) => ({
        product_id: product.id,
        url: m.url,
        alt_text: m.altText,
        is_primary: m.isPrimary,
        sort_order: m.sortOrder ?? idx,
      })),
    );
    if (mediaError) {
      console.error("[createProduct] media:", mediaError);
    }
  }

  revalidatePath("/admin/produits");
  revalidatePath("/admin");
  redirect(`/admin/produits/${product.id}`);
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  const primaryCategoryId = input.categoryId ?? input.categoryIds[0] ?? null;
  const primaryCollectionId =
    input.collectionId ?? input.collectionIds[0] ?? null;

  const { error } = await admin
    .from("products")
    .update({
      name: input.name.trim(),
      slug: input.slug.trim(),
      short_description: input.shortDescription || null,
      description: input.description || null,
      base_price: input.basePrice,
      compare_at_price: input.compareAtPrice,
      sku: input.sku || null,
      category_id: primaryCategoryId,
      collection_id: primaryCollectionId,
      material: input.material,
      weight_g: input.weightG,
      dimensions: input.dimensions,
      care_instructions: input.careInstructions,
      is_nickel_free: input.isNickelFree,
      is_active: input.isActive,
      is_featured: input.isFeatured,
      is_new: input.isNew,
      seo_title: input.seoTitle,
      seo_description: input.seoDescription,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateProduct]", error);
    return {
      ok: false,
      error: error.message?.includes("duplicate")
        ? "Ce slug est déjà utilisé"
        : "Erreur de mise à jour",
    };
  }

  const collectionIds = Array.from(
    new Set(
      [primaryCollectionId, ...input.collectionIds].filter(
        (v): v is string => !!v,
      ),
    ),
  );
  const categoryIds = Array.from(
    new Set(
      [primaryCategoryId, ...input.categoryIds].filter(
        (v): v is string => !!v,
      ),
    ),
  );
  await syncProductMemberships(admin, id, collectionIds, categoryIds);

  revalidatePath("/admin/produits");
  revalidatePath(`/admin/produits/${id}`);
  revalidatePath("/admin/collections");
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteProduct(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole(["admin", "super_admin"]);
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) {
    console.error("[deleteProduct]", error);
    return { ok: false, error: "Erreur de suppression" };
  }

  revalidatePath("/admin/produits");
  redirect("/admin/produits");
}

export async function upsertVariant(
  productId: string,
  variant: VariantInput,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const payload = {
    product_id: productId,
    sku: variant.sku,
    name: variant.name,
    size: variant.size,
    material_variant: variant.materialVariant,
    stone: variant.stone,
    color: variant.color,
    length_cm: variant.lengthCm,
    price_override: variant.priceOverride,
    stock_quantity: variant.stockQuantity,
    low_stock_threshold: variant.lowStockThreshold,
    weight_g: variant.weightG,
    is_active: variant.isActive,
  };

  if (variant.id) {
    const { error } = await admin
      .from("product_variants")
      .update(payload)
      .eq("id", variant.id);
    if (error) {
      console.error("[upsertVariant] update:", error);
      return { ok: false, error: "Erreur de mise à jour de la variante" };
    }
    // Garder inventory cohérent (le trigger ne couvre que les inserts)
    await admin
      .from("inventory")
      .update({ quantity: variant.stockQuantity })
      .eq("variant_id", variant.id);
  } else {
    const { error } = await admin.from("product_variants").insert(payload);
    if (error) {
      console.error("[upsertVariant] insert:", error);
      return { ok: false, error: "Erreur de création de la variante" };
    }
    // Le trigger trg_variant_create_inventory crée automatiquement la ligne inventory
  }

  revalidatePath(`/admin/produits/${productId}`);
  revalidatePath("/admin/stocks");
  return { ok: true };
}

export async function deleteVariant(
  productId: string,
  variantId: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("product_variants")
    .delete()
    .eq("id", variantId);
  if (error) {
    console.error("[deleteVariant]", error);
    return { ok: false, error: "Erreur de suppression" };
  }

  revalidatePath(`/admin/produits/${productId}`);
  revalidatePath("/admin/stocks");
  return { ok: true };
}

export async function upsertMedia(
  productId: string,
  media: MediaInput,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  if (!media.url.trim()) {
    return { ok: false, error: "URL requise" };
  }

  const admin = createAdminClient();

  // Si on définit comme primary, désactiver les autres primary
  if (media.isPrimary) {
    await admin
      .from("product_media")
      .update({ is_primary: false })
      .eq("product_id", productId);
  }

  const payload = {
    product_id: productId,
    url: media.url.trim(),
    alt_text: media.altText,
    is_primary: media.isPrimary,
    sort_order: media.sortOrder,
  };

  if (media.id) {
    const { error } = await admin
      .from("product_media")
      .update(payload)
      .eq("id", media.id);
    if (error) {
      console.error("[upsertMedia] update:", error);
      return { ok: false, error: "Erreur de mise à jour" };
    }
  } else {
    const { error } = await admin.from("product_media").insert(payload);
    if (error) {
      console.error("[upsertMedia] insert:", error);
      return { ok: false, error: "Erreur d'ajout du média" };
    }
  }

  revalidatePath(`/admin/produits/${productId}`);
  revalidatePath("/admin/produits");
  return { ok: true };
}

export async function deleteMedia(
  productId: string,
  mediaId: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("product_media")
    .delete()
    .eq("id", mediaId);
  if (error) {
    console.error("[deleteMedia]", error);
    return { ok: false, error: "Erreur de suppression" };
  }

  revalidatePath(`/admin/produits/${productId}`);
  revalidatePath("/admin/produits");
  return { ok: true };
}
