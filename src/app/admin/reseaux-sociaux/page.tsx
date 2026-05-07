import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminSocialLinks } from "@/lib/queries/admin";
import { SocialLinksForm } from "./SocialLinksForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Réseaux sociaux — Admin ISHYA",
};

export default async function AdminSocialLinksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?redirect_to=/admin/reseaux-sociaux");

  const config = await getAdminSocialLinks();
  return <SocialLinksForm config={config} />;
}
