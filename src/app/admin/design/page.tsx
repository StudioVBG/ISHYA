import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminDesignSettings } from "@/lib/queries/admin";
import { DesignView } from "./DesignView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Design — Admin ISHYA",
};

export default async function AdminDesignPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?redirect_to=/admin/design");

  const config = await getAdminDesignSettings();
  return <DesignView config={config} />;
}
