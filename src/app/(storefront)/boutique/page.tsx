import type { Metadata } from "next";
import {
  getAllCollections,
  getTopCategories,
  searchProducts,
  type ProductBadgeFilter,
  type ProductSearchFilters,
  type ProductSort,
  type ProductTypeFilter,
} from "@/lib/queries/storefront";
import BoutiqueContent from "./BoutiqueContent";

export const revalidate = 300;

const BADGE_VALUES: ProductBadgeFilter[] = [
  "nouveau",
  "best-seller",
  "promo",
  "derniere-piece",
];
const TYPE_VALUES: ProductTypeFilter[] = ["produit", "pack"];
const SORT_VALUES: ProductSort[] = [
  "popularite",
  "prix-asc",
  "prix-desc",
  "nouveaute",
  "promo",
];

function parseList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  const raw = Array.isArray(v) ? v.join(",") : v;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseNumber(v: string | string[] | undefined): number | undefined {
  if (!v) return undefined;
  const raw = Array.isArray(v) ? v[0] : v;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export function parseFiltersFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
): ProductSearchFilters {
  const badges = parseList(sp.badge).filter((b): b is ProductBadgeFilter =>
    BADGE_VALUES.includes(b as ProductBadgeFilter),
  );
  const types = parseList(sp.type).filter((t): t is ProductTypeFilter =>
    TYPE_VALUES.includes(t as ProductTypeFilter),
  );
  const triRaw = Array.isArray(sp.tri) ? sp.tri[0] : sp.tri;
  const tri = (SORT_VALUES as string[]).includes(triRaw ?? "")
    ? (triRaw as ProductSort)
    : undefined;
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;

  return {
    q: q?.trim() || undefined,
    categories: parseList(sp.categorie),
    collections: parseList(sp.collection),
    badges,
    types,
    min: parseNumber(sp.min),
    max: parseNumber(sp.max),
    materiaux: parseList(sp.materiau),
    tri,
  };
}

function titleFromFilters(f: ProductSearchFilters): {
  eyebrow: string;
  title: string;
  description: string;
} {
  if (f.badges?.includes("best-seller"))
    return {
      eyebrow: "Les favoris",
      title: "Best-sellers",
      description:
        "Les bijoux préférés de nos clientes. Des créations qui ont su conquérir les cœurs.",
    };
  if (f.badges?.includes("nouveau"))
    return {
      eyebrow: "Fraîchement arrivés",
      title: "Nouveautés",
      description:
        "Découvrez nos dernières créations florales, tout juste sorties de notre atelier.",
    };
  if (f.badges?.includes("promo"))
    return {
      eyebrow: "Offres spéciales",
      title: "Promotions",
      description:
        "Profitez de nos offres exceptionnelles sur une sélection de bijoux floraux.",
    };
  if (f.types?.length === 1 && f.types[0] === "pack")
    return {
      eyebrow: "Coordonnés",
      title: "Packs & Parures",
      description:
        "Ensembles coordonnés et coffrets cadeaux pour offrir ou se faire plaisir.",
    };
  if (f.q)
    return {
      eyebrow: "Recherche",
      title: `Résultats pour « ${f.q} »`,
      description: "Affinez vos critères avec les filtres ci-contre.",
    };
  if (typeof f.max === "number" && !f.min)
    return {
      eyebrow: "Trouvez le bijou parfait",
      title: `Idées cadeaux jusqu'à ${f.max}€`,
      description:
        "Chaque bijou ISHYA est livré dans un écrin élégant, prêt à offrir.",
    };
  return {
    eyebrow: "Explorez nos créations",
    title: "La Boutique",
    description:
      "Découvrez notre collection complète de bijoux floraux artisanaux.",
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const filters = parseFiltersFromSearchParams(sp);
  const { title, description } = titleFromFilters(filters);
  return {
    title,
    description,
  };
}

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFiltersFromSearchParams(sp);

  const [products, categories, collections] = await Promise.all([
    searchProducts(filters),
    getTopCategories(20),
    getAllCollections(),
  ]);

  const heading = titleFromFilters(filters);

  return (
    <BoutiqueContent
      products={products}
      categories={categories}
      collections={collections}
      filters={filters}
      heading={heading}
    />
  );
}
