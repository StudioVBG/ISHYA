"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AppRole = "customer" | "admin";

const ALLOWED_ROLES: AppRole[] = ["customer", "admin"];

/**
 * Compte les autres admins actifs (≠ excludeUserId). Sert à empêcher la
 * désactivation ou rétrogradation du dernier admin actif.
 */
async function countOtherActiveAdmins(
  admin: SupabaseClient,
  excludeUserId: string,
): Promise<number> {
  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin")
    .eq("is_active", true)
    .neq("id", excludeUserId);
  return count ?? 0;
}

export async function updateMemberRole(
  userId: string,
  role: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!ALLOWED_ROLES.includes(role as AppRole)) {
    return { ok: false, error: "Rôle invalide" };
  }

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  if (userId === auth.userId && role !== "admin") {
    return {
      ok: false,
      error: "Vous ne pouvez pas retirer votre propre rôle d'admin",
    };
  }

  const admin = createAdminClient();
  const { data: previous } = await admin
    .from("profiles")
    .select("role, is_active")
    .eq("id", userId)
    .maybeSingle();

  // Si on rétrograde un admin actif, vérifier qu'il reste au moins un autre
  // admin actif pour ne pas se retrouver sans personne aux commandes.
  if (
    previous?.role === "admin" &&
    previous?.is_active &&
    role !== "admin"
  ) {
    const others = await countOtherActiveAdmins(admin, userId);
    if (others === 0) {
      return {
        ok: false,
        error:
          "Impossible de rétrograder le dernier admin actif. Promeut un autre client en admin d'abord.",
      };
    }
  }

  const { error } = await admin
    .from("profiles")
    .update({ role: role as AppRole })
    .eq("id", userId);

  if (error) {
    console.error("[updateMemberRole]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "profiles",
    recordId: userId,
    oldData: { role: previous?.role ?? null },
    newData: { role },
  });

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

  // Si on désactive, vérifier qu'au moins un autre admin actif reste après
  // (uniquement pour les admins — un client désactivé ne change rien).
  if (!isActive) {
    const { data: target } = await admin
      .from("profiles")
      .select("role, is_active")
      .eq("id", userId)
      .maybeSingle();

    if (target?.role === "admin" && target?.is_active) {
      const others = await countOtherActiveAdmins(admin, userId);
      if (others === 0) {
        return {
          ok: false,
          error:
            "Impossible de désactiver le dernier admin actif. Activez ou promeut un autre admin d'abord.",
        };
      }
    }
  }

  const { error } = await admin
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) {
    console.error("[toggleMemberActive]", error);
    return { ok: false, error: "Erreur" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "profiles",
    recordId: userId,
    newData: { is_active: isActive },
  });

  revalidatePath("/admin/equipe");
  return { ok: true };
}

/**
 * Promeut un client en admin par recherche d'email. Permet de contourner la
 * limitation actuelle de `getAdminTeamMembers` (qui ne charge que les profils
 * `role=admin`) sans charger toute la base des clients dans la liste.
 */
export async function promoteUserByEmail(
  email: string,
): Promise<{ ok: boolean; error?: string; userId?: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { ok: false, error: "Email requis" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: "Email invalide" };
  }

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, is_active")
    .ilike("email", trimmed)
    .maybeSingle();

  if (!profile) {
    return {
      ok: false,
      error: "Aucun compte trouvé avec cet email",
    };
  }

  if (profile.role === "admin") {
    return {
      ok: false,
      error: "Cet utilisateur est déjà admin",
    };
  }

  if (!profile.is_active) {
    return {
      ok: false,
      error:
        "Ce compte est désactivé. Activez-le d'abord avant de le promouvoir.",
    };
  }

  const { error } = await admin
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", profile.id);

  if (error) {
    console.error("[promoteUserByEmail]", error);
    return { ok: false, error: "Erreur de promotion" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "profiles",
    recordId: profile.id,
    oldData: { role: profile.role },
    newData: { role: "admin" },
  });

  revalidatePath("/admin/equipe");
  return { ok: true, userId: profile.id };
}
