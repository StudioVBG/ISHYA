"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";
import type { AdminSocialLinks } from "@/lib/queries/admin";

const KEY_MAPPING: Array<{ key: keyof AdminSocialLinks; settingKey: string }> = [
  { key: "instagramUrl", settingKey: "social.instagram_url" },
  { key: "facebookUrl", settingKey: "social.facebook_url" },
  { key: "pinterestUrl", settingKey: "social.pinterest_url" },
  { key: "tiktokUrl", settingKey: "social.tiktok_url" },
  { key: "youtubeUrl", settingKey: "social.youtube_url" },
  { key: "contactEmail", settingKey: "social.contact_email" },
];

const URL_KEYS: Array<keyof AdminSocialLinks> = [
  "instagramUrl",
  "facebookUrl",
  "pinterestUrl",
  "tiktokUrl",
  "youtubeUrl",
];

/**
 * Validation côté serveur — autorise les chaînes vides (= pas de lien) et
 * impose `https://` pour les URLs (jamais `http://` en clair) et un format
 * email plausible pour le contact.
 */
function validate(config: AdminSocialLinks): string | null {
  for (const key of URL_KEYS) {
    const value = config[key]?.trim() ?? "";
    if (!value) continue;
    if (!/^https:\/\/.+\..+/i.test(value)) {
      return `${labelFor(key)} : l'URL doit commencer par https:// (laissez vide pour masquer)`;
    }
  }
  const email = config.contactEmail?.trim() ?? "";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "L'email de contact n'est pas valide";
  }
  return null;
}

function labelFor(key: keyof AdminSocialLinks): string {
  switch (key) {
    case "instagramUrl":
      return "Instagram";
    case "facebookUrl":
      return "Facebook";
    case "pinterestUrl":
      return "Pinterest";
    case "tiktokUrl":
      return "TikTok";
    case "youtubeUrl":
      return "YouTube";
    case "contactEmail":
      return "Email de contact";
  }
}

export async function updateSocialLinks(
  config: AdminSocialLinks,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const validationError = validate(config);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const admin = createAdminClient();

  for (const { key, settingKey } of KEY_MAPPING) {
    const value = config[key]?.trim() ?? "";

    const { data: existing } = await admin
      .from("settings")
      .select("id")
      .eq("key", settingKey)
      .maybeSingle();

    const payload = {
      key: settingKey,
      // Stocké comme JSON string (la colonne est JSONB).
      value: value as never,
      updated_by: auth.userId,
    };

    if (existing) {
      const { error } = await admin
        .from("settings")
        .update(payload)
        .eq("id", existing.id);
      if (error) {
        console.error(`[updateSocialLinks] ${settingKey}:`, error);
        return { ok: false, error: "Erreur de mise à jour" };
      }
    } else {
      const { error } = await admin.from("settings").insert(payload);
      if (error) {
        console.error(`[updateSocialLinks] insert ${settingKey}:`, error);
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

  // Le footer du storefront lit ces clés ; on invalide tous les caches qui
  // l'incluent (= le layout root).
  revalidatePath("/admin/reseaux-sociaux");
  revalidatePath("/", "layout");
  return { ok: true };
}
