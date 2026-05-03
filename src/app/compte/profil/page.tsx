import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/queries/account";
import { ProfilForm } from "./ProfilForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mon profil — ISHYA",
};

export default async function ProfilPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/connexion?redirect_to=/compte/profil");
  return <ProfilForm profile={profile} />;
}
