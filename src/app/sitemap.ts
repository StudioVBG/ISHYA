import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/queries/storefront";

const STATIC_ROUTES = [
  "",
  "/boutique",
  "/collections",
  "/best-sellers",
  "/nouveautes",
  "/promotions",
  "/idees-cadeaux",
  "/blog",
  "/aide",
  "/a-propos",
  "/contact",
  "/cgv",
  "/confidentialite",
  "/mentions-legales",
  "/livraison",
  "/retours",
  "/guide-des-tailles",
  "/suivi",
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

  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [products, categories, collections] = await Promise.all([
      getAllSlugs("products"),
      getAllSlugs("categories"),
      getAllSlugs("collections"),
    ]);

    dynamicEntries = [
      ...products.map((slug) => ({
        url: `${root}/produit/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...categories.map((slug) => ({
        url: `${root}/boutique/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...collections.map((slug) => ({
        url: `${root}/collections/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch (error) {
    console.error("[sitemap] Erreur récupération slugs dynamiques:", error);
  }

  return [...staticEntries, ...dynamicEntries];
}
