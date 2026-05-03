import { redirect } from "next/navigation";
import { getAdminSettings } from "@/lib/queries/admin";
import { createClient } from "@/lib/supabase/server";
import { ParametresView } from "./ParametresView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Paramètres — Admin ISHYA",
};

export default async function AdminParametresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?redirect_to=/admin/parametres");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role;
  const canEdit = role === "admin" || role === "super_admin";
  const canDelete = role === "super_admin";

  const settings = await getAdminSettings();
  return (
    <ParametresView
      settings={settings}
      canEdit={canEdit}
      canDelete={canDelete}
    />
  );
}
