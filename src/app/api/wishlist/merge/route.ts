import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Merge la wishlist locale (localStorage côté client) vers la table
 * `wishlists` de l'utilisateur connecté. À appeler depuis le client juste
 * après une connexion / inscription réussie, en passant les IDs persistés
 * dans le store Zustand.
 *
 * Le client doit ensuite vider son store local (clear()) pour éviter les
 * doublons au prochain toggle. La source de vérité bascule sur la base.
 *
 * Body : { productIds: string[] }
 * - Doublons (déjà dans la table) ignorés silencieusement.
 * - IDs invalides (FK product_id) silencieusement ignorés.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON invalide" }, { status: 400 });
  }

  const rawIds = (body as { productIds?: unknown })?.productIds;
  if (!Array.isArray(rawIds)) {
    return Response.json({ ok: true, merged: 0 });
  }

  const productIds = Array.from(
    new Set(
      rawIds.filter((v): v is string => typeof v === "string" && v.length > 0),
    ),
  );

  if (productIds.length === 0) {
    return Response.json({ ok: true, merged: 0 });
  }

  const { data: existing } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", user.id)
    .in("product_id", productIds);

  const existingSet = new Set(
    (existing ?? []).map((row) => row.product_id),
  );
  const toInsert = productIds.filter((id) => !existingSet.has(id));

  if (toInsert.length === 0) {
    return Response.json({ ok: true, merged: 0 });
  }

  const { error } = await supabase.from("wishlists").insert(
    toInsert.map((productId) => ({
      user_id: user.id,
      product_id: productId,
    })),
  );

  if (error) {
    // Une partie a pu échouer (FK violations sur des IDs périmés) — on
    // log et on renvoie OK pour ne pas bloquer le flow de login.
    console.warn("[wishlist/merge] partial insert error:", error.message);
  }

  return Response.json({ ok: true, merged: toInsert.length });
}
