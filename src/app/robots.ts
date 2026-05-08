import type { MetadataRoute } from "next";

function baseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.ishya.fr");
  return url.replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const root = baseUrl();

  // Routes à exclure de tous les crawlers (admin, transactionnel, comptes,
  // routes API privées, et URL avec query strings de tri qui dupliquent le contenu).
  const disallowedPaths = [
    "/admin/",
    "/admin",
    "/api/",
    "/auth/",
    "/checkout/",
    "/checkout",
    "/panier",
    "/compte/",
    "/compte",
    "/preview/",
    "/desinscription",
    "/recherche",
    "/*?tri=*",
    "/*?sort=*",
    // Filtres facettes non-canoniques (les variantes indexables sont déclarées
    // explicitement dans sitemap.ts via BOUTIQUE_FACETS).
    "/*?min=*",
    "/*?max=*",
    "/*?materiau=*",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowedPaths,
      },
      // AI bots — autorisés explicitement pour visibilité dans les moteurs
      // génératifs (ChatGPT Search, Perplexity, Google AI Overviews,
      // Claude.ai). Décision business : opt-in à la citation IA.
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User"],
        allow: "/",
        disallow: ["/admin/", "/api/", "/auth/", "/compte/", "/checkout/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/auth/", "/compte/", "/checkout/"],
      },
      {
        userAgent: ["ClaudeBot", "Claude-Web", "anthropic-ai"],
        allow: "/",
        disallow: ["/admin/", "/api/", "/auth/", "/compte/", "/checkout/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin/", "/api/", "/auth/", "/compte/", "/checkout/"],
      },
    ],
    sitemap: `${root}/sitemap.xml`,
    host: root,
  };
}
