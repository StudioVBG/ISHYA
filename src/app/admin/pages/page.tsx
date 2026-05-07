import { getAdminCmsPages } from "@/lib/queries/admin";
import { PagesList } from "./PagesList";

export const revalidate = 60;

export const metadata = {
  title: "Pages CMS — Admin ISHYA",
};

export default async function AdminPagesPage() {
  const pages = await getAdminCmsPages();
  return <PagesList pages={pages} />;
}
