"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_CATEGORIES = [
  "order_issue",
  "product_question",
  "shipping",
  "return_exchange",
  "payment",
  "account",
  "complaint",
  "other",
] as const;
type TicketCategory = (typeof ALLOWED_CATEGORIES)[number];

export interface CreateUserTicketInput {
  subject: string;
  body: string;
  category: TicketCategory;
  orderId?: string | null;
}

export async function createUserTicket(
  input: CreateUserTicketInput,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const subject = input.subject.trim();
  const body = input.body.trim();

  if (!subject) return { ok: false, error: "Le sujet est requis." };
  if (subject.length > 200)
    return { ok: false, error: "Sujet trop long (200 caractères max)." };
  if (!body) return { ok: false, error: "Le message est requis." };
  if (body.length > 5000)
    return { ok: false, error: "Message trop long (5000 caractères max)." };
  if (!ALLOWED_CATEGORIES.includes(input.category))
    return { ok: false, error: "Catégorie invalide." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Vous devez être connecté." };

  const { data: ticket, error } = await supabase
    .from("tickets")
    .insert({
      user_id: user.id,
      subject,
      category: input.category,
      channel: "contact_form",
      order_id: input.orderId ?? null,
      status: "open",
      priority: "medium",
    })
    .select("id")
    .single();

  if (error || !ticket) {
    console.error("[createUserTicket] ticket:", error);
    return { ok: false, error: "Impossible de créer le ticket." };
  }

  const { error: msgError } = await supabase.from("ticket_messages").insert({
    ticket_id: ticket.id,
    user_id: user.id,
    body,
    is_internal: false,
  });

  if (msgError) {
    console.error("[createUserTicket] message:", msgError);
    return { ok: false, error: "Ticket créé mais le message n'a pas été enregistré." };
  }

  revalidatePath("/compte/tickets");
  redirect(`/compte/tickets/${ticket.id}`);
}

export async function replyToUserTicket(
  ticketId: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Le message ne peut pas être vide." };
  if (trimmed.length > 5000)
    return { ok: false, error: "Message trop long (5000 caractères max)." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Vous devez être connecté." };

  // RLS garantit que l'utilisateur ne peut écrire que dans ses propres tickets,
  // mais on vérifie explicitement pour donner un message d'erreur lisible.
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, status")
    .eq("id", ticketId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ticket) return { ok: false, error: "Ticket introuvable." };
  if (ticket.status === "closed")
    return { ok: false, error: "Ce ticket est fermé. Créez-en un nouveau." };

  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: ticketId,
    user_id: user.id,
    body: trimmed,
    is_internal: false,
  });

  if (error) {
    console.error("[replyToUserTicket]", error);
    return { ok: false, error: "Impossible d'envoyer la réponse." };
  }

  // RLS empêche l'utilisateur de modifier des champs sensibles ; on touche
  // juste updated_at pour faire remonter le ticket dans la liste admin.
  await supabase
    .from("tickets")
    .update({ updated_at: new Date().toISOString(), status: "waiting_internal" })
    .eq("id", ticketId)
    .eq("user_id", user.id);

  revalidatePath("/compte/tickets");
  revalidatePath(`/compte/tickets/${ticketId}`);
  return { ok: true };
}
