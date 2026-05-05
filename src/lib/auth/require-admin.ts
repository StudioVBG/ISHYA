import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdminAuthResult =
  | { ok: true; userId: string; role: string }
  | { ok: false; error: string };

export async function requireAdminRole(
  allowed: string[] = ["admin"],
): Promise<AdminAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role;
  if (!role || !allowed.includes(role)) {
    return { ok: false, error: "Permissions insuffisantes" };
  }
  return { ok: true, userId: user.id, role };
}
