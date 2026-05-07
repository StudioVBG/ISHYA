import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";
import { hasEmailBeenSent, logEmailSent } from "@/lib/email-logs";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedRedirect = searchParams.get("redirect_to");

  if (!code) {
    return NextResponse.redirect(
      `${origin}/connexion?error=auth_callback_failed`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/connexion?error=auth_callback_failed`,
    );
  }

  const user = data.user;

  // Si pas de redirection explicite (ou redirection par défaut vers /compte),
  // on envoie les admins/staff vers leur tableau de bord.
  let redirectTo = requestedRedirect ?? "/compte";
  const isDefaultRedirect = !requestedRedirect || requestedRedirect === "/compte";
  let isAdmin = false;

  if (isDefaultRedirect) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, first_name")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role === "admin") {
      isAdmin = true;
      redirectTo = "/admin";
    }
  }

  // Email de bienvenue (best-effort, idempotent via email_logs).
  // - Envoyé une seule fois par utilisateur (dedup_key = userId).
  // - Pas envoyé aux admins (qui n'ont pas vocation à recevoir le code -10%).
  // - Best-effort : si Resend/clé manquante/erreur réseau, on n'interrompt
  //   pas le flux d'authentification.
  if (!isAdmin && user.email && process.env.RESEND_API_KEY) {
    void sendWelcomeEmailIfFirstTime(user.id, user.email, origin);
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}

async function sendWelcomeEmailIfFirstTime(
  userId: string,
  email: string,
  origin: string,
): Promise<void> {
  try {
    const dedupKey = userId;
    if (await hasEmailBeenSent("welcome", dedupKey)) return;

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", userId)
      .maybeSingle();

    await sendWelcomeEmail(email, {
      firstName: profile?.first_name ?? "",
      baseUrl: origin,
    });

    await logEmailSent({
      email,
      emailType: "welcome",
      dedupKey,
      userId,
    });
  } catch (err) {
    console.error("[auth/callback] welcome email failed", err);
  }
}
