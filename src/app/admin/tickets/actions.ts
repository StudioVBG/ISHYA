"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/auth/audit-log";
import {
  TICKET_STATUSES,
  validateTicketTransition,
  type TicketStatus,
} from "@/lib/workflows/ticket-status";

export type { TicketStatus };

export type TicketPriority = "low" | "medium" | "high" | "urgent";

const ALLOWED_STATUSES = TICKET_STATUSES;

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

  // Lecture du statut courant pour valider la transition + audit log
  const { data: current } = await admin
    .from("tickets")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (!current) return { ok: false, error: "Ticket introuvable" };

  const previousStatus = current.status as string;
  const validation = validateTicketTransition(previousStatus, status);
  if (!validation.ok) return validation;

  const patch: Record<string, string> = { status };
  const now = new Date().toISOString();
  if (status === "resolved") patch.resolved_at = now;
  if (status === "closed") patch.closed_at = now;

  const { error } = await admin.from("tickets").update(patch).eq("id", id);
  if (error) {
    console.error("[updateTicketStatus]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }

  await logAuditEvent({
    userId: auth.userId,
    action: "update",
    tableName: "tickets",
    recordId: id,
    oldData: { status: previousStatus },
    newData: { status },
  });

  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${id}`);
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
  revalidatePath(`/admin/tickets/${id}`);
  return { ok: true };
}

export async function replyToTicketAsAdmin(
  ticketId: string,
  body: string,
  options: { isInternal?: boolean; nextStatus?: string } = {},
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Le message ne peut pas être vide." };
  if (trimmed.length > 5000)
    return { ok: false, error: "Message trop long (5000 caractères max)." };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  const { error: msgError } = await admin.from("ticket_messages").insert({
    ticket_id: ticketId,
    user_id: auth.userId!,
    body: trimmed,
    is_internal: options.isInternal ?? false,
  });

  if (msgError) {
    console.error("[replyToTicketAsAdmin] message:", msgError);
    return { ok: false, error: "Impossible d'envoyer la réponse." };
  }

  // Touche updated_at + statut éventuel
  const patch: Record<string, string> = {
    updated_at: new Date().toISOString(),
  };
  if (
    options.nextStatus &&
    ALLOWED_STATUSES.includes(options.nextStatus as TicketStatus)
  ) {
    patch.status = options.nextStatus;
    if (options.nextStatus === "resolved") patch.resolved_at = patch.updated_at;
    if (options.nextStatus === "closed") patch.closed_at = patch.updated_at;
  } else if (!options.isInternal) {
    // Réponse publique → on bascule en "attente client" si on était sur "open"
    patch.status = "waiting_customer";
  }

  const { error: tErr } = await admin
    .from("tickets")
    .update(patch)
    .eq("id", ticketId);
  if (tErr) console.error("[replyToTicketAsAdmin] ticket update:", tErr);

  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${ticketId}`);
  return { ok: true };
}
