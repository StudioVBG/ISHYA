import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCronAuth } from "@/lib/auth/require-cron";

export const dynamic = "force-dynamic";

/**
 * Cron quotidien : passe en `expired` toutes les cartes cadeaux dont
 * `expires_at` est dans le passé et qui ne sont ni `redeemed`, ni
 * `cancelled`, ni déjà `expired`.
 *
 * Idempotent : tourner deux fois ne change rien après le premier passage.
 */
export async function GET(request: NextRequest) {
  const auth = requireCronAuth(request);
  if (!auth.ok) {
    return Response.json({ error: auth.message }, { status: auth.status });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // On lit d'abord pour pouvoir logger combien de cartes sont touchées.
  const { data: candidates, error: selectError } = await admin
    .from("gift_cards")
    .select("id, code, recipient_email, expires_at, status")
    .lt("expires_at", now)
    .not("expires_at", "is", null)
    .not(
      "status",
      "in",
      "(redeemed,cancelled,expired)",
    );

  if (selectError) {
    console.error("[cron/expire-gift-cards] select", selectError);
    return Response.json(
      { error: "select failed" },
      { status: 500 },
    );
  }

  if (!candidates || candidates.length === 0) {
    return Response.json({ ok: true, expired: 0 });
  }

  const ids = candidates.map((c) => c.id);
  const { error: updateError } = await admin
    .from("gift_cards")
    .update({ status: "expired" })
    .in("id", ids);

  if (updateError) {
    console.error("[cron/expire-gift-cards] update", updateError);
    return Response.json(
      { error: "update failed" },
      { status: 500 },
    );
  }

  console.log(
    `[cron/expire-gift-cards] ${ids.length} carte(s) passée(s) à expired`,
  );

  return Response.json({
    ok: true,
    expired: ids.length,
    cards: candidates.map((c) => ({
      id: c.id,
      code: c.code,
      expiredAt: c.expires_at,
    })),
  });
}
