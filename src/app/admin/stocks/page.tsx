import { getAdminVariantStocks } from "@/lib/queries/admin";
import { StocksView } from "./StocksView";

export const metadata = {
  title: "Stocks — Admin ISHYA",
};

export const dynamic = "force-dynamic";

export default async function AdminStocksPage() {
  const rows = await getAdminVariantStocks();
  return <StocksView rows={rows} />;
}
