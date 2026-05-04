import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_ROLES = ["admin", "super_admin", "editor", "support"];

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

  // Si pas de redirection explicite (ou redirection par défaut vers /compte),
  // on envoie les admins/staff vers leur tableau de bord.
  let redirectTo = requestedRedirect ?? "/compte";
  const isDefaultRedirect = !requestedRedirect || requestedRedirect === "/compte";
  if (isDefaultRedirect) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profile?.role && ADMIN_ROLES.includes(profile.role)) {
      redirectTo = "/admin";
    }
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
