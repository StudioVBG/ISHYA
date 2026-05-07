import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewsletterView } from "./NewsletterView";
import { loadNewsletterPage } from "./actions";

export const revalidate = 60;

export const metadata = {
  title: "Newsletter — Admin ISHYA",
};

const INITIAL_PAGE_SIZE = 100;

export default async function AdminNewsletterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?redirect_to=/admin/newsletter");

  // Le serveur action assure le check `requireAdminRole` ; ici on a juste
  // le check de session pour rediriger vers /connexion.
  const res = await loadNewsletterPage(null, INITIAL_PAGE_SIZE, {
    withTotal: true,
  });

  if (!res.ok || !res.data) {
    console.error("[AdminNewsletterPage]", res.error);
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive">
        Erreur de chargement de la newsletter : {res.error ?? "Inconnue"}
      </div>
    );
  }

  return (
    <NewsletterView
      initialRows={res.data.rows}
      initialNextCursor={res.data.nextCursor}
      total={res.data.total ?? res.data.rows.length}
      pageSize={INITIAL_PAGE_SIZE}
    />
  );
}
