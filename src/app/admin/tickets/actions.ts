"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_customer"
  | "waiting_internal"
  | "resolved"
  | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

const ALLOWED_STATUSES: TicketStatus[] = [
  "open",
  "in_progress",
  "waiting_customer",
  "waiting_internal",
  "resolved",
  "closed",
];

const ALLOWED_PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

export async function updateTicketStatus(
  id: string,
  status: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!ALLOWED_STATUSES.includes(status as TicketStatus)) {
    return { ok: false, error: "Statut invalide" };
  }

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const patch: Record<string, string> = { status };
  const now = new Date().toISOString();
  if (status === "resolved") patch.resolved_at = now;
  if (status === "closed") patch.closed_at = now;

  const { error } = await admin.from("tickets").update(patch).eq("id", id);
  if (error) {
    console.error("[updateTicketStatus]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }

  revalidatePath("/admin/tickets");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateTicketPriority(
  id: string,
  priority: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!ALLOWED_PRIORITIES.includes(priority as TicketPriority)) {
    return { ok: false, error: "Priorité invalide" };
  }

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("tickets")
    .update({ priority: priority as TicketPriority })
    .eq("id", id);
  if (error) {
    console.error("[updateTicketPriority]", error);
    return { ok: false, error: "Erreur" };
  }

  revalidatePath("/admin/tickets");
  return { ok: true };
}

export async function assignTicketToMe(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("tickets")
    .update({ assigned_to: auth.userId })
    .eq("id", id);
  if (error) {
    console.error("[assignTicketToMe]", error);
    return { ok: false, error: "Erreur" };
  }

  revalidatePath("/admin/tickets");
  return { ok: true };
}
