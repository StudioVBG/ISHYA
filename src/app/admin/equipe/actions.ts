"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";

export type AdminRole =
  | "customer"
  | "support"
  | "editor"
  | "admin"
  | "super_admin";

const ALLOWED_ROLES: AdminRole[] = [
  "customer",
  "support",
  "editor",
  "admin",
  "super_admin",
];

export async function updateMemberRole(
  userId: string,
  role: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!ALLOWED_ROLES.includes(role as AdminRole)) {
    return { ok: false, error: "Rôle invalide" };
  }

  // Seul super_admin peut promouvoir/déclasser des admins
  const auth = await requireAdminRole(["super_admin"]);
  if (!auth.ok) return auth;

  // Empêcher de se déclasser soi-même
  if (userId === auth.userId && role !== "super_admin") {
    return {
      ok: false,
      error: "Vous ne pouvez pas modifier votre propre rôle de super-admin",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role: role as AdminRole })
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
  const auth = await requireAdminRole(["super_admin"]);
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
