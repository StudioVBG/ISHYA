"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";
import { validateCountryCodes } from "@/lib/shipping/iso-3166";
import type { SupabaseClient } from "@supabase/supabase-js";

function revalidateAll() {
  revalidatePath("/admin/livraison");
  revalidatePath("/checkout");
}

/**
 * Renvoie le nombre de zones actives, à l'exclusion d'une zone donnée
 * (utile pour valider qu'une mutation ne va pas laisser zéro zone active).
 */
async function countActiveZonesExcluding(
  admin: SupabaseClient,
  excludeId: string | null,
): Promise<number> {
  let query = admin
    .from("shipping_zones")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);
  if (excludeId) query = query.neq("id", excludeId);
  const { count } = await query;
  return count ?? 0;
}

// ─── Zones ───────────────────────────────────────────────────────────────────

export interface ShippingZoneInput {
  name: string;
  countries: string[];
  isActive: boolean;
}

export async function createShippingZone(
  input: ShippingZoneInput,
): Promise<{ ok: boolean; error?: string }> {
  if (!input.name.trim()) return { ok: false, error: "Nom requis" };

  const validated = validateCountryCodes(input.countries);
  if (!validated.ok) {
    return {
      ok: false,
      error: `Code pays invalide : « ${validated.invalidCode} » (utilisez ISO 3166-1 alpha-2)`,
    };
  }

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("shipping_zones")
    .insert({
      name: input.name.trim(),
      countries: validated.codes,
      is_active: input.isActive,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createShippingZone]", error);
    return { ok: false, error: "Erreur de création" };
  }
  await logAuditEvent({
    userId: auth.userId,
    action: "insert",
    tableName: "shipping_zones",
    recordId: data?.id ?? null,
    newData: { ...input, countries: validated.codes },
  });
  revalidateAll();
  return { ok: true };
}

export async function updateShippingZone(
  id: string,
  input: ShippingZoneInput,
): Promise<{ ok: boolean; error?: string }> {
  if (!input.name.trim()) return { ok: false, error: "Nom requis" };

  const validated = validateCountryCodes(input.countries);
  if (!validated.ok) {
    return {
      ok: false,
      error: `Code pays invalide : « ${validated.invalidCode} » (utilisez ISO 3166-1 alpha-2)`,
    };
  }

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  // Si on désactive cette zone, vérifier qu'au moins une autre reste active.
  if (!input.isActive) {
    const otherActive = await countActiveZonesExcluding(admin, id);
    if (otherActive === 0) {
      return {
        ok: false,
        error:
          "Impossible de désactiver : il s'agit de la dernière zone active. Activez-en une autre d'abord.",
      };
    }
  }

  const { error } = await admin
    .from("shipping_zones")
    .update({
      name: input.name.trim(),
      countries: validated.codes,
      is_active: input.isActive,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateShippingZone]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }
  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "shipping_zones",
    recordId: id,
    newData: { ...input, countries: validated.codes },
  });
  revalidateAll();
  return { ok: true };
}

export async function deleteShippingZone(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  // Garde-fou : refuser de supprimer la dernière zone active afin de ne pas
  // casser le checkout.
  const { data: existing } = await admin
    .from("shipping_zones")
    .select("is_active")
    .eq("id", id)
    .maybeSingle();

  if (existing?.is_active) {
    const otherActive = await countActiveZonesExcluding(admin, id);
    if (otherActive === 0) {
      return {
        ok: false,
        error:
          "Impossible de supprimer la dernière zone active (le checkout serait cassé). Créez ou activez une autre zone d'abord.",
      };
    }
  }

  const { error } = await admin.from("shipping_zones").delete().eq("id", id);
  if (error) {
    console.error("[deleteShippingZone]", error);
    return { ok: false, error: "Erreur de suppression" };
  }
  await logAuditEvent({
    userId: auth.userId,
    action: "delete",
    tableName: "shipping_zones",
    recordId: id,
  });
  revalidateAll();
  return { ok: true };
}

// ─── Methods ────────────────────────────────────────────────────────────────

export interface ShippingMethodInput {
  zoneId: string;
  name: string;
  carrier: string | null;
  description: string | null;
  price: number;
  freeAbove: number | null;
  estimatedDaysMin: number | null;
  estimatedDaysMax: number | null;
  sortOrder: number;
  isActive: boolean;
}

