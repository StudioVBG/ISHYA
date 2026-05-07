import { getAdminSeoConfig } from "@/lib/queries/admin";
import { SeoForm } from "./SeoForm";

export const revalidate = 60;

export const metadata = {
  title: "SEO — Admin ISHYA",
};

export default async function AdminSeoPage() {
  const config = await getAdminSeoConfig();
  return <SeoForm config={config} />;
}
