import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminNotificationCounts } from "@/lib/queries/admin-notifications";
import { AdminShell } from "./AdminShell";

export const dynamic = "force-dynamic";

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

  if (profile?.role !== "admin") {
    redirect("/");
  }

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

  const notificationCounts = await getAdminNotificationCounts();

  return (
    <AdminShell
      user={{ displayName, initials }}
      notificationCounts={notificationCounts}
    >
      {children}
    </AdminShell>
  );
}
