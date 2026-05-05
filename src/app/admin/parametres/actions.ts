"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";

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
    const { error } = await admin
      .from("settings")
      .update(payload)
      .eq("id", input.id);
    if (error) {
      console.error("[upsertSetting] update:", error);
      return { ok: false, error: "Erreur de mise à jour" };
    }
  } else {
    const { error } = await admin.from("settings").insert(payload);
    if (error) {
      console.error("[upsertSetting] insert:", error);
      return {
        ok: false,
        error: error.message?.includes("duplicate")
          ? "Cette clé existe déjà"
          : "Erreur de création",
      };
    }
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
  const { error } = await admin.from("settings").delete().eq("id", id);
  if (error) {
    console.error("[deleteSetting]", error);
    return { ok: false, error: "Erreur de suppression" };
  }
  revalidatePath("/admin/parametres");
  return { ok: true };
}
