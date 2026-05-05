"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { slugify } from "@/lib/utils";

interface CreateProductResult {
  ok: boolean;
  error?: string;
  productId?: string;
  warnings?: string[];
}

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
  storagePath?: string | null;
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
): Promise<CreateProductResult> {
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
      await admin.from("products").delete().eq("id", product.id);
      return { ok: false, error: "Erreur création variantes" };
    }
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
  await syncProductMemberships(admin, product.id, collectionIds, categoryIds);

  const warnings: string[] = [];
  if (media.length > 0) {
    const { error: mediaError } = await admin.from("product_media").insert(
      media.map((m, idx) => ({
        product_id: product.id,
        url: m.url,
        storage_path: m.storagePath ?? null,
        alt_text: m.altText,
        is_primary: m.isPrimary,
        sort_order: m.sortOrder ?? idx,
      })),
    );
    if (mediaError) {
      console.error("[createProduct] media:", mediaError);
      warnings.push(
        "Le produit est créé mais les photos n'ont pas pu être enregistrées. Réessaie depuis l'onglet Photos.",
      );
    }
  }

  revalidatePath("/admin/produits");
  revalidatePath("/admin");

  return { ok: true, productId: product.id, warnings };
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
  const auth = await requireAdminRole();
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

/**
 * Synchronise la liste complète des déclinaisons d'un produit.
 * - Insère les nouvelles (sans id)
 * - Met à jour les existantes
 * - Supprime celles retirées de la liste
 */
export async function replaceVariants(
  productId: string,
  variants: VariantInput[],
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  const { data: current, error: fetchError } = await admin
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);

  if (fetchError) {
    console.error("[replaceVariants] fetch:", fetchError);
    return { ok: false, error: "Erreur de lecture des déclinaisons" };
  }

  const incomingIds = new Set(
    variants.map((v) => v.id).filter((id): id is string => !!id),
  );
  const idsToDelete = (current ?? [])
    .map((row) => row.id)
    .filter((id) => !incomingIds.has(id));

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await admin
      .from("product_variants")
      .delete()
      .in("id", idsToDelete);
    if (deleteError) {
      console.error("[replaceVariants] delete:", deleteError);
      return { ok: false, error: "Erreur de suppression d'une déclinaison" };
    }
  }

  for (const [idx, v] of variants.entries()) {
    const payload = {
      product_id: productId,
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
    };

    if (v.id && (current ?? []).some((row) => row.id === v.id)) {
      const { error } = await admin
        .from("product_variants")
        .update(payload)
        .eq("id", v.id);
      if (error) {
        console.error("[replaceVariants] update:", error);
        return { ok: false, error: "Erreur de mise à jour d'une déclinaison" };
      }
      await admin
        .from("inventory")
        .update({ quantity: v.stockQuantity })
        .eq("variant_id", v.id);
    } else {
      const { error } = await admin.from("product_variants").insert(payload);
      if (error) {
        console.error("[replaceVariants] insert:", error);
        return { ok: false, error: "Erreur de création d'une déclinaison" };
      }
    }
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
    storage_path: media.storagePath ?? null,
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

  const { data: existing } = await admin
    .from("product_media")
    .select("storage_path")
    .eq("id", mediaId)
    .maybeSingle();

  const { error } = await admin
    .from("product_media")
    .delete()
    .eq("id", mediaId);
  if (error) {
    console.error("[deleteMedia]", error);
    return { ok: false, error: "Erreur de suppression" };
  }

  if (existing?.storage_path) {
    await admin.storage
      .from("products-media")
      .remove([existing.storage_path])
      .catch((err) => console.warn("[deleteMedia] storage cleanup:", err));
  }

  revalidatePath(`/admin/produits/${productId}`);
  revalidatePath("/admin/produits");
  return { ok: true };
}

/**
 * Synchronise la liste complète des photos d'un produit en une seule opération.
 * - Insère les nouvelles photos (sans persistedId)
 * - Met à jour celles déjà persistées
 * - Supprime celles qui ne sont plus dans la liste (et leurs fichiers Storage)
 */
export async function replaceMedia(
  productId: string,
  mediaList: MediaInput[],
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  const { data: current, error: fetchError } = await admin
    .from("product_media")
    .select("id, storage_path")
    .eq("product_id", productId);

  if (fetchError) {
    console.error("[replaceMedia] fetch:", fetchError);
    return { ok: false, error: "Erreur de lecture des photos existantes" };
  }

  const incomingIds = new Set(
    mediaList.map((m) => m.id).filter((id): id is string => !!id),
  );
  const toDelete = (current ?? []).filter((row) => !incomingIds.has(row.id));

  if (toDelete.length > 0) {
    const idsToDelete = toDelete.map((r) => r.id);
    const { error: deleteError } = await admin
      .from("product_media")
      .delete()
      .in("id", idsToDelete);
    if (deleteError) {
      console.error("[replaceMedia] delete:", deleteError);
      return { ok: false, error: "Erreur de suppression des photos retirées" };
    }
    const pathsToRemove = toDelete
      .map((r) => r.storage_path)
      .filter((p): p is string => !!p);
    if (pathsToRemove.length > 0) {
      await admin.storage
        .from("products-media")
        .remove(pathsToRemove)
        .catch((err) => console.warn("[replaceMedia] storage cleanup:", err));
    }
  }

  const primaryCount = mediaList.filter((m) => m.isPrimary).length;
  const normalized = mediaList.map((m, idx) => ({
    ...m,
    sortOrder: idx,
    isPrimary:
      primaryCount === 0 && idx === 0
        ? true
        : primaryCount > 1
          ? idx === mediaList.findIndex((x) => x.isPrimary)
          : m.isPrimary,
  }));

  for (const m of normalized) {
    if (m.id && (current ?? []).some((row) => row.id === m.id)) {
      const { error } = await admin
        .from("product_media")
        .update({
          url: m.url,
          storage_path: m.storagePath ?? null,
          alt_text: m.altText,
          is_primary: m.isPrimary,
          sort_order: m.sortOrder,
        })
        .eq("id", m.id);
      if (error) {
        console.error("[replaceMedia] update:", error);
        return { ok: false, error: "Erreur de mise à jour d'une photo" };
      }
    } else {
      const { error } = await admin.from("product_media").insert({
        product_id: productId,
        url: m.url,
        storage_path: m.storagePath ?? null,
        alt_text: m.altText,
        is_primary: m.isPrimary,
        sort_order: m.sortOrder,
      });
      if (error) {
        console.error("[replaceMedia] insert:", error);
        return { ok: false, error: "Erreur d'ajout d'une photo" };
      }
    }
  }

  revalidatePath(`/admin/produits/${productId}`);
  revalidatePath("/admin/produits");
  return { ok: true };
}
