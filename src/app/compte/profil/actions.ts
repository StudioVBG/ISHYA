"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ProfileUpdateInput {
  firstName: string;
  lastName: string;
  phone: string | null;
  birthDate: string | null;
  newsletter: boolean;
}

export async function updateProfile(
  input: ProfileUpdateInput,
): Promise<{ ok: boolean; error?: string }> {
  if (!input.firstName.trim() || input.firstName.trim().length < 2) {
    return { ok: false, error: "Le prénom doit contenir au moins 2 caractères" };
  }
  if (!input.lastName.trim() || input.lastName.trim().length < 2) {
    return { ok: false, error: "Le nom doit contenir au moins 2 caractères" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      phone: input.phone?.trim() || null,
      date_of_birth: input.birthDate || null,
    })
    .eq("id", user.id);

  if (profileError) {
    console.error("[updateProfile] profiles:", profileError);
    return { ok: false, error: "Erreur lors de la mise à jour du profil" };
  }

  // Newsletter pref → notification_preferences
  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (prefs) {
    await supabase
      .from("notification_preferences")
      .update({ email_marketing: input.newsletter })
      .eq("id", prefs.id);
  } else {
    await supabase.from("notification_preferences").insert({
      user_id: user.id,
      email_marketing: input.newsletter,
    });
  }

  revalidatePath("/compte/profil");
  revalidatePath("/compte");
  return { ok: true };
}

export async function updatePassword(
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  if (newPassword.length < 8) {
    return {
      ok: false,
      error: "Le mot de passe doit contenir au moins 8 caractères",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
