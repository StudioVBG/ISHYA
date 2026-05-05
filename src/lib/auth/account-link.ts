import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AccountLinkInfo {
  href: string;
  label: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

/**
 * Détermine où doit pointer l'icône compte du header.
 *  - non connecté → /connexion
 *  - admin       → /admin
 *  - client      → /compte
 *
 * On utilise getUser() (pas getSession()) pour vérifier l'auth de manière fiable,
 * puis on lit le rôle depuis profiles.
 */
export async function getAccountLink(): Promise<AccountLinkInfo> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      href: "/connexion",
      label: "Se connecter",
      isAdmin: false,
      isAuthenticated: false,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";

  return {
    href: isAdmin ? "/admin" : "/compte",
    label: isAdmin ? "Tableau de bord admin" : "Mon compte",
    isAdmin,
    isAuthenticated: true,
  };
}
