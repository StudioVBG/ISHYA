import { Award } from "lucide-react";
import { AnimatedProductGrid } from "@/components/product/AnimatedProductGrid";
import { getBestSellers } from "@/lib/queries/storefront";

export const revalidate = 300;

export const metadata = {
  title: "Best-sellers",
  description:
    "Les bijoux floraux préférés de nos clientes. Des créations qui ont su conquérir les cœurs.",
};

export default async function BestSellersPage() {
  const products = await getBestSellers(50);

  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold-dark px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
              <Award className="w-3.5 h-3.5" />
              Les plus aimés
            </div>
            <h1 className="font-display text-4xl md:text-5xl mb-4">
              Best-sellers
            </h1>
            <p className="text-muted max-w-lg mx-auto">
              Les bijoux préférés de nos clientes. Des créations qui ont su
              conquérir les cœurs.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container">
          <p className="text-sm text-muted mb-8">
            <span className="font-medium text-foreground">{products.length}</span>{" "}
            best-seller{products.length > 1 ? "s" : ""}
          </p>
          <AnimatedProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
