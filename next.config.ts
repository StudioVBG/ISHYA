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
