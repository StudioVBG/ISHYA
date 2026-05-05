"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";

export interface SettingInput {
  key: string;
  description: string | null;
  value: unknown;
}

function parseValue(raw: string): { ok: true; value: unknown } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: null };
  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch {
    // Si ce n'est pas du JSON, on stocke en string
    return { ok: true, value: trimmed };
  }
}

export async function upsertSetting(
  input: SettingInput & { id?: string; rawValue?: string },
): Promise<{ ok: boolean; error?: string }> {
  if (!input.key.trim()) {
    return { ok: false, error: "Clé requise" };
  }

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const value = input.rawValue !== undefined
    ? parseValue(input.rawValue)
    : { ok: true as const, value: input.value };

  if (!value.ok) {
    return { ok: false, error: "Valeur invalide" };
  }

  const admin = createAdminClient();
  const payload = {
    key: input.key.trim(),
    description: input.description?.trim() || null,
    value: value.value as never,
    updated_by: auth.userId,
  };

  if (input.id) {
    const { data: previous } = await admin
      .from("settings")
      .select("value")
      .eq("id", input.id)
      .maybeSingle();

    const { error } = await admin
      .from("settings")
      .update(payload)
      .eq("id", input.id);
    if (error) {
      console.error("[upsertSetting] update:", error);
      return { ok: false, error: "Erreur de mise à jour" };
    }
    await logAuditEvent({
      userId: auth.userId,
      action: "update",
      tableName: "settings",
      recordId: input.id,
      oldData: { value: previous?.value ?? null },
      newData: { key: payload.key, value: payload.value },
    });
  } else {
    const { data: created, error } = await admin
      .from("settings")
      .insert(payload)
      .select("id")
      .single();
    if (error) {
      console.error("[upsertSetting] insert:", error);
      return {
        ok: false,
        error: error.message?.includes("duplicate")
          ? "Cette clé existe déjà"
          : "Erreur de création",
      };
    }
    await logAuditEvent({
      userId: auth.userId,
      action: "insert",
      tableName: "settings",
      recordId: created?.id ?? null,
      newData: { key: payload.key, value: payload.value },
    });
  }

  revalidatePath("/admin/parametres");
  return { ok: true };
}

export async function deleteSetting(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data: previous } = await admin
    .from("settings")
    .select("key, value")
    .eq("id", id)
    .maybeSingle();

  const { error } = await admin.from("settings").delete().eq("id", id);
  if (error) {
    console.error("[deleteSetting]", error);
    return { ok: false, error: "Erreur de suppression" };
  }
  await logAuditEvent({
    userId: auth.userId,
    action: "delete",
    tableName: "settings",
    recordId: id,
    oldData: previous ?? null,
  });
  revalidatePath("/admin/parametres");
  return { ok: true };
}
