import { getAdminBanners } from "@/lib/queries/admin";
import { BannieresView } from "./BannieresView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bannières — Admin ISHYA",
};

export default async function AdminBannieresPage() {
  const banners = await getAdminBanners();
  return <BannieresView banners={banners} />;
}
