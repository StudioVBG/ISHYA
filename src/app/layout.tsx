import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
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
  openGraph: {
    title: "ISHYA | Bijoux Floraux Artisanaux",
    description:
      "Bijoux artisanaux en fleurs séchées et résine, fabriqués à la main.",
    type: "website",
    locale: "fr_FR",
    siteName: "ISHYA",
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
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            },
          }}
        />
      </body>
    </html>
  );
}
