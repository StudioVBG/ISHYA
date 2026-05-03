"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AccountNotificationPrefs } from "@/lib/queries/account";

export async function updateNotificationPrefs(
  input: AccountNotificationPrefs,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const payload = {
    user_id: user.id,
    email_marketing: input.emailMarketing,
    email_order_updates: input.emailOrderUpdates,
    email_review_replies: input.emailReviewReplies,
    sms_marketing: input.smsMarketing,
    sms_order_updates: input.smsOrderUpdates,
    push_enabled: input.pushEnabled,
  };

  const { data: existing } = await supabase
    .from("notification_preferences")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("notification_preferences")
      .update(payload)
      .eq("id", existing.id);
    if (error) {
      console.error("[updateNotificationPrefs] update:", error);
      return { ok: false, error: "Erreur de mise à jour" };
    }
  } else {
    const { error } = await supabase
      .from("notification_preferences")
      .insert(payload);
    if (error) {
      console.error("[updateNotificationPrefs] insert:", error);
      return { ok: false, error: "Erreur d'enregistrement" };
    }
  }

  revalidatePath("/compte/notifications");
  revalidatePath("/compte/profil");
  return { ok: true };
}
