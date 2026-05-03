"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReturnReason =
  | "wrong_size"
  | "defective"
  | "not_as_described"
  | "changed_mind"
  | "arrived_late"
  | "wrong_item"
  | "other";

const ALLOWED_REASONS: ReturnReason[] = [
  "wrong_size",
  "defective",
  "not_as_described",
  "changed_mind",
  "arrived_late",
  "wrong_item",
  "other",
];

export interface ReturnRequestInput {
  orderId: string;
  reason: string;
  description: string;
  items: Array<{ orderItemId: string; quantity: number }>;
}

export async function requestReturn(
  input: ReturnRequestInput,
): Promise<{ ok: boolean; error?: string; returnId?: string }> {
  if (!ALLOWED_REASONS.includes(input.reason as ReturnReason)) {
    return { ok: false, error: "Motif invalide" };
  }
  if (input.items.length === 0) {
    return { ok: false, error: "Sélectionnez au moins un article" };
  }
  if (input.items.some((it) => it.quantity <= 0)) {
    return { ok: false, error: "Quantité invalide" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  // Vérifier que la commande appartient à l'utilisateur
  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", input.orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    return { ok: false, error: "Commande introuvable" };
  }
  if (!["delivered", "shipped"].includes(order.status ?? "")) {
    return {
      ok: false,
      error: "Cette commande ne peut pas faire l'objet d'un retour",
    };
  }

  // Empêcher les doublons : un retour par commande
  const { data: existing } = await supabase
    .from("returns")
    .select("id")
    .eq("order_id", input.orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return {
      ok: false,
      error: "Une demande de retour existe déjà pour cette commande",
    };
  }

  const { data: created, error: createError } = await supabase
    .from("returns")
    .insert({
      order_id: input.orderId,
      user_id: user.id,
      reason: input.reason as ReturnReason,
      description: input.description.trim() || null,
      status: "requested",
    })
    .select("id")
    .single();

  if (createError || !created) {
    console.error("[requestReturn] create:", createError);
    return { ok: false, error: "Erreur lors de la création du retour" };
  }

  // Insérer les return_items
  const itemsRows = input.items.map((it) => ({
    return_id: created.id,
    order_item_id: it.orderItemId,
    quantity: it.quantity,
  }));
  const { error: itemsError } = await supabase
    .from("return_items")
    .insert(itemsRows);

  if (itemsError) {
    console.error("[requestReturn] items:", itemsError);
    // Rollback
    await supabase.from("returns").delete().eq("id", created.id);
    return { ok: false, error: "Erreur sur les articles" };
  }

  revalidatePath("/compte/retours");
  revalidatePath("/admin/retours");
  return { ok: true, returnId: created.id };
}
