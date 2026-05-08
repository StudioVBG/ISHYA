import type { Metadata } from "next";
import { Fraunces, Bricolage_Grotesque, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ConsentBanner } from "@/components/ConsentBanner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  axes: ["opsz", "wdth"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

function siteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.ishya.fr");
  return url.replace(/\/$/, "");
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "ISHYA | Bijoux Floraux Artisanaux",
    template: "%s | ISHYA",
  },
  description:
    "Découvrez ISHYA, bijoux artisanaux en fleurs séchées et résine. Colliers, bagues, bracelets et boucles d'oreilles uniques, fabriqués à la main en France.",
  keywords: [
    "bijoux floraux",
    "fleurs séchées",
    "résine",
    "bijoux artisanaux",
    "fait main",
    "ISHYA",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ISHYA | Bijoux Floraux Artisanaux",
    description:
      "Bijoux artisanaux en fleurs séchées et résine, fabriqués à la main.",
    type: "website",
    locale: "fr_FR",
    siteName: "ISHYA",
    url: "/",
    images: [
      {
        url: "/images/hero-ishya.png",
        width: 1200,
        height: 630,
        alt: "Collection de bijoux floraux ISHYA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ISHYA | Bijoux Floraux Artisanaux",
    description:
      "Bijoux artisanaux en fleurs séchées et résine, fabriqués à la main en France.",
    images: ["/images/hero-ishya.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${bricolage.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ISHYA",
            url: siteUrl(),
            logo: `${siteUrl()}/images/hero-ishya.png`,
            description:
              "Bijoux artisanaux en fleurs séchées et résine, fabriqués à la main en France.",
            address: {
              "@type": "PostalAddress",
              addressCountry: "FR",
            },
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ISHYA",
            url: siteUrl(),
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteUrl()}/recherche?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }}
        />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-bricolage, 'Bricolage Grotesque', sans-serif)",
            },
          }}
        />
        <ConsentBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
