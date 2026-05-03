import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SESSION_COOKIE = "ishya_cart_session";

/**
 * Merge le panier guest (identifié par cookie ishya_cart_session) vers
 * le panier de l'utilisateur connecté. À appeler depuis le client juste
 * après une connexion réussie ou une inscription.
 *
 * Comportement :
 * - Si pas de session cart → no-op
 * - Si l'user n'a pas de cart → on lie le cart guest à l'user
 * - Sinon → on fusionne les items (somme des quantités sur même
 *   product_id + variant_id), puis on supprime le cart guest
 * - Le cookie de session est effacé en réponse
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return Response.json({ ok: true, merged: false });
  }

  const admin = createAdminClient();

  const { data: guestCart } = await admin
    .from("carts")
    .select("id")
    .eq("session_id", sessionId)
    .is("user_id", null)
    .maybeSingle();

  if (!guestCart) {
    const response = Response.json({ ok: true, merged: false });
    response.headers.set(
      "Set-Cookie",
      `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    );
    return response;
  }

  const { data: userCart } = await admin
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Cas 1 : l'user n'avait pas de cart → on rebaptise le guest cart
  if (!userCart) {
    await admin
      .from("carts")
      .update({
        user_id: user.id,
        session_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", guestCart.id);

    const response = Response.json({
      ok: true,
      merged: true,
      strategy: "claim",
    });
    response.headers.set(
      "Set-Cookie",
      `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    );
    return response;
  }

  // Cas 2 : on fusionne les items
  const [{ data: guestItems }, { data: userItems }] = await Promise.all([
    admin
      .from("cart_items")
      .select("product_id, variant_id, quantity, unit_price, pack_id, pack_selections")
      .eq("cart_id", guestCart.id),
    admin
      .from("cart_items")
      .select("id, product_id, variant_id, quantity")
      .eq("cart_id", userCart.id),
  ]);

  for (const gItem of guestItems ?? []) {
    const matching = (userItems ?? []).find(
      (u) =>
        u.product_id === gItem.product_id &&
        (u.variant_id ?? null) === (gItem.variant_id ?? null),
    );
    if (matching) {
      // Additionne les quantités
      await admin
        .from("cart_items")
        .update({ quantity: matching.quantity + gItem.quantity })
        .eq("id", matching.id);
    } else {
      await admin.from("cart_items").insert({
        cart_id: userCart.id,
        product_id: gItem.product_id,
        variant_id: gItem.variant_id,
        quantity: gItem.quantity,
        unit_price: gItem.unit_price,
        pack_id: gItem.pack_id,
        pack_selections: gItem.pack_selections,
      });
    }
  }

  // Supprime le cart guest
  await admin.from("carts").delete().eq("id", guestCart.id);

  // Bump updated_at
  await admin
    .from("carts")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", userCart.id);

  const response = Response.json({
    ok: true,
    merged: true,
    strategy: "merge",
    itemsMerged: guestItems?.length ?? 0,
  });
  response.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
  return response;
}
