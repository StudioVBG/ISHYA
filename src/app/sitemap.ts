import type { MetadataRoute } from "next";
import {
  getAllSlugs,
  getAllPackSlugs,
  getAllBlogSlugs,
  getAllPublishedCmsSlugs,
} from "@/lib/queries/storefront";

const STATIC_ROUTES = [
  "",
  "/boutique",
  "/blog",
  "/aide",
  "/a-propos",
  "/atelier",
  "/materiaux",
  "/equipe",
  "/contact",
  "/cgv",
  "/confidentialite",
  "/mentions-legales",
  "/cookies",
  "/mediation",
  "/accessibilite",
  "/livraison",
  "/retours",
  "/garantie",
  "/entretien",
  "/guide-des-tailles",
  "/suivi",
  "/carte-cadeau",
  "/programme-fidelite",
  "/parrainage",
  "/sur-mesure",
  "/presse",
  "/recrutement",
];

// Surfaces filtrées de /boutique qui méritent leur propre entrée sitemap.
const BOUTIQUE_FACETS = [
  "/boutique?badge=nouveau",
  "/boutique?badge=best-seller",
  "/boutique?badge=promo",
  "/boutique?type=pack",
];

function baseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.ishya.fr");
  return url.replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const root = baseUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${root}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const facetEntries: MetadataRoute.Sitemap = BOUTIQUE_FACETS.map((path) => ({
    url: `${root}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [products, categories, collections, packs, posts, cmsSlugs] =
      await Promise.all([
        getAllSlugs("products"),
        getAllSlugs("categories"),
        getAllSlugs("collections"),
        getAllPackSlugs(),
        getAllBlogSlugs(),
        getAllPublishedCmsSlugs(),
      ]);

    dynamicEntries = [
      ...products.map((slug) => ({
        url: `${root}/produit/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...categories.map((slug) => ({
        url: `${root}/boutique?categorie=${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...collections.map((slug) => ({
        url: `${root}/boutique?collection=${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...packs.map((p) => ({
        url: `${root}/pack/${p.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...posts.map((slug) => ({
        url: `${root}/blog/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...cmsSlugs.map((slug) => ({
        url: `${root}/p/${slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.4,
      })),
    ];
  } catch (error) {
    console.error("[sitemap] Erreur récupération slugs dynamiques:", error);
  }

  return [...staticEntries, ...facetEntries, ...dynamicEntries];
}
