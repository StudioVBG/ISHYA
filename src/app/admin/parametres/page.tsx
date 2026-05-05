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

  const settings = await getAdminSettings();
  return <ParametresView settings={settings} canEdit canDelete />;
}
