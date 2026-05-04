import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface SyncCartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  packId?: string | null;
  packName?: string | null;
}

interface SyncCartBody {
  items: SyncCartItem[];
  email?: string | null;
}

const SESSION_COOKIE = "ishya_cart_session";

/**
 * Synchronise le panier local (Zustand) avec la table `carts` Supabase.
 * Appelée après chaque mutation côté client (debouncée).
 *
 * Comportements :
 * - Si l'utilisateur est connecté : upsert sur (user_id, currency=EUR).
 * - Sinon : on identifie le cart par cookie de session (généré ici si absent).
 *
 * Côté server, on remplace tous les cart_items en bloc — la cohérence avec
 * Zustand est ainsi garantie (le client est la source de vérité tant qu'il
 * n'est pas converti en commande).
 */
export async function POST(request: NextRequest) {
  let body: SyncCartBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON invalide" }, { status: 400 });
  }

  const items = body.items ?? [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Identifier le panier
  const admin = createAdminClient();
  let sessionId = request.cookies.get(SESSION_COOKIE)?.value ?? null;
  let cartId: string | null = null;

  if (user) {
    // Chercher un cart par user_id
    const { data: existing } = await admin
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      cartId = existing.id;
    } else {
      const { data: created, error: createError } = await admin
        .from("carts")
        .insert({ user_id: user.id, currency: "EUR" })
        .select("id")
        .single();
      if (createError || !created) {
        console.error("[cart/sync] create cart user:", createError);
        return Response.json({ error: "Erreur" }, { status: 500 });
      }
      cartId = created.id;
    }
  } else {
    // Anonyme : cookie de session
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }
    const { data: existing } = await admin
      .from("carts")
      .select("id")
      .eq("session_id", sessionId)
      .is("user_id", null)
      .maybeSingle();
    if (existing) {
      cartId = existing.id;
    } else {
      const { data: created, error: createError } = await admin
        .from("carts")
        .insert({ session_id: sessionId, currency: "EUR" })
        .select("id")
        .single();
      if (createError || !created) {
        console.error("[cart/sync] create cart session:", createError);
        return Response.json({ error: "Erreur" }, { status: 500 });
      }
      cartId = created.id;
    }
  }

  if (!cartId) {
    return Response.json({ error: "Cart introuvable" }, { status: 500 });
  }

  // Mettre à jour `updated_at` pour la détection d'abandon
  await admin
    .from("carts")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", cartId);

  // Remplacer tous les cart_items
  await admin.from("cart_items").delete().eq("cart_id", cartId);

  if (items.length > 0) {
    const rows = items
      .filter((it) => it.productId && it.quantity > 0)
      .map((it) => ({
        cart_id: cartId!,
        product_id: it.productId,
        variant_id: it.variantId,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        pack_id: it.packId ?? null,
        pack_selections: it.packName ? { pack_name: it.packName } : null,
      }));
    if (rows.length > 0) {
      const { error: itemsError } = await admin
        .from("cart_items")
        .insert(rows);
      if (itemsError) {
        console.error("[cart/sync] insert items:", itemsError);
      }
    }
  }

  // Si on a un email guest et pas d'utilisateur, on crée/MAJ une ligne abandoned_carts
  // (préparation pour les relances panier abandonné)
  if (body.email && !user) {
    const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const { data: existingAbandoned } = await admin
      .from("abandoned_carts")
      .select("id")
      .eq("cart_id", cartId)
      .maybeSingle();
    if (existingAbandoned) {
      await admin
        .from("abandoned_carts")
        .update({
          email: body.email,
          cart_total: total,
          items_snapshot: JSON.parse(JSON.stringify(items)),
          abandoned_at: new Date().toISOString(),
        })
        .eq("id", existingAbandoned.id);
    } else {
      await admin.from("abandoned_carts").insert({
        cart_id: cartId,
        email: body.email,
        cart_total: total,
        items_snapshot: JSON.parse(JSON.stringify(items)),
        abandoned_at: new Date().toISOString(),
        recovered: false,
        reminders_count: 0,
      });
    }
  }

  // Renvoyer le sessionId si on en a généré un (le client devra le poser en cookie)
  const response = Response.json({ ok: true, cartId });
  if (!user && sessionId) {
    response.headers.set(
      "Set-Cookie",
      `${SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
    );
  }
  return response;
}
