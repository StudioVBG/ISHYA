import { listSavedCards } from "./actions";
import { PaiementView } from "./PaiementView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Moyens de paiement — ISHYA",
};

export default async function PaiementPage() {
  const { cards, error } = await listSavedCards();
  return <PaiementView initialCards={cards} initialError={error} />;
}
