import { getCurrentUserSavedSizes } from "@/lib/queries/account";
import { TaillesForm } from "./TaillesForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mes tailles — ISHYA",
};

export default async function TaillesPage() {
  const sizes = await getCurrentUserSavedSizes();
  return <TaillesForm sizes={sizes} />;
}
