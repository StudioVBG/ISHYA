import { Tag } from "lucide-react";
import { AnimatedProductGrid } from "@/components/product/AnimatedProductGrid";
import { getPromotionProducts } from "@/lib/queries/storefront";

export const revalidate = 300;

export const metadata = {
  title: "Promotions",
  description:
    "Profitez de nos offres exceptionnelles sur une sélection de bijoux floraux artisanaux.",
};

export default async function PromotionsPage() {
  const products = await getPromotionProducts(50);

  return (
    <>
      <section className="bg-gradient-to-br from-terracotta/10 to-beige-nude-light/50 py-16 px-4">
        <div className="container">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
              <Tag className="w-3.5 h-3.5" />
              Offres spéciales
            </div>
            <h1 className="font-display text-4xl md:text-5xl mb-4">Promotions</h1>
            <p className="text-muted max-w-lg mx-auto">
              Profitez de nos offres exceptionnelles sur une sélection de bijoux
              floraux artisanaux.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container">
          <p className="text-sm text-muted mb-8">
            <span className="font-medium text-foreground">{products.length}</span>{" "}
            offre{products.length > 1 ? "s" : ""} en cours
          </p>
          <AnimatedProductGrid products={products} />
          {products.length === 0 && (
            <p className="text-center text-muted py-20">
              Aucune promotion en cours. Restez connecté !
            </p>
          )}
        </div>
      </section>
    </>
  );
}