function validateMethod(input: ShippingMethodInput): string | null {
  if (!input.zoneId) return "Zone requise";
  if (!input.name.trim()) return "Nom requis";
  if (!Number.isFinite(input.price) || input.price < 0)
    return "Prix invalide";
  if (input.freeAbove != null) {
    if (!Number.isFinite(input.freeAbove) || input.freeAbove < 0)
      return "Le seuil de gratuité doit être positif";
    if (input.freeAbove <= input.price)
      return "Le seuil de gratuité doit être supérieur au prix de la livraison";
  }
  if (
    input.estimatedDaysMin != null &&
    input.estimatedDaysMax != null &&
    input.estimatedDaysMax < input.estimatedDaysMin
  ) {
    return "Le délai max doit être ≥ délai min";
  }
  return null;
}

export async function createShippingMethod(
  input: ShippingMethodInput,
): Promise<{ ok: boolean; error?: string }> {
  const v = validateMethod(input);
  if (v) return { ok: false, error: v };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("shipping_methods")
    .insert({
      zone_id: input.zoneId,
      name: input.name.trim(),
      carrier: input.carrier?.trim() || null,
      description: input.description?.trim() || null,
      price: input.price,
      free_above: input.freeAbove,
      estimated_days_min: input.estimatedDaysMin,
      estimated_days_max: input.estimatedDaysMax,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createShippingMethod]", error);
    return { ok: false, error: "Erreur de création" };
  }
  await logAuditEvent({
    userId: auth.userId,
    action: "insert",
    tableName: "shipping_methods",
    recordId: data?.id ?? null,
    newData: input,
  });
  revalidateAll();
  return { ok: true };
}

export async function updateShippingMethod(
  id: string,
  input: ShippingMethodInput,
): Promise<{ ok: boolean; error?: string }> {
  const v = validateMethod(input);
  if (v) return { ok: false, error: v };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("shipping_methods")
    .update({
      zone_id: input.zoneId,
      name: input.name.trim(),
      carrier: input.carrier?.trim() || null,
      description: input.description?.trim() || null,
      price: input.price,
      free_above: input.freeAbove,
      estimated_days_min: input.estimatedDaysMin,
      estimated_days_max: input.estimatedDaysMax,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateShippingMethod]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }
  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "shipping_methods",
    recordId: id,
    newData: input,
  });
  revalidateAll();
  return { ok: true };
}

export async function deleteShippingMethod(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("shipping_methods")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteShippingMethod]", error);
    return { ok: false, error: "Erreur de suppression" };
  }
  await logAuditEvent({
    userId: auth.userId,
    action: "delete",
    tableName: "shipping_methods",
    recordId: id,
  });
  revalidateAll();
  return { ok: true };
}

/**
 * Réordonne les méthodes d'une zone (sort_order). Bulk upsert pour 1
 * round-trip au lieu de N. Vérifie que tous les ids appartiennent bien à
 * la zone (anti-injection).
 */
export async function reorderShippingMethods(
  zoneId: string,
  orderedIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  if (orderedIds.length === 0) return { ok: true };

  const admin = createAdminClient();

  // Vérifie l'appartenance + récupère les NOT NULL pour le upsert.
  const { data: existing, error: fetchError } = await admin
    .from("shipping_methods")
    .select(
      "id, zone_id, name, carrier, description, price, free_above, estimated_days_min, estimated_days_max, is_active",
    )
    .eq("zone_id", zoneId)
    .in("id", orderedIds);

  if (fetchError) {
    console.error("[reorderShippingMethods] fetch", fetchError);
    return { ok: false, error: "Erreur de lecture" };
  }
  if (!existing || existing.length !== orderedIds.length) {
    return { ok: false, error: "Méthodes invalides ou hors zone" };
  }

  type ExistingRow = (typeof existing)[number];
  const byId = new Map<string, ExistingRow>(
    existing.map((r) => [r.id as string, r]),
  );
  const rows = orderedIds.map((id, i) => {
    const r = byId.get(id)!;
    return { ...r, sort_order: i };
  });

  const { error } = await admin
    .from("shipping_methods")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("[reorderShippingMethods] upsert", error);
    return { ok: false, error: "Erreur de réordonnancement" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "reorder",
    tableName: "shipping_methods",
    recordId: zoneId,
    newData: { count: orderedIds.length, zone_id: zoneId },
  });

  revalidateAll();
  return { ok: true };
}
