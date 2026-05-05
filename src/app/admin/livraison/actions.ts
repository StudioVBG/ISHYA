"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";

function revalidateAll() {
  revalidatePath("/admin/livraison");
  revalidatePath("/checkout");
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

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("shipping_zones")
    .insert({
      name: input.name.trim(),
      countries: input.countries,
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
    newData: input,
  });
  revalidateAll();
  return { ok: true };
}

export async function updateShippingZone(
  id: string,
  input: ShippingZoneInput,
): Promise<{ ok: boolean; error?: string }> {
  if (!input.name.trim()) return { ok: false, error: "Nom requis" };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("shipping_zones")
    .update({
      name: input.name.trim(),
      countries: input.countries,
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
    newData: input,
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
