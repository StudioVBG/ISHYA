import { getCurrentUserReviews } from "@/lib/queries/account";
import { MesAvisView } from "./AvisView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mes avis — ISHYA",
};

export default async function MesAvisPage() {
  const reviews = await getCurrentUserReviews();
  return <MesAvisView reviews={reviews} />;
}
