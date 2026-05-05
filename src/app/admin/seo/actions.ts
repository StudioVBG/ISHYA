"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import type { AdminSeoConfig } from "@/lib/queries/admin";

const KEY_MAPPING: Array<{ key: keyof AdminSeoConfig; settingKey: string }> = [
  { key: "homeMetaTitle", settingKey: "seo.home_meta_title" },
  { key: "homeMetaDescription", settingKey: "seo.home_meta_description" },
  { key: "homeOgImageUrl", settingKey: "seo.home_og_image" },
  { key: "defaultKeywords", settingKey: "seo.default_keywords" },
  { key: "twitterHandle", settingKey: "seo.twitter_handle" },
  { key: "googleSiteVerification", settingKey: "seo.google_site_verification" },
  { key: "bingSiteVerification", settingKey: "seo.bing_site_verification" },
];

export async function updateSeoConfig(
  config: AdminSeoConfig,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

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
      value: value as never,
      updated_by: auth.userId,
    };

    if (existing) {
      const { error } = await admin
        .from("settings")
        .update(payload)
        .eq("id", existing.id);
      if (error) {
        console.error(`[updateSeoConfig] ${settingKey}:`, error);
        return { ok: false, error: "Erreur de mise à jour" };
      }
    } else {
      const { error } = await admin.from("settings").insert(payload);
      if (error) {
        console.error(`[updateSeoConfig] insert ${settingKey}:`, error);
        return { ok: false, error: "Erreur d'enregistrement" };
      }
    }
  }

  revalidatePath("/admin/seo");
  revalidatePath("/", "layout");
  return { ok: true };
}
