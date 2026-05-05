import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Livraison — Délais, tarifs et modes d'expédition",
  description:
    "Tous les détails sur la livraison ISHYA : délais, tarifs, livraison offerte dès 60 €, suivi colis et expéditions internationales.",
  alternates: { canonical: "/livraison" },
};

export default function LivraisonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
