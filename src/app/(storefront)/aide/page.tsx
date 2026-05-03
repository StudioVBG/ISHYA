import {
  getPublicFaqArticles,
  getPublicFaqCategories,
} from "@/lib/queries/storefront";
import { AideList } from "./AideList";

export const revalidate = 300;

export const metadata = {
  title: "Centre d'aide — ISHYA",
  description:
    "Trouvez rapidement les réponses à vos questions sur les commandes, la livraison, les retours et l'entretien de vos bijoux ISHYA.",
};

export default async function AidePage() {
  const [categories, articles] = await Promise.all([
    getPublicFaqCategories(),
    getPublicFaqArticles(),
  ]);
  return <AideList categories={categories} articles={articles} />;
}
