import { Gift } from "lucide-react";
import { AnimatedProductGrid } from "@/components/product/AnimatedProductGrid";
import { getProductsByBudget } from "@/lib/queries/storefront";

export const revalidate = 300;

export const metadata = {
  title: "Idées Cadeaux",
  description:
    "Trouvez le cadeau parfait selon votre budget. Chaque bijou ISHYA est livré dans un écrin élégant.",
};

const budgetSections = [
  {
    title: "Moins de 30€",
    subtitle: "Des petites attentions qui font plaisir",
    min: 0,
    max: 30,
    accent: "border-terracotta",
  },
  {
    title: "Entre 30€ et 60€",
    subtitle: "Le cadeau idéal pour toutes les occasions",
    min: 30,
    max: 60,
    accent: "border-gold",
  },
  {
    title: "Plus de 60€",
    subtitle: "Des pièces d'exception pour marquer les esprits",
    min: 60,
    max: 9999,
    accent: "border-foreground",
  },
];

export default async function IdeesCadeauxPage() {
  const sectionsWithProducts = await Promise.all(
    budgetSections.map(async (s) => ({
      ...s,
      products: await getProductsByBudget(s.min, s.max),
    }))
  );

  return (
    <>
      <section className="bg-gradient-to-br from-beige-nude-light/80 to-terracotta/5 py-16 px-4">
        <div className="container">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
              <Gift className="w-3.5 h-3.5" />
              Offrir un bijou
            </div>
            <h1 className="font-display text-4xl md:text-5xl mb-4">
              Idées Cadeaux
            </h1>
            <p className="text-muted max-w-lg mx-auto">
              Trouvez le cadeau parfait selon votre budget. Chaque bijou ISHYA
              est livré dans un écrin élégant, prêt à offrir.
            </p>
          </div>
        </div>
      </section>

      {sectionsWithProducts.map(
        (section) =>
          section.products.length > 0 && (
            <section key={section.title} className="py-12 px-4">
              <div className="container">
                <div className={`border-l-4 ${section.accent} pl-6 mb-8`}>
                  <h2 className="font-display text-2xl md:text-3xl mb-1">
                    {section.title}
                  </h2>
                  <p className="text-sm text-muted">{section.subtitle}</p>
                </div>
                <AnimatedProductGrid products={section.products} />
              </div>
            </section>
          )
      )}
    </>
  );
}
