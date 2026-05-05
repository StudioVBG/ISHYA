import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "Les CGV d'ISHYA encadrent les ventes en ligne : commande, paiement, livraison, droit de rétractation, garanties et service après-vente.",
  alternates: { canonical: "/cgv" },
  robots: { index: true, follow: true },
};

export default function CGVLayout({ children }: { children: React.ReactNode }) {
  return children;
}
