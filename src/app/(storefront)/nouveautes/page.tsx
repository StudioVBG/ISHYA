import { AnimatedProductGrid } from "@/components/product/AnimatedProductGrid";
import { getNewProducts } from "@/lib/queries/storefront";

export const revalidate = 300;

export const metadata = {
  title: "Nouveautés",
  description:
    "Découvrez nos dernières créations florales, tout juste sorties de notre atelier.",
};

export default async function NouveautesPage() {
  const products = await getNewProducts(50);

  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container">
          <div className="text-center">
            <p className="text-terracotta uppercase tracking-widest text-xs mb-3">
              Fraîchement arrivés
            </p>
            <h1 className="font-display text-4xl md:text-5xl mb-4">Nouveautés</h1>
            <p className="text-muted max-w-lg mx-auto">
              Découvrez nos dernières créations florales, tout juste sorties de
              notre atelier.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container">
          <p className="text-sm text-muted mb-8">
            <span className="font-medium text-foreground">{products.length}</span>{" "}
            nouveauté{products.length > 1 ? "s" : ""}
          </p>
          <AnimatedProductGrid products={products} />
          {products.length === 0 && (
            <p className="text-center text-muted py-20">
              Aucune nouveauté pour le moment. Revenez bientôt !
            </p>
          )}
        </div>
      </section>
    </>
  );
}
