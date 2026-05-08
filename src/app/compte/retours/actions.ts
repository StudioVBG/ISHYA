"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const reasonEnum = z.enum([
  "wrong_size",
  "defective",
  "not_as_described",
  "changed_mind",
  "arrived_late",
  "wrong_item",
  "other",
]);
export type ReturnReason = z.infer<typeof reasonEnum>;

const returnRequestSchema = z.object({
  orderId: z.string().uuid("Identifiant de commande invalide"),
  reason: reasonEnum,
  description: z.string().trim().max(2000),
  items: z
    .array(
      z.object({
        orderItemId: z.string().uuid(),
        quantity: z.number().int().positive("Quantité invalide"),
      }),
    )
    .min(1, "Sélectionnez au moins un article"),
});

// Input "loose" côté TS : le formulaire passe une string brute pour le motif,
// la validation Zod (returnRequestSchema) la contraint à l'enum côté serveur.
export interface ReturnRequestInput {
  orderId: string;
  reason: string;
  description: string;
  items: Array<{ orderItemId: string; quantity: number }>;
}

export async function requestReturn(
  input: ReturnRequestInput,
): Promise<{ ok: boolean; error?: string; returnId?: string }> {
  const parsed = returnRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  // Vérifier que la commande appartient à l'utilisateur
  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", data.orderId)
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
    .eq("order_id", data.orderId)
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
      order_id: data.orderId,
      user_id: user.id,
      reason: data.reason,
      description: data.description || null,
      status: "requested",
    })
    .select("id")
    .single();

  if (createError || !created) {
    console.error("[requestReturn] create:", createError);
    return { ok: false, error: "Erreur lors de la création du retour" };
  }

  // Insérer les return_items
  const itemsRows = data.items.map((it) => ({
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
