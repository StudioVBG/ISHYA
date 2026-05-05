import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "jbgfogmjodepfyfrjvna.supabase.co" },
    ],
  },
  async redirects() {
    return [
      // Anciennes pages liste -> /boutique unifiée avec filtres
      {
        source: "/best-sellers",
        destination: "/boutique?badge=best-seller",
        permanent: true,
      },
      {
        source: "/nouveautes",
        destination: "/boutique?badge=nouveau",
        permanent: true,
      },
      {
        source: "/promotions",
        destination: "/boutique?badge=promo",
        permanent: true,
      },
      {
        source: "/idees-cadeaux",
        destination: "/boutique?max=30",
        permanent: true,
      },
      {
        source: "/recherche",
        destination: "/boutique",
        permanent: true,
      },
      {
        source: "/collections",
        destination: "/boutique",
        permanent: true,
      },
      {
        source: "/collections/:slug",
        destination: "/boutique?collection=:slug",
        permanent: true,
      },
      {
        source: "/boutique/:categorie",
        destination: "/boutique?categorie=:categorie",
        permanent: true,
      },
      // FAQ catégories : /aide/[slug] supprimé, on redirige vers la page
      // dédiée quand elle existe, sinon vers /aide#<slug>.
      { source: "/aide/livraison", destination: "/livraison", permanent: true },
      { source: "/aide/retours", destination: "/retours", permanent: true },
      { source: "/aide/entretien", destination: "/entretien", permanent: true },
      { source: "/aide/materiaux", destination: "/materiaux", permanent: true },
      {
        source: "/aide/programme-fidelite",
        destination: "/programme-fidelite",
        permanent: true,
      },
      {
        source: "/aide/tailles",
        destination: "/guide-des-tailles",
        permanent: true,
      },
      // Catégories restantes (paiement, personnalisation, etc.) → ancre dans /aide
      { source: "/aide/:slug", destination: "/aide#:slug", permanent: true },
    ];
  },
};

const sentryEnabled = Boolean(
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      sourcemaps: { disable: false },
      disableLogger: true,
    })
  : nextConfig;
