import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "./AdminShell";

const ADMIN_ROLES = ["super_admin", "admin", "editor", "support"] as const;
type AdminRole = (typeof ADMIN_ROLES)[number];

function buildInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string | null | undefined,
): string {
  const first = firstName?.trim()?.[0];
  const last = lastName?.trim()?.[0];
  if (first && last) return (first + last).toUpperCase();
  if (first) return first.toUpperCase();
  if (last) return last.toUpperCase();
  const fallback = email?.trim()?.[0];
  return fallback ? fallback.toUpperCase() : "U";
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?redirect_to=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile?.role ||
    !ADMIN_ROLES.includes(profile.role as AdminRole)
  ) {
    redirect("/");
  }

  const role = profile.role as AdminRole;
  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() ||
    profile.email ||
    user.email ||
    "Membre";

  const initials = buildInitials(
    profile.first_name,
    profile.last_name,
    profile.email ?? user.email,
  );

  return (
    <AdminShell user={{ displayName, initials, role }}>{children}</AdminShell>
  );
}
