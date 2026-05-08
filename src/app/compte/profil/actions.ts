"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(80, "Prénom trop long (80 caractères max)"),
  lastName: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(80, "Nom trop long (80 caractères max)"),
  phone: z
    .string()
    .trim()
    .max(30, "Numéro de téléphone trop long")
    .nullable()
    .optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (YYYY-MM-DD)")
    .nullable()
    .optional(),
  avatarUrl: z.string().url("URL d'avatar invalide").nullable().optional(),
  newsletter: z.boolean(),
});

export type ProfileUpdateInput = z.infer<typeof profileSchema>;

export async function updateProfile(
  input: ProfileUpdateInput,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone ? data.phone : null,
      date_of_birth: data.birthDate ?? null,
      avatar_url: data.avatarUrl ?? null,
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
      .update({ email_marketing: data.newsletter })
      .eq("id", prefs.id);
  } else {
    await supabase.from("notification_preferences").insert({
      user_id: user.id,
      email_marketing: data.newsletter,
    });
  }

  revalidatePath("/compte/profil");
  revalidatePath("/compte");
  // Le header admin charge avatar_url depuis profiles → revalider le layout.
  revalidatePath("/admin", "layout");
  return { ok: true };
}

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(200, "Mot de passe trop long");

export async function updatePassword(
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Mot de passe invalide",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
