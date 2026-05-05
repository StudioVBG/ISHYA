"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";

export type AppRole = "customer" | "admin";

const ALLOWED_ROLES: AppRole[] = ["customer", "admin"];

export async function updateMemberRole(
  userId: string,
  role: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!ALLOWED_ROLES.includes(role as AppRole)) {
    return { ok: false, error: "Rôle invalide" };
  }

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  // Empêcher de se rétrograder soi-même (sinon plus aucun admin sur le shop)
  if (userId === auth.userId && role !== "admin") {
    return {
      ok: false,
      error: "Vous ne pouvez pas retirer votre propre rôle d'admin",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role: role as AppRole })
    .eq("id", userId);

  if (error) {
    console.error("[updateMemberRole]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }

  revalidatePath("/admin/equipe");
  return { ok: true };
}

export async function toggleMemberActive(
  userId: string,
  isActive: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  if (userId === auth.userId && !isActive) {
    return {
      ok: false,
      error: "Vous ne pouvez pas désactiver votre propre compte",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) {
    console.error("[toggleMemberActive]", error);
    return { ok: false, error: "Erreur" };
  }

  revalidatePath("/admin/equipe");
  return { ok: true };
}
