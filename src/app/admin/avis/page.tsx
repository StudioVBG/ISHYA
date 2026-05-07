import { getAdminReviews } from "@/lib/queries/admin";
import { AvisView } from "./AvisView";

export const revalidate = 60;

export const metadata = {
  title: "Avis — Admin ISHYA",
};

export default async function AdminAvisPage() {
  const reviews = await getAdminReviews();
  return <AvisView reviews={reviews} />;
}
