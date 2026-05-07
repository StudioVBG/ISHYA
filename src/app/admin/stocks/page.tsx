import { getAdminVariantStocks } from "@/lib/queries/admin";
import { StocksView } from "./StocksView";

export const metadata = {
  title: "Stocks — Admin ISHYA",
};

export const revalidate = 30;

export default async function AdminStocksPage() {
  const rows = await getAdminVariantStocks();
  return <StocksView rows={rows} />;
}
