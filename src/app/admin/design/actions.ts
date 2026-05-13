"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";
import type { AdminDesignSettings } from "@/lib/queries/admin";

const KEY_MAPPING: Array<{
  key: keyof AdminDesignSettings;
  settingKey: string;
}> = [
  {
    key: "homeHeroBackgroundUrl",
    settingKey: "design.home_hero_background_url",
  },
  {
    key: "homeHeroOverlayOpacity",
    settingKey: "design.home_hero_overlay_opacity",
  },
];

function validate(config: AdminDesignSettings): string | null {
  const url = config.homeHeroBackgroundUrl?.trim() ?? "";
  if (url && !/^https?:\/\/.+/i.test(url) && !url.startsWith("/")) {
    return "L'URL de l'image doit commencer par https:// ou être un chemin local (/...)";
  }
  const op = config.homeHeroOverlayOpacity;
  if (!Number.isFinite(op) || op < 0 || op > 100) {
    return "L'opacité du voile doit être comprise entre 0 et 100.";
  }
  return null;
}

export async function updateDesignSettings(
  config: AdminDesignSettings,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const validationError = validate(config);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const admin = createAdminClient();

  for (const { key, settingKey } of KEY_MAPPING) {
    const raw = config[key];
    const value: unknown =
      typeof raw === "string" ? raw.trim() : Number(raw);

    const { data: existing } = await admin
      .from("settings")
      .select("id")
      .eq("key", settingKey)
      .maybeSingle();

    const payload = {
      key: settingKey,
      value: value as never,
      updated_by: auth.userId,
    };

    if (existing) {
      const { error } = await admin
        .from("settings")
        .update(payload)
        .eq("id", existing.id);
      if (error) {
        console.error(`[updateDesignSettings] ${settingKey}:`, error);
        return { ok: false, error: "Erreur de mise à jour" };
      }
    } else {
      const { error } = await admin.from("settings").insert(payload);
      if (error) {
        console.error(`[updateDesignSettings] insert ${settingKey}:`, error);
        return { ok: false, error: "Erreur d'enregistrement" };
      }
    }
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "settings",
    recordId: null,
    newData: { keys: KEY_MAPPING.map((m) => m.settingKey) },
  });

  revalidatePath("/admin/design");
  revalidatePath("/");
  return { ok: true };
}
