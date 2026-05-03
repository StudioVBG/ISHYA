import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBirthdayEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const BIRTHDAY_PROMO_CODE = "ANNIV15";

/**
 * Cron quotidien : envoie l'email d'anniversaire aux profils dont
 * date_of_birth tombe aujourd'hui (jour + mois). Idempotence assurée
 * via une marqueur dans email_logs côté futur (TODO) — pour l'instant,
 * une exécution par jour évite les doublons.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ishya.fr";

  const today = new Date();
  const todayMonth = today.getMonth() + 1; // 1-12
  const todayDay = today.getDate();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, email, first_name, date_of_birth")
    .not("date_of_birth", "is", null)
    .not("email", "is", null);

  if (error) {
    console.error("[cron/birthdays]", error);
    return Response.json({ error: "DB error" }, { status: 500 });
  }

  let sent = 0;
  let errored = 0;

  for (const profile of profiles ?? []) {
    if (!profile.date_of_birth || !profile.email) continue;
    const dob = new Date(profile.date_of_birth);
    if (
      dob.getMonth() + 1 !== todayMonth ||
      dob.getDate() !== todayDay
    )
      continue;

    try {
      await sendBirthdayEmail(profile.email, {
        firstName: profile.first_name ?? "",
        discountCode: BIRTHDAY_PROMO_CODE,
        giftIdeasUrl: `${baseUrl}/idees-cadeaux`,
      });
      sent++;
    } catch (e) {
      console.error("[cron/birthdays] email error:", e);
      errored++;
    }
  }

  return Response.json({
    ok: true,
    candidates: profiles?.length ?? 0,
    sent,
    errored,
  });
}
