import { redirect } from "next/navigation";
import { getAdminTeamMembers } from "@/lib/queries/admin";
import { createClient } from "@/lib/supabase/server";
import { EquipeView } from "./EquipeView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Équipe — Admin ISHYA",
};

export default async function AdminEquipePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?redirect_to=/admin/equipe");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const members = await getAdminTeamMembers();
  return (
    <EquipeView
      members={members}
      currentUserId={user.id}
      isSuperAdmin={profile?.role === "super_admin"}
    />
  );
}
