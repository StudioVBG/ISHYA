import { AnimatedProductGrid } from "@/components/product/AnimatedProductGrid";
import { SearchInput } from "@/components/SearchInput";
import { searchProducts } from "@/lib/queries/storefront";

export const metadata = {
  title: "Recherche",
  description:
    "Trouvez le bijou floral parfait parmi nos créations artisanales.",
};

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query.length >= 2 ? await searchProducts(query) : [];

  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl md:text-5xl mb-4">Recherche</h1>
            <p className="text-muted">
              Trouvez le bijou parfait parmi nos créations artisanales.
            </p>
          </div>
          <SearchInput initialValue={query} />
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container">
          {query.length >= 2 && (
            <p className="text-sm text-muted mb-8">
              <span className="font-medium text-foreground">{results.length}</span>{" "}
              résultat{results.length > 1 ? "s" : ""} pour &ldquo;
              <span className="text-foreground">{query}</span>&rdquo;
            </p>
          )}

          {results.length > 0 && <AnimatedProductGrid products={results} />}

          {query.length >= 2 && results.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted mb-2">Aucun résultat pour &ldquo;{query}&rdquo;</p>
              <p className="text-sm text-muted">
                Essayez avec d&apos;autres mots-clés : collier, bague, bracelet,
                or, résine...
              </p>
            </div>
          )}

          {query.length < 2 && (
            <div className="text-center py-20">
              <p className="text-muted">
                Entrez au moins 2 caractères pour lancer la recherche.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
