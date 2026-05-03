"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AccountSavedSizes } from "@/lib/queries/account";

export async function updateSavedSizes(
  input: AccountSavedSizes,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const payload = {
    user_id: user.id,
    ring_size: input.ringSize?.trim() || null,
    bracelet_size: input.braceletSize?.trim() || null,
    necklace_length: input.necklaceLength?.trim() || null,
    anklet_length: input.ankletLength?.trim() || null,
    label: input.label?.trim() || null,
  };

  const { data: existing } = await supabase
    .from("saved_sizes")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saved_sizes")
      .update(payload)
      .eq("id", existing.id);
    if (error) {
      console.error("[updateSavedSizes] update:", error);
      return { ok: false, error: "Erreur de mise à jour" };
    }
  } else {
    const { error } = await supabase.from("saved_sizes").insert(payload);
    if (error) {
      console.error("[updateSavedSizes] insert:", error);
      return { ok: false, error: "Erreur d'enregistrement" };
    }
  }

  revalidatePath("/compte/tailles");
  return { ok: true };
}
